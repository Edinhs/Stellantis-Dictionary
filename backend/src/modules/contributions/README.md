# contributions — Contribuição, moderação e histórico

Módulo TRANSVERSAL de conteúdo. Fluxo propor-e-aprovar (`pending→approved/rejected/withdrawn`), fila de moderação e `content_revisions` (snapshot + rollback). `dictionary`, `workflows` e `directory` submetem propostas via `target_type` polimórfico. Ref.: SPEC `09` §4/§6.2/§6.3.

**Camadas** (ver `docs/13-arquitetura-modular.md` §3.1). Só `index.ts` é
importável por outros módulos (contrato público); `routes`/`service`/`repository`
são internos.

- `contributions.routes.ts` — camada ROTA: HTTP, validação de entrada, chama o serviço.
- `contributions.service.ts` — camada SERVIÇO: regra de negócio; chama `can()` e o repo.
- `contributions.repository.ts` — camada REPOSITÓRIO: acesso a dados (SQL); sem HTTP.
- `index.ts` — registra rotas e exporta o serviço público do módulo.

## Status na Etapa 11 (Desenvolvimento)

Implementado: `propose`/`approve`/`reject`/`withdraw`. A aprovação aplica o
`payload` chamando o `TargetApplier` do módulo-alvo (`dictionary`/
`components`/`projects`, registrados via `index.ts` — contrato público,
nunca o interior), grava `content_revisions` (snapshot) e `audit_log`.
Permissão de aprovação é por área (`dictionary.approve`/`project.approve`/
`component.approve`, seed real de `seeds/role_permissions.json`), não um
`contribution.approve` genérico. `workflows`/`directory` ainda não têm
applier registrado nesta rodada (fora do escopo desta entrega). Testes em
`contributions.service.test.ts`.

**Correção (achado QA ALTA):** `listPending` sem `targetType` checava ZERO
permissão (vazava a fila de moderação inteira a qualquer autenticado). Agora:
com `targetType`, exige a permissão `<area>.approve` daquela área; sem
`targetType` ("ver tudo"), só quem tem as **3** permissões de aprovação
(`dictionary.approve`+`project.approve`+`component.approve` — hoje,
coordinator/admin) pode ver a fila completa; do contrário, `ForbiddenError`.
Ver `contributions.listpending-gap.qa.test.ts`.

**Pendência conhecida (próximo passo, não bloqueia esta entrega):** o
`payload` da proposta é validado como `record(unknown)` no `POST /` (schema
genérico) — a validação fina de forma (ex.: `slug`/`term`/`definition`
obrigatórios para `target_type='term'`) só acontece no INSERT do banco, na
hora do `approve`. Antes de ir para produção real, considerar validar o
`payload` contra o schema Zod do módulo-alvo já no `propose` (ex.:
`termInputSchema` de `dictionary`), para dar erro 400 cedo em vez de falhar
só na aprovação.
