-- Stellantis-Dictionary — inicialização do Postgres (executado UMA vez, na
-- criação do volume, por /docker-entrypoint-initdb.d).
--
-- Objetivo desta entrega (T06 / devops-baseline): garantir que a extensão
-- pgvector esteja disponível no banco da aplicação. O schema em si (tabelas)
-- é responsabilidade das MIGRAÇÕES versionadas em db/migrations/ (doc 13 §6.3),
-- NÃO deste script de init.
--
-- Idempotente: seguro reexecutar.

CREATE EXTENSION IF NOT EXISTS vector;

-- Nota: nenhuma senha/segredo aqui. Usuário e banco vêm das variáveis
-- POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB (arquivo .env), consumidas
-- pela própria imagem oficial do Postgres.
