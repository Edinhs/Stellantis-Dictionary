# backend/src — Aplicação (Node.js + TypeScript)

Estilo: monólito modular, camadas `rota → serviço → repositório`.
Ver `docs/13-arquitetura-modular.md`.

- `index.ts` — bootstrap: inicializa `core` e sobe o servidor.
- `app.ts` — composição do servidor HTTP: registra o `index.ts` público de cada
  módulo (lista de módulos ativos, auditável em um só lugar).
- `core/` — infra transversal (config, db, logging, audit, errors, http, authz).
- `shared/` — contratos/tipos comuns (sem infra).
- `modules/` — uma feature por pasta (auth, users, dictionary, workflows,
  contributions, directory, community-qa, rag, cockpit-3d).

Regra de dependência: `modules → core|shared` e `modules → index.ts público de
outro módulo`. `core`/`shared` **não** importam `modules`. Sem ciclos.
