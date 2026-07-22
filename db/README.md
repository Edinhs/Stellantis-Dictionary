# db — Migrações versionadas

Convenção: `db/migrations/NNNN-descricao-em-kebab.sql`, número sequencial de 4
dígitos, **nunca reutilizado nem reescrito** depois de aplicado (mudança = nova
migração). Trilha auditável da evolução do schema e reprodutibilidade entre
ambientes. Ver `docs/13-arquitetura-modular.md` §6.3.

Regras (SPECs `08`/`09`):
- Toda tabela nova nasce com `metadata jsonb` + `created_at`/`updated_at`.
- `audit_log` é append-only; soft delete (`deleted_at`/`active`) onde as SPECs
  pedem.
- A extensão `pgvector` é habilitada na inicialização do Postgres (ver `docker/`).

## Etapa 9 — schema do MVP (D20)

`0001` a `0007` implementam o escopo do MVP (PDR `03` D20: núcleo — dicionário,
RAG/embeddings, cockpit 3D, auth/RBAC, cocriação/histórico/auditoria — mais
Componentes de Infotainment e Projetos veiculares). Organograma, especialistas,
Notebook, Gamificação, Canais/Kit e Automações **não** têm tabelas aqui —
ficam fora do MVP (doc `03` D20; nota em doc `25` §3.1). Detalhe de decisões de
modelagem em comentário na própria migração (ex.: por que `terms.category` é
`CHECK` fixo, por que `document_chunks` é polimórfico, por que `projects`
mantém `platform`/`motorization` nulos).
