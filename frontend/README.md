# frontend — SPA (telas do produto)

Consome a API REST; **nunca** lê o banco direto (SPEC `08` §0.3). Ver
`docs/13-arquitetura-modular.md` §3.

- `src/pages/` — login/cadastro, dicionário, chat, admin, "Quem procurar",
  Comunidade.
- `src/components/` — UI reutilizável.
- `src/api/` — cliente da API REST (única porta de dados do frontend).
- `src/styles/` — estilos.
- `src/three/` — Explorador 3D do cockpit (módulo próprio).

Decisão HTML puro vs. framework (React) fica em aberto (SPEC `02` §2) — ver
`docs/13` §10.
