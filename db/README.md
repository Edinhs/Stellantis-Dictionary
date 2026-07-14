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
