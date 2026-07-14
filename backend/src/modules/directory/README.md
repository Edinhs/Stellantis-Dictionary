# directory — Quem procurar (setores/especialistas)

Setores, pessoas, responsáveis e especialistas por `term_slug` (dados pessoais — LGPD; só a autenticados). Liga por `term_slug` ao `dictionary` via contrato público. Ref.: docs `07`/`08`.

**Camadas** (ver `docs/13-arquitetura-modular.md` §3.1). Só `index.ts` é
importável por outros módulos (contrato público); `routes`/`service`/`repository`
são internos.

- `directory.routes.ts` — camada ROTA: HTTP, validação de entrada, chama o serviço.
- `directory.service.ts` — camada SERVIÇO: regra de negócio; chama `can()` e o repo.
- `directory.repository.ts` — camada REPOSITÓRIO: acesso a dados (SQL); sem HTTP.
- `index.ts` — registra rotas e exporta o serviço público do módulo.

Esta fase entrega apenas o esqueleto: os arquivos são placeholders, sem lógica
de produção.
