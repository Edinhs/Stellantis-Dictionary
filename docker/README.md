# Ambiente local (Docker Compose)

Sobe o stack completo do Stellantis-Dictionary — **app** (backend Node/TS,
placeholder) + **db** (Postgres 16 com `pgvector`) — em qualquer máquina
(SPEC `02` §5, portabilidade). Só para desenvolvimento; **não** é produção.

> Fase atual: planejamento/esqueleto. O `app` ainda é placeholder (bootstrap do
> backend chega em T07/T08). O `db` já sobe funcional com a extensão `pgvector`.

## Pré-requisitos

- Docker + Docker Compose v2 (`docker compose`, não `docker-compose`).

## Passos

1. Na **raiz do repositório**, crie o `.env` a partir do exemplo e preencha os
   placeholders (senha do banco, segredos JWT, chave de LLM):

   ```bash
   cp .env.example .env
   # edite .env — gere segredos com: openssl rand -hex 32
   ```

   O `.env` **nunca** é commitado (está no `.gitignore`). Só `.env.example` vai
   para o repositório, com placeholders.

2. Suba o stack (a partir da pasta `docker/`):

   ```bash
   cd docker
   docker compose up --build
   ```

3. O serviço `db` roda o init de `docker/postgres/` uma única vez (na criação do
   volume), habilitando `CREATE EXTENSION IF NOT EXISTS vector`. As **tabelas**
   vêm das migrações versionadas em `db/migrations/` (doc 13 §6.3), não do init.

## Verificações

- Banco saudável:

  ```bash
  docker compose exec db pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"
  docker compose exec db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    -c "SELECT extname FROM pg_extension WHERE extname = 'vector';"
  ```

- App (quando implementado) — endpoint de readiness:

  ```bash
  curl http://localhost:${APP_PORT:-3000}/api/health
  # -> {"status":"ok"} quando app + banco OK; 503 se o banco estiver inacessível
  ```

## Operação

```bash
docker compose ps           # estado / health dos serviços
docker compose logs -f app  # logs (JSON estruturado no stdout)
docker compose down         # para os containers (mantém o volume pgdata)
docker compose down -v      # para e APAGA os dados do banco (volume pgdata)
```

## Notas de infra

- **Segredos**: sempre via `.env` (`env_file`), nunca literais no compose.
- **Porta do banco** (`POSTGRES_PORT`) é publicada no host só para dev; em
  qualquer alvo real (decisão **D6**) não deve ser exposta.
- **Hospedagem (D6 — TBD)**: este compose cobre o alvo *Docker local*. VPS e
  cloud privada entram por override/IaC quando o CEO decidir — sem tocar no
  código da app. **TLS/HTTPS é obrigatório em qualquer deploy real** (aqui, em
  `localhost`, usamos HTTP).
- Toda configuração sensível passa pela revisão do **Segurança Lead**.
- **Seeds (`../seeds/*.json`) são dados de exemplo/dev**, não conteúdo real do
  dicionário. Este compose **não** carrega seeds automaticamente. Quando um
  script de carga for implementado (backend), ele deve recusar-se a rodar se
  `NODE_ENV=production` (ver `seeds/README.md`). Nunca rodar carga de seed
  contra um alvo de deploy real (D6).
