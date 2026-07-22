# components — Componentes de Infotainment

Escopo MVP (D20, PDR `03`). CRUD de `components` (elo tríplice: verbete por
`term_slug`, categoria e fornecedor Tier-1 — RF-042, doc `25` §3.1/§3.2).
Módulo NOVO nesta rodada (Etapa 11); não existia no esqueleto original da
Etapa 8 (doc `13`), que só previa `workflows` como espelho de `terms`. Segue a
mesma anatomia de módulo (doc `13` §3.1).

**Camadas.** Só `index.ts` é importável por outros módulos (contrato
público).

- `components.routes.ts` — camada ROTA.
- `components.service.ts` — camada SERVIÇO: regra de negócio, `can()`, expõe
  `applier` (contrato `TargetApplier` de `contributions`) para o fluxo
  propor-e-aprovar de `target_type='component'`.
- `components.repository.ts` — camada REPOSITÓRIO: SQL sobre `components`
  (+ leitura de `component_categories`/`suppliers`, migração `0006`).
- `index.ts` — registra rotas e exporta o serviço público.

Fornecedores/categorias reais NÃO entram em seed versionado (S9, doc 24/25
§8) — ver `seeds/README.md`.

## Status na Etapa 11 (Desenvolvimento)

**Correção (achado QA ALTA, RN-06/RN-10):** `createDirect`/`updateDirect`/
`deleteDirect` gravam `content_revisions` + `audit_log` a cada operação
direta (coordinator/admin) — o serviço recebe `db` além de `repo`/`authz`
(mesmo padrão de `dictionary.service.ts`).
