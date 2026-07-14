# contributions — Contribuição, moderação e histórico

Módulo TRANSVERSAL de conteúdo. Fluxo propor-e-aprovar (`pending→approved/rejected/withdrawn`), fila de moderação e `content_revisions` (snapshot + rollback). `dictionary`, `workflows` e `directory` submetem propostas via `target_type` polimórfico. Ref.: SPEC `09` §4/§6.2/§6.3.

**Camadas** (ver `docs/13-arquitetura-modular.md` §3.1). Só `index.ts` é
importável por outros módulos (contrato público); `routes`/`service`/`repository`
são internos.

- `contributions.routes.ts` — camada ROTA: HTTP, validação de entrada, chama o serviço.
- `contributions.service.ts` — camada SERVIÇO: regra de negócio; chama `can()` e o repo.
- `contributions.repository.ts` — camada REPOSITÓRIO: acesso a dados (SQL); sem HTTP.
- `index.ts` — registra rotas e exporta o serviço público do módulo.

Esta fase entrega apenas o esqueleto: os arquivos são placeholders, sem lógica
de produção.
