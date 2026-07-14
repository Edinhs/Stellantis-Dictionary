---
name: qa-checklist
description: >-
  Use ao verificar qualquer entrega do Stellantis-Dictionary antes de declará-la
  "pronta": derivar critérios de aceite de uma tarefa do backlog (04-tasks) ou
  SPEC, montar plano de teste (caminho feliz + erro), testar permissões por cargo
  (user/coordinator/admin) das matrizes das SPECs 09 e 11, validar máquinas de
  estado de moderação/aprovação, e rodar a checklist de regressão. Gatilhos:
  "isso está pronto?", "verifica a entrega", "critérios de aceite", "plano de
  teste", "testar permissões", "regressão", fechamento de tarefa T## ou de fase.
---

# QA Checklist — Stellantis-Dictionary

Guia operacional do QA Lead. Objetivo único: **nenhuma entrega é "pronta" sem
comportamento exercitado contra critérios objetivos**. Ler código não é testar.

## 0. Regra de ouro (inegociável)

- Nunca escreva "verificado", "aprovado" ou "pronto" sem ter **executado** o
  comportamento e colado a **saída real** (resposta HTTP, status, corpo, print
  de tela, log). Se não deu para executar, o veredito é **BLOQUEADO / não
  verificado**, com o motivo explícito.
- Reporte com honestidade: teste que falhou ou foi **pulado** é dito com clareza
  (esperado × obtido × evidência), nunca omitido nem maquiado.
- Peça o **contrato de API / critérios** ao Engenharia Lead e ao Produto Lead
  antes de testar. Testar contra um contrato assumido gera falso positivo.

## 1. Como derivar critérios de aceite

Fonte por tarefa: linha `T##` em `docs/04-tasks.md` → SPEC de origem citada na
fase (02, 08, 09, 11). Para cada tarefa, produza uma tabela:

| ID | Critério (observável) | Como exercitar | Esperado | Obtido | Status |
|----|-----------------------|----------------|----------|--------|--------|

- Critério tem que ser **observável** (um retorno, um estado no banco, um
  elemento na tela) — não "o código faz X".
- Todo critério vira **ao menos 2 casos**: 1 feliz + 1 de erro (ver §2).
- Toda tarefa que toca cargo/permissão herda a **matriz de §3**.
- Toda tarefa que toca conteúdo comunitário herda a **máquina de estados de §4**.

Ganchos por fase (backlog):
- **T08/T09** (auth + RBAC): cadastro cria `role='user'` por default; JWT emitido
  no login; rota protegida sem token → 401; com token de cargo insuficiente → 403.
- **T10/T11** (dicionário/embeddings): CRUD de `terms` com `slug` único; slug
  derivado do título; embedding gerado para termo criado.
- **T12–T14** (RAG): resposta **cita fontes**; sem contexto relevante não
  alucina (guardrail 02-spec §3.4); histórico por usuário isolado.
- **T27–T33** (cargos/contribuição): §3 + §4 abaixo.
- **T34–T39** (Q&A): §3 (matriz `qa.*`) + §4 (moderação reativa).
- **T20–T26** (diretório/LGPD): dados pessoais só a autenticados; escrita sobre
  `people` **sempre moderada** (§4, exceção LGPD).

## 2. Caminho feliz e de erro (sempre os dois)

Para cada endpoint/fluxo, cobrir no mínimo:

- **Feliz**: entrada válida, ator autorizado → 2xx + efeito correto no banco.
- **Autenticação**: sem token / token inválido / expirado → **401**.
- **Autorização**: token válido mas cargo sem a permissão → **403** (nunca 404
  vazando existência, nem 200 executando). Ver §3.
- **Validação**: campo faltando, tipo errado, slug duplicado, corpo vazio → 4xx
  com mensagem, **sem 500**.
- **Sanitização**: Markdown/HTML com `<script>` em pergunta/resposta/termo →
  renderizado **escapado** (XSS), corpo persistido sanitizado.
- **Rate-limit**: repetir criar/responder/votar/reportar acima do limite →
  429 (02-spec §3.6; 11-spec §5).
- **Idempotência/unicidade**: 2º voto no mesmo alvo pelo mesmo usuário rejeitado
  (`unique(target_type,target_id,user_id)`); auto-voto bloqueado.
- **Borda**: soft-delete some da UI mas continua auditável; entidade deletada
  não reaparece em listagem.

## 3. Permissões por cargo (o teste que mais pega defeito)

Cargos: `user` ⊂ `coordinator` ⊂ `admin`. Autorização **sempre** via
`can(user, 'permissao.nomeada')` — se achar `if role == 'admin'` no código,
é **defeito de arquitetura** (SPEC 09 §2.1), reporte.

Para cada ação sensível, teste a linha inteira da matriz: o cargo que **pode**
(2xx + efeito) **e** os que **não podem** (403 + nenhum efeito no banco).

### 3.1 Dicionário / Workflows / Especialistas (SPEC 09 §3)
| Ação | user | coordinator | admin |
|---|---|---|---|
| Ver | ✅ | ✅ | ✅ |
| Propor (cria pendência) | ✅ | ✅ | ✅ |
| Editar direto | ❌ 403 | ✅ | ✅ |
| Aprovar/rejeitar | ❌ 403 | ✅ | ✅ |
| Excluir | ❌ 403 | ✅ soft | ✅ hard |

- **Especialistas/`people`**: proposta de `user` **sempre** exige aprovação —
  inclusive sobre dados que coordenador editaria direto em outra área (LGPD).

### 3.2 Atribuição de cargo — anti-escalonamento (SPEC 09 §3, requisito central)
Testar explicitamente cada regra com evidência:
- `user` tenta atribuir cargo a alguém → **403**.
- `coordinator` promove `user`↔`coordinator` → OK; promove alguém a `admin` →
  **403**; edita um `admin` → **403**.
- Qualquer cargo tenta **mudar o próprio** cargo → **403** (mesmo `admin`).
- `admin` atribui qualquer cargo → OK.
- **Toda** mudança de cargo gera linha em `audit_log` (actor, before, after).
  Verificar no banco, não só o 200.

### 3.3 Q&A (SPEC 11 §2 — permissões `qa.*`)
| Ação | user | coordinator | admin |
|---|---|---|---|
| Perguntar/Responder/Comentar | ✅ | ✅ | ✅ |
| Votar | ✅ (não no próprio) | ✅ | ✅ |
| Aceitar resposta | ✅ só na **própria** pergunta | ✅ qualquer | ✅ qualquer |
| Editar qualquer | ❌ 403 | ✅ | ✅ |
| Moderar (ocultar/fechar/reabrir/excluir) | ❌ (só **reportar**) | ✅ | ✅ |
| Criar/renomear/fundir tags | ❌ 403 | ✅ | ✅ |

- Ponto que engana: `user` aceita resposta **só na própria** pergunta —
  testar `user` tentando aceitar em pergunta de outro → **403**.

## 4. Moderação e aprovação — máquinas de estado

Não basta o 200: verificar a **transição de estado** e os efeitos colaterais.

### 4.1 Contribuições (SPEC 09 §4) — `pending → approved | rejected | withdrawn`
- `user` propõe → cria `contributions.status='pending'`; conteúdo público
  **não muda** (confirmar que o termo/workflow segue igual antes da aprovação).
- **approved** por revisor → payload aplicado à entidade + nova
  `content_revisions` (snapshot) + `reviewed_by`/`reviewed_at` preenchidos.
- **rejected** → exige `review_note` (rejeitar sem nota deve falhar); entidade
  intocada.
- **withdrawn** → só o **autor** cancela; outro usuário → 403.
- **coordinator/admin** editam direto (sem passar por pending), mas geram
  `content_revisions` + `audit_log`.
- **Rollback**: cria nova revisão a partir de snapshot anterior; **nunca**
  apaga histórico. Só coordinator/admin.
- **Exceção LGPD**: contribuição sobre `person` **sempre** vira pending, mesmo
  vinda de coordinator — testar esse caso.

### 4.2 Q&A — moderação reativa (SPEC 11 §5)
- Estados de pergunta: `open|answered|resolved|closed|duplicate`.
- Reportar (qualquer `user`) → cria `qa_reports.status='open'` na fila.
- Atingir **N reports distintos** → auto-ocultar temporário até revisão
  (validar o efeito, não só a contagem).
- "Marcar como duplicata" → `status='duplicate'` + `duplicate_of_id` setado.
- Fechar → `status='closed'` + `closed_reason`; **não aceita respostas novas**
  mas continua legível (testar POST de resposta em pergunta fechada → bloqueado).
- Excluir é **sempre soft-delete** (`deleted_at`); nunca físico.
- Toda ação de moderação grava `audit_log` (quem, o quê, alvo, motivo).
- Caches (`score`, `answer_count`): após votar/responder, o cache bate com a
  verdade (`qa_votes`/`answers`).

## 5. Checklist de regressão (rodar a cada fecho de fase)

Marcar item só com evidência anexada.

- [ ] Cadastro novo nasce `role='user'`.
- [ ] Login emite JWT; rota protegida sem token → 401.
- [ ] `can()` centraliza autorização (sem `if role ==` no caminho testado).
- [ ] Cada linha das matrizes §3.1 e §3.3 testada (quem pode **e** quem não pode).
- [ ] Anti-escalonamento §3.2 (5 regras) verde, com `audit_log` conferido.
- [ ] Contribuição `user` não altera conteúdo público antes de approved.
- [ ] approve gera `content_revisions`; reject exige nota; withdraw só do autor.
- [ ] Exclusão é soft-delete; conteúdo some da UI, permanece auditável.
- [ ] `people` sempre moderado (LGPD); diretório só a autenticados.
- [ ] RAG cita fontes e não alucina fora de contexto.
- [ ] Sanitização XSS em termos/perguntas/respostas.
- [ ] Rate-limit ativo em auth/chat/criar/votar/reportar.
- [ ] Slugs únicos e estáveis (termo, workflow, pergunta, tag).
- [ ] Health-check responde; logs estruturados sem segredos em texto livre.
- [ ] Nenhuma regressão nas telas do protótipo aprovado (T01–T04d).

## 6. Formato do laudo de QA (entregar assim ao lead da frente)

```
Tarefa/Feature: T## — <título>
Contrato usado: <origem — Eng Lead / SPEC ##>
Ambiente: <como foi exercitado: curl, script, UI, docker compose>

RESULTADO: APROVADO | APROVADO COM RESSALVAS | REPROVADO | BLOQUEADO
Cobertura: N critérios · N felizes · N de erro · N permissões · N moderação

Defeitos:
- [SEV] <título>
  Passos: ...
  Esperado: ... | Obtido: ... | Evidência: <saída real colada>

Pulados/não verificados: <o quê e por quê>
```

Severidade: **S1** (bloqueia/segurança/escalonamento de privilégio) · **S2**
(funcional importante) · **S3** (menor/cosmético). Defeito de permissão ou
escalonamento de privilégio é **sempre S1**.

Ao achar defeito, devolva ao lead da frente (Engenharia para bug de
implementação; Produto se o critério de aceite estiver ambíguo/faltando).
