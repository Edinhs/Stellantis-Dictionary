# dictionary — Dicionário de termos

CRUD de termos, `slug` (elo estável / fonte única da verdade), categorias, sinônimos, busca textual. Outros módulos ligam por `term_slug` ao contrato público deste módulo, nunca ao seu repositório. Ref.: SPEC `02` §3.2.

**Camadas** (ver `docs/13-arquitetura-modular.md` §3.1). Só `index.ts` é
importável por outros módulos (contrato público); `routes`/`service`/`repository`
são internos.

- `dictionary.routes.ts` — camada ROTA: HTTP, validação de entrada, chama o serviço.
- `dictionary.service.ts` — camada SERVIÇO: regra de negócio; chama `can()` e o repo.
- `dictionary.repository.ts` — camada REPOSITÓRIO: acesso a dados (SQL); sem HTTP.
- `index.ts` — registra rotas e exporta o serviço público do módulo.

Esta fase entrega apenas o esqueleto: os arquivos são placeholders, sem lógica
de produção.
