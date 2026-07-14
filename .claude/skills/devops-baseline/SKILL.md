---
name: devops-baseline
description: >
  Padrões de DevOps/infra do Stellantis-Dictionary. Use ao criar ou revisar
  Docker Compose local (app Node/TS + Postgres/pgvector), variáveis de ambiente
  e gestão de segredos, health-check, logs estruturados, pipeline de CI
  (lint/testes/build) ou ao discutir a estratégia de hospedagem (decisão D6,
  ainda "TBD"). Gatilhos: "docker-compose", "Dockerfile", ".env", "segredo/
  secret", "health-check", "healthz", "logs estruturados", "CI", "pipeline",
  "deploy", "hospedagem", "portabilidade".
---

# DevOps Baseline — Stellantis-Dictionary

Referência de origem: `docs/02-spec.md` §5 (requisitos não funcionais),
§3.6 (auditoria/segurança) e `docs/03-pdr.md` decisão **D6** (hospedagem em
aberto). Fase atual = planejamento: proponha config como plano; **não gere nem
comite segredos reais**. Toda config sensível passa pela revisão do Segurança Lead.

## Princípios inegociáveis

- **Segredos nunca no repo.** API keys de LLM, `JWT_SECRET`, senha do Postgres →
  só via variáveis de ambiente / secret manager. Commite apenas `.env.example`
  com placeholders. Garanta `.env` no `.gitignore`.
- **TLS/HTTPS obrigatório em qualquer deploy real.** Compose local pode usar HTTP
  em `localhost`; produção nunca.
- **Portabilidade primeiro (§5).** `docker compose up` deve subir o stack completo
  em qualquer máquina, sem passos manuais fora do documentado.
- **Hospedagem = configurável, não hard-coded (D6).** Nada no código/compose deve
  presumir on-prem vs. VPS vs. cloud. Diferenças ficam em env/override files.

## Docker Compose local

Dois serviços: `app` (Node 20 LTS + TS) e `db` (Postgres 16 + pgvector).

Padrões:
- Imagem do banco: `pgvector/pgvector:pg16` (traz a extensão pronta).
- `db` expõe `5432` só para a rede interna do compose; publique porta no host
  apenas em dev.
- Extensão + schema: script em `db/init/*.sql` montado em
  `/docker-entrypoint-initdb.d/` executando `CREATE EXTENSION IF NOT EXISTS vector;`.
- `app` **espera** o `db` ficar saudável via `depends_on: { db: { condition:
  service_healthy } }` — não confie só na ordem de start.
- Healthcheck do `db`: `pg_isready -U $POSTGRES_USER`.
- Volume nomeado para persistir dados do Postgres (`pgdata`).
- Segredos vêm de `env_file: .env` (nunca `environment:` com valor literal).

Esboço (`docker-compose.yml`):

```yaml
services:
  db:
    image: pgvector/pgvector:pg16
    env_file: .env
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./db/init:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $POSTGRES_USER -d $POSTGRES_DB"]
      interval: 5s
      timeout: 3s
      retries: 10
  app:
    build: .
    env_file: .env
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "${APP_PORT:-3000}:3000"
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:3000/healthz || exit 1"]
      interval: 10s
      timeout: 3s
      retries: 5
volumes:
  pgdata:
```

Overrides de ambiente: use `docker-compose.override.yml` (dev, auto-carregado)
e um `docker-compose.prod.yml` explícito (`-f`) quando D6 for decidido. Não
misture os dois.

## Dockerfile do app (Node/TS)

- **Multi-stage**: stage `build` (instala devDeps, `tsc`) → stage `runtime` só
  com `dist/` + deps de produção. Imagem base `node:20-slim` ou `-alpine`.
- Rodar como usuário **não-root** (`USER node`).
- `NODE_ENV=production` no runtime; `npm ci` (não `npm install`).
- Copiar `package*.json` primeiro para aproveitar cache de layer.
- Sem segredos em `ARG`/`ENV` de build.

## Variáveis de ambiente

Fonte da verdade = `.env.example` (commitado, só placeholders). Chaves mínimas:

```
# App
NODE_ENV=development
APP_PORT=3000
LOG_LEVEL=info
# Banco
POSTGRES_USER=stellantis
POSTGRES_PASSWORD=__CHANGE_ME__
POSTGRES_DB=stellantis_dict
DATABASE_URL=postgres://stellantis:__CHANGE_ME__@db:5432/stellantis_dict
# Auth (gerar por ambiente; nunca reusar entre envs)
JWT_SECRET=__CHANGE_ME__
JWT_REFRESH_SECRET=__CHANGE_ME__
# LLM (adapter multi-provedor — §2)
LLM_PROVIDER=claude        # claude | openai
LLM_API_KEY=__CHANGE_ME__
# Hospedagem (D6 — TBD)
DEPLOY_TARGET=local        # local | vps | cloud (não altera código; só infra)
```

Regras: valide as env no boot (fail-fast se faltar chave crítica). Nunca logue
valores de env sensíveis. Para segredos reais em deploy, integrar secret manager
do alvo escolhido em D6 (não decidir aqui).

## Health-check (§5 observabilidade)

- Endpoint `GET /healthz` sem auth, resposta rápida:
  `200 {"status":"ok"}` quando app + conexão com o banco OK; `503` caso o banco
  esteja inacessível.
- Manter **liveness** (processo vivo) separado de **readiness** (dependências OK)
  se/quando houver orquestrador. No MVP, um `/healthz` de readiness basta.
- Não vazar detalhes internos (versões, stack) na resposta pública.

## Logs estruturados (§5)

- JSON estruturado via `pino` (encaixa em Fastify/Express).
- Um campo `request_id`/`correlation_id` por requisição.
- **Nunca** logar: senhas, tokens, API keys, corpo bruto de auth (§3.6).
- Níveis por env via `LOG_LEVEL`; `info` em prod, `debug` só em dev.
- Formato JSON no stdout (o coletor do alvo de deploy agrega — não escrever
  arquivos de log dentro do container).

## CI (lint / testes / build)

Pipeline (GitHub Actions em `.github/workflows/ci.yml`) em PRs e push:
1. `npm ci`
2. `npm run lint` (ESLint + Prettier check)
3. `npm test` — subir Postgres/pgvector como service container para testes de
   integração; usar env de teste efêmera (segredos dummy, nunca reais).
4. `npm run build` (`tsc`) — build deve passar antes de qualquer merge.
5. (Opcional) `docker build` para validar o Dockerfile.

Sem segredos reais no CI: usar GitHub Secrets/OIDC quando houver deploy; em CI de
teste, valores dummy. Alinhar quaisquer credenciais com o Segurança Lead.

## Estratégia de hospedagem (D6 — TBD)

Decisão adiada para o início da Fase 1 (`docs/03-pdr.md`). Mantenha o caminho de
deploy configurável entre três alvos, **sem travar o desenvolvimento**:

| Alvo | Quando | Observações |
|---|---|---|
| Docker local | dev / demo em máquinas do setor | já coberto pelo compose acima |
| VPS próprio | piloto interno | precisa de TLS (reverse proxy: Caddy/Traefik), backup do `pgdata` |
| Cloud privada / VPC | produção com dado confidencial | secret manager gerenciado, rede isolada |

Toda diferença entre alvos mora em infra (compose override / IaC / env), nunca no
código da aplicação. Não escolher o alvo aqui — só deixar pronto para plugar.

## Checklist antes de fechar uma entrega de infra

- [ ] `.env` no `.gitignore`; só `.env.example` commitado (placeholders).
- [ ] Nenhum segredo real em código, compose, Dockerfile ou histórico git.
- [ ] `docker compose up` sobe app + db saudáveis do zero.
- [ ] `/healthz` responde e reflete estado do banco.
- [ ] Logs em JSON, sem dados sensíveis.
- [ ] CI passa (lint + testes + build).
- [ ] Config sensível revisada pelo Segurança Lead.
- [ ] Deploy real (se houver) atrás de TLS/HTTPS.
