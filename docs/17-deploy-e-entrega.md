# Deploy e Entrega — Stellantis-Dictionary

> Status: **rascunho**.
> Última atualização: 2026-07-15.
> Autoria: Release/Deploy Engineer (`release-engineer`), reporta ao DevOps Lead.
> Cobre as **etapas 15 (Deploy)** e **16 (Entrega)** do ciclo
> `14-ciclo-de-vida-engenharia.md`.
> Deriva de: `13-arquitetura-modular.md` (§3 layout, `docker/`), skill
> `devops-baseline`, PDR `03-pdr.md` (`D6` hospedagem — **TBD**).

> **Bloqueio conhecido:** a decisão **`D6` (estratégia de hospedagem)** segue **em
> aberto** no PDR `03`. Enquanto `D6` for TBD, as etapas 15–16 ficam **bloqueadas
> para execução real** (ver `14` §5). Este doc adianta o **planejamento**.

## 1. Estratégia de release

- **Artefato único deployável** (monólito modular, `13` §1) via imagem Docker;
  ambiente local por Docker Compose (`docker/docker-compose.yml`).
- Release por **fase do backlog** (`04-tasks.md`); um release fecha um conjunto de
  gates 11–14 aprovados.
- Ambiente-alvo (VPS / cloud privada / on-prem) **a definir em `D6`**.

## 2. Versionamento

- **SemVer** (`MAJOR.MINOR.PATCH`); tag de git por release.
- Migrações de banco versionadas e **nunca reescritas** (`13` §6.3) acompanham a
  versão.
- Notas de versão (changelog) por release, ligadas às tarefas `TNN` entregues.

## 3. Checklist de deploy

- [ ] Gate de homologação (etapa 13) aprovado pelo CEO.
- [ ] Correções (etapa 14) fechadas e reverificadas por QA.
- [ ] Gate de Segurança (`14` §4) aprovado (segredos via env, TLS/HTTPS, RBAC).
- [ ] Migrações aplicadas em ordem; `pgvector` disponível.
- [ ] Variáveis de ambiente e segredos presentes (nunca commitados).
- [ ] Health-check verde após subir.
- [ ] Plano de rollback pronto (ver §4).

## 4. Rollback

- Estratégia: manter a versão anterior implantável; **reverter para a imagem/tag
  anterior** em caso de falha pós-deploy.
- Banco: migrações são forward-only; rollback de schema exige **migração de reversão
  explícita** (não reescrever a aplicada).
- Critério de gatilho: health-check vermelho, erro crítico ou SLO violado (ver `19`).

## 5. Handover / documentação de entrega (etapa 16)

- Notas de versão + instruções de operação (subir, variáveis, health-check).
- Ponto de contato de suporte e link para o fluxo de manutenção (`18`).
- Confirmação de que os usuários estão habilitados a usar a versão.

## 6. Perguntas em aberto

1. **`D6` (hospedagem)** — VPS, cloud privada ou on-prem? Decide ambiente-alvo,
   secret manager e pipeline de CI/CD — *ainda em aberto no PDR `03`*.
2. **Estratégia de release avançada** (blue-green / canário) — só faz sentido após
   `D6`; MVP começa com deploy simples + rollback por tag — *a decidir*.
3. **CI/CD** — pipeline (lint/testes/build/deploy) a desenhar com o `devops-lead`
   (`.github/workflows/`, `13` §3) — *a detalhar*.
