# SPEC — Aba "Comunidade" (Q&A)

Status: **rascunho para validação**. Deriva do PDR `10-comunidade-qa-pdr.md` e
segue os princípios de extensibilidade da SPEC `08` (§0) e o modelo de cargos
da SPEC `09`. Só planejamento; nada implementado.

## 1. Escopo e UX

Aba **"Comunidade"** = Q&A estilo Stack Overflow / Discourse, para usuários
autenticados. Conteúdo de **moderação leve** (ver PDR `10` §2).

### Telas
1. **Lista** (`/comunidade`): cards com título, trecho, autor, contadores
   (votos, respostas, visualizações), tags, status, tempo. Ordenação: Recentes
   (default) · Sem resposta · Mais votadas · Ativas. Filtros por tag /
   `term_slug` / setor. Busca (full-text do Postgres; embeddings na fase RAG).
2. **Perguntar** (`/comunidade/perguntar`): título, corpo (Markdown + preview),
   tags. **Anti-duplicata**: ao digitar o título, mostrar perguntas similares em
   tempo real. Sugestão de tag a partir de `term_slug` detectados no texto.
3. **Detalhe** (`/comunidade/{id}/{slug}`): pergunta + comentários; respostas
   ordenadas por **aceita primeiro**, depois score; ações por permissão (votar,
   responder, comentar, aceitar, editar, reportar, moderar). Bloco lateral
   **reusado** "Especialistas deste componente" quando há `term_slug` (rota de
   `08`). Perguntas relacionadas (mesmas tags / `term_slug`).

Regras transversais: `slug` estável derivado do título; Markdown **sanitizado**
(XSS); optimistic UI em votos confirmado pela API.

## 2. Papéis e permissões

Autorização por permissões nomeadas (prefixo `qa.*`), resolvidas por cargo via
`can(user, permission)` — nunca `if role ==`. Permissões: `qa.ask`, `qa.answer`,
`qa.comment`, `qa.vote`, `qa.accept_answer`, `qa.edit_own`, `qa.edit_any`,
`qa.moderate`, `qa.tag`, `qa.tag_manage`.

| Ação | `user` | `coordinator` | `admin` |
|---|---|---|---|
| Perguntar (`qa.ask`) | ✅ direto | ✅ | ✅ |
| Responder (`qa.answer`) | ✅ direto | ✅ | ✅ |
| Comentar (`qa.comment`) | ✅ direto | ✅ | ✅ |
| Votar (`qa.vote`) | ✅ (não no próprio) | ✅ | ✅ |
| Aceitar resposta (`qa.accept_answer`) | ✅ só na **própria** pergunta | ✅ qualquer | ✅ qualquer |
| Editar próprio (`qa.edit_own`) | ✅ (versionado) | ✅ | ✅ |
| Editar qualquer (`qa.edit_any`) | ❌ | ✅ | ✅ |
| Moderar: ocultar/fechar/reabrir/excluir (`qa.moderate`) | ❌ (só **reportar**) | ✅ | ✅ |
| Aplicar tags existentes (`qa.tag`) | ✅ | ✅ | ✅ |
| Criar/renomear/fundir tags (`qa.tag_manage`) | ❌ | ✅ | ✅ |

Notas:
- **Moderação leve**: `user` publica direto (sem fila propor-e-aprovar);
  controle reativo (reportar + moderar depois).
- **Editar próprio**: gravado direto, registrando `content_revisions` (reuso).
- **Excluir** é sempre **soft-delete** (`deleted_at`), nunca físico.
- Ações de moderação gravam em `audit_log` (quem, o quê, alvo, motivo).
- **Criar tag nova** restrito a coordinator/admin evita explosão de tags; `user`
  só aplica existentes (pode sugerir via `metadata`).

## 3. Modelo de dados

Convenções de `02-spec.md` §4 + extensibilidade (`metadata jsonb` + timestamps;
elos por `slug`/`term_slug`; soft-delete via `deleted_at`).

```
questions (
  id, slug unique, title, body,              -- body em Markdown
  author_id fk users(id),
  status text default 'open',                -- open|answered|resolved|closed|duplicate
  accepted_answer_id uuid null,              -- desnormalização p/ leitura
  score int default 0,                       -- cache da soma de qa_votes
  answer_count int default 0, view_count int default 0,
  duplicate_of_id uuid null fk questions(id),
  closed_reason text null,                   -- duplicate|off_topic|resolved|spam|...
  metadata jsonb, created_at, updated_at, deleted_at
)

answers (
  id, question_id fk questions(id), body, author_id fk users(id),
  score int default 0, is_accepted bool default false,
  metadata jsonb, created_at, updated_at, deleted_at
)

qa_comments (
  id, parent_type text,                      -- 'question' | 'answer' (polimórfico)
  parent_id uuid, body, author_id fk users(id),
  metadata jsonb, created_at, updated_at, deleted_at
)

qa_votes (
  id, target_type text,                      -- 'question' | 'answer'
  target_id uuid, user_id fk users(id), value smallint,  -- +1|-1
  created_at, unique(target_type, target_id, user_id)    -- 1 voto por alvo
)

tags (
  id, slug unique, label,
  term_slug text null,                       -- FK-lógica terms(slug) quando a tag é um termo
  kind text default 'free',                  -- 'term'|'workflow'|'free'
  metadata jsonb, created_at, updated_at
)
question_tags ( question_id, tag_id, primary key(question_id, tag_id) )

qa_reports (
  id, target_type, target_id, reporter_id fk users(id),
  reason text,                               -- spam|duplicate|offensive|low_quality
  status text default 'open',                -- open|actioned|dismissed
  metadata jsonb, created_at, resolved_at, resolved_by
)
```

Decisões de modelagem:
- **`score`/`answer_count` são caches** (verdade = `qa_votes`/`answers`);
  atualização transacional/trigger + job de reconciliação.
- **`accepted_answer_id` + `is_accepted`**: dupla escrita transacional; no
  máximo uma resposta aceita por pergunta.
- **Comentários polimórficos** (`parent_type`+`parent_id`): simplicidade sobre
  FK estrita, dado volume baixo (simétrico a `qa_votes`).
- **Tags reusam `slug`**: com `term_slug` preenchido, a tag **é** o termo — a UI
  linka o verbete e o bloco de especialistas (single-source-of-truth de `08`).
  Workflows via `kind='workflow'` + `metadata.workflow_slug`, sem coluna nova.
- **Sem reputação no MVP** (gancho aditivo: `qa_votes` já é a matéria-prima).
- Índices: `questions(status, updated_at)`, `questions(deleted_at)`,
  `answers(question_id)`, `qa_votes(target_type, target_id)`,
  `question_tags(tag_id)`, `tags(term_slug)`.

Reuso de tabelas já planejadas (SPEC `09`):
- `content_revisions` → histórico de edições de pergunta/resposta.
- `audit_log` → ações de moderação e mudanças de status.
- `contributions` → **não** no caminho normal do Q&A; só na **promoção** de uma
  resposta a conteúdo canônico (§4).

## 4. Integração (linkar por slug, não duplicar)

1. **Dicionário (MVP)**: pergunta com tag `term_slug` aparece no verbete —
   bloco "Perguntas da comunidade sobre este termo".
2. **Especialistas (MVP leve)**: na pergunta com `term_slug`, mostrar
   especialistas do componente (reuso da rota de `08`) + CTA "Notificar
   especialista" (no MVP, exibir contato; e-mail/Teams em fase posterior).
3. **Workflows (posterior)**: tag `kind='workflow'`, recíproco na página do
   workflow; aditivo, sem schema novo.
4. **RAG (faseado)**:
   - **Fase A (MVP+)**: "**pergunte à IA primeiro**" — rodar a pergunta pelo RAG
     antes de publicar, mostrando resposta + fontes (reduz duplicatas).
   - **Fase B**: respostas **aceitas** (`status='resolved'`) viram fonte
     recuperável — embedding do par pergunta+resposta em `document_chunks`
     (`source_type='qa'`, `source_ref=question.id`). **Só conteúdo curado entra
     no índice** (evita alucinação — risco do PDR).
5. **Promoção a canônico**: ação de coordinator/admin "transformar em
   verbete/workflow" pré-preenche uma `contribution` (fluxo moderado da `09`)
   com `metadata.source_question_id`.

## 5. Moderação, qualidade e anti-abuso (reativo pós-publicação)

- **Reportar** (qualquer `user`) → `qa_reports` → fila para coordinator/admin.
  Auto-ocultar temporário ao atingir N reports distintos (configurável) até
  revisão.
- **Duplicatas**: sugestão de similares ao perguntar + ação "marcar como
  duplicata de" (`status='duplicate'`, `duplicate_of_id`), redirecionando a UI.
- **Fechar/reabrir**: `status='closed'` + `closed_reason`; fechada não aceita
  respostas novas mas continua legível.
- **Soft-delete** sempre; conteúdo some da UI mas fica auditável.
- **Anti-abuso técnico** (reusa `02-spec.md` §3.6): rate-limit em
  criar/responder/votar/reportar; sanitização de Markdown; sem auto-voto
  (constraint); um voto por alvo (unique).
- **Reputação/pontos — FORA do MVP**: gamificação traz complexidade e risco de
  gaming/toxicidade em time pequeno. Manter o gancho pronto (`qa_votes` +
  eventual `qa_reputation` aditiva); introduzir só com escala. "Resposta aceita"
  + score já são sinal de qualidade suficiente.

## 6. Extensibilidade, faseamento e trade-offs

Faseamento: **MVP (Q&A-1)** → **Q&A-2** (notificação real, RAG das aceitas,
promoção a canônico, busca semântica) → **Q&A-3** (reputação/badges se
justificado, workflows, digests/subscrições). Detalhe no PDR `10` §5.

Ganchos de extensão (padrão `08` §8): `(target_type, target_id)` polimórfico
para votos/comentários; `tags.kind` + `term_slug` para novos tipos de tag;
`metadata jsonb` para campos futuros; novas ligações no padrão
`(question_id, alvo_slug, metadata)`.

Trade-offs assumidos: moderação reativa (não preventiva) para maximizar
participação; comentários polimórficos (simplicidade sobre FK estrita); caches
desnormalizados (leitura barata, com reconciliação); reputação adiada.

Cabe no Docker Compose e no stack existente (Node/TS + Postgres/pgvector), sem
serviço novo no MVP.

## 7. Perguntas em aberto (herdadas do PDR `10`)
1. Notificação a especialista no MVP: só exibir contato ou já e-mail/Teams?
2. Reputação: entra em fase planejada ou fica indefinida até haver escala?
3. "Pergunte à IA primeiro": obrigatório antes de publicar ou opcional?
