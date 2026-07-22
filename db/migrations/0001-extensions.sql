-- Etapa 9 (Banco de Dados) — extensões necessárias ao schema de produção.
--
-- `vector` já é habilitada no init do Postgres (docker/postgres/01-init-pgvector.sql),
-- mas é repetida aqui (idempotente) para que as migrações sejam auto-contidas e
-- reprodutíveis em qualquer ambiente que não passe pelo init script do
-- container (CI, staging) — doc 13 §6.3 / db/README.md.
--
-- `pgcrypto`  → gen_random_uuid(), usado como default de PK em todas as tabelas.
-- `pg_trgm`   → índices GIN de busca textual aproximada (fallback de busca do
--               dicionário, SPEC 02 §3.2, sem depender do RAG/LLM).
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
