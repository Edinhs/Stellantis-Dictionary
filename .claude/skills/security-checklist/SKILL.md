---
name: security-checklist
description: Checklist de revisão de segurança (OWASP/ASVS + regras do projeto) a aplicar em TODA entrega/PR do Stellantis-Dictionary antes de fechar uma fase. Use ao revisar diffs/planos que toquem em autenticação, cargos/permissões (RBAC, role.assign), dados de pessoas/especialistas (LGPD), contribuições/moderação, audit_log, segredos/env vars, rotas de API, chat/RAG ou Q&A da comunidade. Também use para produzir parecer de segurança por severidade antes de considerar qualquer tarefa concluída.
---

# Security Checklist — Stellantis-Dictionary

Revisão **defensiva** aplicada a cada entrega/PR. Referências: SPEC `02` §3.6/§5,
SPEC `09` §3/§7, SPEC `11` §5. Segurança é requisito de primeira classe (PDR D3).

## Como usar
1. Leia o diff/plano e mapeie qual superfície ele toca (auth, RBAC, dados
   pessoais, contribuição, chat/RAG, Q&A, infra).
2. Percorra as seções abaixo relevantes; marque cada item OK / FALHA / N/A.
3. Produza um **parecer por severidade** (Crítico / Alto / Médio / Baixo /
   Informativo) com achado + correção recomendada + arquivo:linha.
4. Uma fase só "fecha" após de-acordo. Não altere código — recomende a correção.

Severidade: **Crítico** = escalonamento de privilégio, vazamento de dado pessoal,
segredo commitado, authz ausente. **Alto** = SQLi/XSS explorável, falta de rate
limit em auth, audit_log ausente em ação sensível.

## 1. Autorização / RBAC e permissões nomeadas (SPEC 09 §3)
- [ ] Toda checagem usa o resolvedor central `can(user, 'perm')` — **nunca**
      `if user.role === 'admin'` espalhado pelo código.
- [ ] Permissão nomeada correta por área: `dictionary.*`, `workflow.*`,
      `specialist.approve`, `role.assign`, `qa.*`.
- [ ] Authz aplicada **no backend** em toda rota mutadora — esconder botão no
      frontend não é controle. Checar authz antes de qualquer efeito colateral.
- [ ] Sem IDOR: o objeto pertence ao usuário / o cargo permite agir sobre ele
      (ex.: `qa.accept_answer` só na própria pergunta para `user`).
- [ ] `deny by default`: rota sem permissão declarada nega, não libera.

### 1.1 Atribuição de cargos — anti-escalonamento (SPEC 09 §3, requisito central)
- [ ] Só `coordinator`/`admin` atribuem/alteram cargos (`role.assign`).
- [ ] `coordinator` **não** promove ninguém a `admin` nem edita um `admin`.
- [ ] **Ninguém** altera o próprio cargo (checar `actor_id != target_user_id`).
- [ ] Toda mudança de cargo grava em `audit_log` (actor, before/after, ip).
- [ ] Enum de cargo validado no servidor (`user|coordinator|admin`); rejeitar
      valor arbitrário vindo do cliente (mass assignment em `users.role`).

## 2. LGPD / dados pessoais (SPEC 09 §7, SPEC 02)
- [ ] Dados de `people`/contatos (diretório de especialistas) só a **autenticados**
      — nenhuma rota pública expõe pessoa/contato.
- [ ] Área de especialistas **sempre moderada**: proposta sobre `people` sempre
      exige aprovação, **inclusive** de `coordinator` (SPEC 09 §3 nota 1).
- [ ] Exclusão de pessoa/termo/workflow = **soft delete** (`active=false` /
      `deleted_at`), não DELETE físico. Hard delete só `admin` onde previsto.
- [ ] Minimização: resposta da API não vaza campos pessoais além do necessário
      (sem `email`/`password_hash`/PII em payloads de listagem).
- [ ] Logs e `audit_log` não gravam PII sensível em texto livre além do escopo.

## 3. Contribuição, moderação e auditoria (SPEC 09 §4/§6, SPEC 11 §5)
- [ ] Proposta de `user` entra como `pending` e **não** afeta conteúdo público
      antes de aprovação (fluxo propor-e-aprovar).
- [ ] Aplicação de `payload` na aprovação valida/saneia o conteúdo (não confia no
      payload da contribuição cru).
- [ ] Ações sensíveis (aprovar/rejeitar/excluir/moderar/mudar status) gravam
      `audit_log` com actor, alvo, before/after e motivo.
- [ ] `audit_log` é **append-only**: sem UPDATE/DELETE; revogar grants de
      escrita/edição na tabela; nenhuma rota permite editar histórico.
- [ ] `content_revisions` nunca apaga histórico; rollback = nova revisão.

## 4. Injeção e sanitização (SPEC 02 §3.6, SPEC 11 §5)
- [ ] SQL sempre parametrizado / query builder — nenhuma concatenação de input
      em SQL. Atenção a `ORDER BY`/filtros dinâmicos e ao `pgvector`.
- [ ] XSS: Markdown do Q&A e de descrições **sanitizado** no render (allow-list;
      sem `innerHTML` cru). Preview usa o mesmo saneamento do salvamento.
- [ ] Validação de schema em toda entrada (tipos, tamanho, enum) no servidor;
      rejeitar campos não esperados (evita mass assignment).
- [ ] `slug` derivado no servidor e validado (`^[a-z0-9-]+$`); não confiar no
      cliente para `term_slug`/`slug`.
- [ ] Upload (fase 2): validar tipo/tamanho, não confiar no `Content-Type` do
      cliente, armazenar fora da raiz web.

## 5. Autenticação e sessão (SPEC 02 §3.1)
- [ ] Senha com hash `argon2`/`bcrypt` — nunca texto/hash reversível.
- [ ] JWT: segredo forte via env; `exp` curto no access token; refresh token em
      cookie `httpOnly` + `secure` + `sameSite=strict`.
- [ ] Assinatura JWT verificada em toda rota protegida; algoritmo fixado (sem
      `alg:none`); sem confiar em claims de cargo sem revalidar no servidor.
- [ ] Mensagens de erro de login genéricas (sem revelar se e-mail existe).

## 6. Rate limiting e anti-abuso (SPEC 02 §3.6, SPEC 11 §5)
- [ ] Rate limit em rotas de **auth** (login/registro/refresh) — anti brute-force.
- [ ] Rate limit no **chat/RAG** (custo LLM) e em criar/responder/votar/reportar
      no Q&A.
- [ ] Q&A: sem auto-voto (constraint); um voto por alvo (unique
      `target_type,target_id,user_id`); auto-ocultar por N reports.

## 7. Segredos e configuração (SPEC 02 §3.6)
- [ ] Nenhum segredo hardcoded/commitado: API keys de LLM, segredo JWT, credencial
      de DB só via variável de ambiente / secret manager.
- [ ] `.env` no `.gitignore`; existe `.env.example` sem valores reais.
- [ ] Varredura do diff por chaves (`sk-`, `AKIA`, `-----BEGIN`, `password=`,
      tokens). Delegar varredura ampla a sub-agente quando o diff for grande.
- [ ] Sem segredo em log, mensagem de erro ou resposta de API.

## 8. Transporte, RAG e observabilidade (SPEC 02 §3.4/§3.6/§5)
- [ ] HTTPS/TLS obrigatório; cookies `secure`; sem downgrade para HTTP.
- [ ] RAG só indexa conteúdo curado (respostas `resolved`); guardrail contra
      prompt injection do conteúdo recuperado; resposta cita fontes.
- [ ] Chat não vaza contexto de outro usuário/conversa; histórico isolado por
      `user_id`.
- [ ] `.glb`/assets 3D não embarcam dado confidencial; sem execução de código
      externo (SPEC 02 §3.5).
- [ ] Health-check não expõe versões/segredos; logs estruturados sem PII/segredo.

## Formato do parecer (saída)
```
Parecer de Segurança — <entrega/PR>
Escopo revisado: <arquivos/áreas>
Achados:
  [CRÍTICO] <achado> — arquivo:linha — Correção: <ação>
  [ALTO]    ...
  [MÉDIO]   ...
De-acordo: SIM / NÃO (bloqueia fecho da fase) — <condições>
```
