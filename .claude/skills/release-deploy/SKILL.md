---
name: release-deploy
description: >-
  Use ao conduzir as etapas 15-16 do ciclo de vida do Stellantis-Dictionary:
  estratégia de release, versionamento (SemVer), checklist de deploy, health-check,
  rollback e handover/documentação de entrega. Depende de D6 (hospedagem, TBD no
  PDR 03). Gatilhos: "deploy", "release", "versão/tag", "rollback", "handover",
  "entrega", "SemVer", "checklist de deploy", "etapa 15/16".
---

# Release & Deploy — Stellantis-Dictionary

Skill do **Release/Deploy Engineer** (`release-engineer`), dono das **etapas
15–16** do ciclo de vida `docs/14-ciclo-de-vida-engenharia.md`. Reporta ao DevOps
Lead (aprovador do gate 15; a entrega/16 é aprovada pelo CEO).

## Fontes
`docs/13-arquitetura-modular` (§3 `docker/`, §6.3 migrações), `docs/17-deploy-e-entrega`,
`docs/18-manutencao-e-suporte`, PDR `docs/03` (`D6` hospedagem — **TBD**). Skill
irmã: `devops-baseline`.

## Pré-condições do gate 15 (rígido)
- Homologação (etapa 13) aprovada pelo CEO; correções (14) reverificadas por QA.
- **Gate de Segurança** (`14` §4): segredos via env, TLS/HTTPS, RBAC.

## Checklist de deploy
1. Migrações aplicadas em ordem (forward-only; `pgvector` disponível).
2. Variáveis de ambiente/segredos presentes (nunca commitados).
3. Health-check verde após subir.
4. **Plano de rollback pronto** (reverter para imagem/tag anterior; schema exige
   migração de reversão explícita).

## Versionamento e entrega
- **SemVer** (`MAJOR.MINOR.PATCH`) + tag de git; notas de versão ligadas às `TNN`.
- Entrega (16): handover, documentação de operação, comunicação da versão.

## Guardrails
- **`D6` em aberto bloqueia deploy real** — adiante só o planejamento (doc `17`).
- Nunca commite/exponha segredos. TLS/HTTPS obrigatório em deploy real.
- Respeite os gates rígidos do doc `14` (não pule etapas).
