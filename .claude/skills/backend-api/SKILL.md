---
name: backend-api
description: >-
  Use ao criar ou revisar rotas HTTP da API do Stellantis-Dictionary (Node.js +
  TypeScript, Fastify/Express). Aplica quando o trabalho envolve endpoints REST,
  validação de entrada, autenticação JWT (access + refresh em cookie httpOnly),
  autorização por permissões nomeadas via can(user, permission), rate limiting,
  paginação, formato de erro ou o contrato de qualquer rota /api/*. Gatilhos:
  "nova rota", "endpoint", "validar payload", "checar permissão", "login/refresh",
  "middleware de auth", "proteger rota".
---

# Backend API — padrões do Stellantis-Dictionary

Fonte da verdade: `docs/02-spec.md` (§3.1, §3.6), `docs/09-...cargos-spec.md`
(§2.1, §3, §7), `docs/08-...spec.md` (§4, §6), `docs/11-comunidade-qa-spec.md` (§2).

## Princípios não-negociáveis

1. **Autorização SEMPRE por permissão nomeada.** Nunca `if (user.role === 'admin')`.
   Chame o resolvedor central `can(user, 'dictionary.approve')`. Adicionar um 4º
   cargo deve ser linha em `role_permissions`, não deploy de código.
2. **Contrato antes de implementar.** A forma de request/response é definida pelo
   Eng-Lead antes de frontend e backend divergirem. Não mude shape de resposta sem
   atualizar o contrato.
3. **Nada de segredo hardcoded.** `JWT_SECRET`, chaves de LLM, `DATABASE_URL` só via
   env. Falhe no boot se faltar env obrigatória (fail-fast).
4. **Toda entrada sanitizada/validada** no limite da rota (schema), antes de tocar
   o banco. Queries sempre parametrizadas (nunca string concat) — anti-SQLi.

## Estrutura de uma rota

```
route (schema de validação) → auth middleware (verifica JWT) →
authorize('permission.name') → handler (regra de negócio) → serializer
```

- **Validação**: schema declarativo (Zod/TypeBox/JSON-Schema do Fastify) em body,
  params e query. Rejeite campos desconhecidos (`additionalProperties: false`).
- **Nunca confie no client** para `role`, `author_id`, `status`. Derive do token
  ou do servidor. `created_by`/`author_id` = `req.user.id`, jamais do body.

## Autenticação (JWT)

- Access token curto (ex. 15 min) no header `Authorization: Bearer`.
- Refresh token em cookie `httpOnly`, `secure`, `sameSite=strict`; rota
  `POST /api/auth/refresh` para rotacionar. Logout invalida o refresh.
- Senha com `argon2` (preferido) ou `bcrypt`. Nunca logar senha nem token.
- Cadastro cria usuário com `role='user'` por padrão — o client não escolhe cargo.

## Autorização — o resolvedor `can()`

- Assinatura: `can(user, permission): boolean`, resolvendo por `role_permissions`
  (cargo → permissões). Middleware `authorize(perm)` retorna 403 se `!can`.
- Permissões por domínio (prefixadas): `dictionary.*`, `workflow.*`,
  `specialist.*`, `role.assign`, `qa.*` (ask/answer/vote/accept_answer/edit_own/
  edit_any/moderate/tag/tag_manage). Ver matrizes em SPEC 09 §3 e 11 §2.
- **Regras contextuais** que a permissão sozinha não cobre (verificar no handler):
  - `qa.vote`: proibir auto-voto (não votar no próprio conteúdo).
  - `qa.accept_answer`: `user` só na **própria** pergunta; coord/admin em qualquer.
  - `role.assign` (anti-escalonamento, SPEC 09 §3): `coordinator` só troca
    `user ↔ coordinator`, nunca cria/edita `admin`; ninguém altera o **próprio**
    cargo; toda troca grava `audit_log` (actor, before, after).

## Fluxo de contribuição (SPEC 09 §4)

- `user` propõe → cria `contributions` (status `pending`), **não** altera conteúdo
  público. `coordinator`/`admin` editam direto (gravam `content_revisions`).
- **Exceção LGPD**: contribuição sobre `people` é **sempre** moderada, mesmo de
  coordinator. Trate `target_type='person'` como caminho moderado obrigatório.
- Aprovar = aplicar `payload` à entidade + criar `content_revisions` + marcar
  `reviewed_by/reviewed_at`. Rejeitar exige `review_note`.

## Rotas de dados pessoais (diretório, SPEC 08 §4/§6)

- **Todas** as rotas `/api/diretorio/*` exigem autenticação (dados pessoais LGPD).
  Nunca públicas, nunca em cache anônimo. Rate limit na busca.

## Convenções transversais

- **Erros**: formato uniforme `{ error: { code, message, details? } }`. Use
  400 (validação), 401 (sem/expirado token), 403 (sem permissão), 404, 409
  (conflito), 429 (rate limit). Nunca vaze stack/SQL ao client.
- **Rate limiting** obrigatório em `auth` (login/refresh/registro) e `chat`, e em
  criar/responder/votar/reportar do Q&A (SPEC 11 §5).
- **Soft-delete**: DELETE em `terms`/`workflows`/Q&A é `deleted_at`/`active=false`,
  nunca físico (hard delete só `admin` e só onde previsto). Filtre `deleted_at IS
  NULL` nas leituras.
- **Paginação** por cursor ou limit/offset com teto (ex. max 100). Nunca retorne
  tabela inteira sem limite.
- **Logs estruturados** sem PII/segredos em texto livre; `/health` para health-check.
- `metadata jsonb` e elo por `slug` presentes nas entidades — exponha-os sem
  quebrar o contrato ao adicionar campos (aditivo, não destrutivo).

## Checklist antes de entregar uma rota

- [ ] Schema de validação em body/params/query; rejeita campos extras.
- [ ] `authorize('perm')` com a permissão certa; regras contextuais no handler.
- [ ] `author_id/created_by` do token, não do body.
- [ ] Query parametrizada; filtro `deleted_at IS NULL` onde aplica.
- [ ] Ação sensível (cargo, moderação, delete) grava `audit_log`.
- [ ] Erros no formato padrão; sem vazar detalhes internos.
- [ ] Rate limit se for auth/chat/escrita de Q&A.
- [ ] Contrato de resposta bate com o acordado com o frontend.
- [ ] Nenhum segredo no código; envs validadas no boot.
- [ ] Entrega enviada a QA Lead; se toca dados/auth, também a Segurança Lead.
