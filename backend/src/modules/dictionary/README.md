# dictionary — Dicionário de termos

CRUD de termos, `slug` (elo estável / fonte única da verdade), categorias, sinônimos, busca textual. Outros módulos ligam por `term_slug` ao contrato público deste módulo, nunca ao seu repositório. Ref.: SPEC `02` §3.2.

**Camadas** (ver `docs/13-arquitetura-modular.md` §3.1). Só `index.ts` é
importável por outros módulos (contrato público); `routes`/`service`/`repository`
são internos.

- `dictionary.routes.ts` — camada ROTA: HTTP, validação de entrada, chama o serviço.
- `dictionary.service.ts` — camada SERVIÇO: regra de negócio; chama `can()` e o repo.
- `dictionary.repository.ts` — camada REPOSITÓRIO: acesso a dados (SQL); sem HTTP.
- `index.ts` — registra rotas e exporta o serviço público do módulo.

## Status na Etapa 11 (Desenvolvimento)

Implementado: CRUD direto (`dictionary.edit`/`dictionary.delete`, só
coordinator/admin) + `applier` (`TargetApplier`) consumido por
`contributions` para aprovar propostas de `user` (`target_type='term'`).
**Correção (achado QA ALTA, RN-06/RN-10):** `createDirect`/`updateDirect`/
`deleteDirect` gravam `content_revisions` (versionada) e `audit_log` a cada
operação — o serviço recebe `db` além de `repo`/`authz` (ver
`core/history`/`core/audit`). Hard delete físico não implementado (fora de
escopo desta rodada; ver `dictionary.service.ts`). Testes em
`dictionary.service.test.ts` e `dictionary.rn06-audit-gap.qa.test.ts`.
