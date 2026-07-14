# community-qa — Comunidade (Q&A)

Perguntas, respostas, comentários, votos, tags, reports; moderação leve (reativa). Reusa `content_revisions` e `audit_log` de `core`. Liga por `term_slug`/tags ao `dictionary`. Permissões `qa.*` via `can()`. Ref.: docs `10`/`11`.

**Camadas** (ver `docs/13-arquitetura-modular.md` §3.1). Só `index.ts` é
importável por outros módulos (contrato público); `routes`/`service`/`repository`
são internos.

- `qa.routes.ts` — camada ROTA: HTTP, validação de entrada, chama o serviço.
- `qa.service.ts` — camada SERVIÇO: regra de negócio; chama `can()` e o repo.
- `qa.repository.ts` — camada REPOSITÓRIO: acesso a dados (SQL); sem HTTP.
- `index.ts` — registra rotas e exporta o serviço público do módulo.

Esta fase entrega apenas o esqueleto: os arquivos são placeholders, sem lógica
de produção.
