# projects — Projetos veiculares

Escopo MVP (D20, PDR `03`). CRUD de `projects` (slug, code, status, ficha
técnica, versões — RF-043, doc `25` §3.1). Módulo NOVO nesta rodada (Etapa
11), mesma anatomia dos demais (doc `13` §3.1). Campos `platform`/
`motorization` existem no schema (migração `0007`) mas ficam **ocultos no
contrato de leitura da API** por decisão do CEO (ver comentário da migração);
este serviço não os expõe no DTO público.

**Camadas.** Só `index.ts` é importável por outros módulos.

- `projects.routes.ts` / `projects.service.ts` (+ `applier` para
  `contributions`, `target_type='project'`) / `projects.repository.ts` /
  `index.ts`.

Códigos reais de projeto NÃO entram em seed versionado (S9, doc 24/25 §8).

## Status na Etapa 11 (Desenvolvimento)

**Correção (achado QA ALTA, RN-06/RN-10):** `createDirect`/`updateDirect`/
`deleteDirect` gravam `content_revisions` + `audit_log` a cada operação
direta (coordinator/admin) — o serviço recebe `db` além de `repo`/`authz`
(mesmo padrão de `dictionary.service.ts`).
