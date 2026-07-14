---
name: db-schema
description: >-
  Use ao projetar tabelas, escrever migrações SQL, definir índices ou colunas de
  embedding no PostgreSQL + pgvector do Stellantis-Dictionary. Aplica a qualquer
  nova tabela/coluna, soft-delete, metadata jsonb, elos por slug/term_slug,
  histórico (contributions/content_revisions/audit_log) e busca vetorial. Gatilhos:
  "migração", "nova tabela", "coluna embedding", "índice", "schema", "pgvector",
  "soft delete", "seed/semente".
---

# DB Schema — convenções Postgres + pgvector

Fonte da verdade: `docs/02-spec.md` (§4), `docs/08-...spec.md` (§0, §3),
`docs/09-...cargos-spec.md` (§6), `docs/11-comunidade-qa-spec.md` (§3).

## Regras de extensibilidade (SPEC 08 §0) — obrigatórias em TODA tabela nova

1. **`metadata jsonb`** em toda entidade nova (default `'{}'::jsonb`). Guarda
   atributos ainda não previstos sem migração; vira coluna só quando "oficializar".
2. **Elo por `slug`/`term_slug`**, nunca por texto duplicado. `slug` estável e
   `unique`. Componentes/termos ligam por `term_slug` que referencia `terms.slug`.
3. **`target_type` polimórfico** para histórico e ligações — qualquer área nova
   (`term`, `workflow`, `person`, `sector`, `question`, `answer`, ...) entra no
   mesmo fluxo de contribuição/revisão/auditoria sem novas tabelas de histórico.
4. **`created_at` + `updated_at`** (`timestamptz`) em toda tabela.

## Convenções de coluna

- PK `uuid` (default `gen_random_uuid()` via pgcrypto). Evite serial exposto.
- `role` é enum textual: `'user' | 'coordinator' | 'admin'`, default `'user'`.
- Timestamps sempre `timestamptz` (UTC), nunca `timestamp` sem tz.
- FKs explícitas com `ON DELETE` pensado; para `term_slug` no MVP (seeds JSON) é
  FK **lógica** — validar na carga; virar FK real quando houver CRUD.
- Snapshot/estado proposto em `jsonb` (`contributions.payload`,
  `content_revisions.snapshot`).

## Soft-delete (SPEC 09 §6.5, SPEC 11 §2)

- `terms`, `workflows` e todo o Q&A (`questions`, `answers`, `qa_comments`) usam
  `deleted_at timestamptz null`. `people` usa `active boolean`.
- Coordenador exclui via soft-delete; hard delete só `admin` e só onde previsto.
- **Todas as leituras filtram `deleted_at IS NULL`** (ou `active=true`). Considere
  índice parcial `WHERE deleted_at IS NULL`.

## Histórico e auditoria (SPEC 09 §6) — reusar, não duplicar

- `contributions` (fila de propostas, polimórfica por `target_type`/`target_id`).
- `content_revisions`: snapshot COMPLETO da entidade após cada mudança;
  `revision_number` sequencial por `(target_type, target_id)`. Rollback = nova
  revisão com snapshot antigo (nunca apaga). Reusado também pelo Q&A (edições).
- `audit_log`: **append-only**, responde "quem fez e quando" (mudança de cargo,
  aprovação, delete, moderação). Nunca UPDATE/DELETE nele.
- `role_permissions (role, permission)` é **dado semente**, editável sem migração.
  Não modele cargos dinâmicos (roles/user_roles) agora — abordagem B é fase 4.

## pgvector / embeddings (SPEC 02 §3.3-3.4, SPEC 11 §4)

- Extensão: `CREATE EXTENSION IF NOT EXISTS vector;` numa migração inicial.
- `document_chunks(id, document_id, content, embedding vector(N), source_type,
  source_ref, metadata, created_at)`. Fixe a dimensão `N` conforme o modelo de
  embedding do adapter (documente qual). Trocar de modelo = nova coluna/migração.
- **Só conteúdo curado entra no índice** (anti-alucinação, risco do PDR): termos,
  workflows publicados e respostas de Q&A **aceitas** (`source_type='qa'`,
  `source_ref=question.id`). Nunca indexe rascunho/pendente/reportado.
- Índice ANN: `ivfflat`/`hnsw` sobre `embedding` com o operador da métrica usada
  (ex. `vector_cosine_ops`). Crie o índice após carga inicial; ajuste `lists`.

## Índices previstos (criar junto do schema)

- `contributions(status, target_type)` — fila de moderação.
- `content_revisions(target_type, target_id, revision_number)`.
- `audit_log(actor_id, created_at)`.
- Diretório: `terms(slug)`, `component_specialists(term_slug)`, `people(sector_id)`.
- Q&A: `questions(status, updated_at)`, `questions(deleted_at)`,
  `answers(question_id)`, `qa_votes(target_type, target_id)`,
  `question_tags(tag_id)`, `tags(term_slug)`.
- `qa_votes` com `unique(target_type, target_id, user_id)` (um voto por alvo).

## Caches desnormalizados (SPEC 11 §3)

- `questions.score/answer_count/view_count` e `answers.is_accepted` são **cache**;
  a verdade é `qa_votes`/`answers`. Atualize transacionalmente (ou trigger) e
  preveja job de reconciliação. `accepted_answer_id` + `is_accepted`: dupla escrita
  transacional, no máximo uma resposta aceita por pergunta.

## Migrações

- Uma migração por mudança, versionada e reversível quando viável; nunca editar
  migração já aplicada — crie a próxima.
- Migração é **aditiva** por padrão (novas colunas nullable/com default) para não
  quebrar contrato de API. Mudança destrutiva exige aviso ao Eng-Lead + QA.
- Seeds (`seeds/diretorio.json`, `role_permissions`) separados das migrações de
  DDL; validar FKs lógicas (`term_slug` existe em `terms.slug`) na carga.

## Checklist para nova tabela/migração

- [ ] `metadata jsonb`, `created_at`, `updated_at`.
- [ ] `slug` unique se a entidade é linkável; elos por `slug`/`term_slug`.
- [ ] Soft-delete (`deleted_at`/`active`) se for conteúdo editável.
- [ ] Índices do fluxo de leitura previstos.
- [ ] Histórico via `contributions`/`content_revisions`/`audit_log` (polimórfico),
      sem tabela de histórico nova.
- [ ] Se tem embedding: dimensão fixa documentada, índice ANN, só conteúdo curado.
- [ ] Migração aditiva/reversível; não altera contrato existente sem aviso.
- [ ] Revisão de Segurança Lead se envolve dados pessoais (`people`) ou auditoria.
