# workflows — Fluxos de trabalho

Novo tipo de conteúdo espelhando `terms` (`slug`, `steps jsonb`, `related_terms[]`). Reaproveita RAG, versionamento e elo por `slug`. Ref.: SPEC `09` §5.

**Camadas** (ver `docs/13-arquitetura-modular.md` §3.1). Só `index.ts` é
importável por outros módulos (contrato público); `routes`/`service`/`repository`
são internos.

- `workflows.routes.ts` — camada ROTA: HTTP, validação de entrada, chama o serviço.
- `workflows.service.ts` — camada SERVIÇO: regra de negócio; chama `can()` e o repo.
- `workflows.repository.ts` — camada REPOSITÓRIO: acesso a dados (SQL); sem HTTP.
- `index.ts` — registra rotas e exporta o serviço público do módulo.

Esta fase entrega apenas o esqueleto: os arquivos são placeholders, sem lógica
de produção.
