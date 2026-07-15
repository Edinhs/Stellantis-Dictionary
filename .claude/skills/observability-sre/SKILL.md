---
name: observability-sre
description: >-
  Use ao conduzir as etapas 18-19 do ciclo de vida do Stellantis-Dictionary:
  métricas/SLO (disponibilidade, latência p95, taxa de 5xx, saturação de banco),
  logs estruturados JSON, alertas acionáveis, dashboards e o loop de
  feedback->backlog (04-tasks). Gatilhos: "monitoramento", "observabilidade",
  "SLO/SLI", "métrica", "alerta", "dashboard", "log estruturado", "incidente",
  "evolução contínua", "etapa 18/19".
---

# Observability & SRE — Stellantis-Dictionary

Skill do **SRE/Monitoramento** (`sre-engineer`), dono das **etapas 18–19** do ciclo
de vida `docs/14-ciclo-de-vida-engenharia.md`. Reporta ao DevOps Lead; evolução
contínua com o Produto Lead.

## Fontes
`docs/13-arquitetura-modular` §6.2 (logs JSON, `request_id`; Twelve-Factor XI,
OWASP Logging), `docs/19-monitoramento-observabilidade`, `docs/18-manutencao-e-suporte`.

## Métricas/SLO (etapa 18)
- SLIs iniciais: uptime, latência p95 (< 500 ms), taxa de 5xx (< 1%), saturação de
  pool/queries lentas; chat RAG (latência/erro do LLM, depende `D5`).
- Alertas **acionáveis** (dono + ação); alerta pode disparar rollback (`17` §4) e
  abrir bug report (`18` §3). Nada de alerta ruidoso.

## Logs estruturados
- JSON, um evento por linha (event stream), com `request_id` de correlação.
- **Nunca logar segredos/senhas/tokens.** `audit_log` (negócio) ≠ logs operacionais
  (stdout) — complementares.

## Loop de feedback → backlog (etapa 19)
- Incidentes, gargalos e uso viram **tarefas `TNN`** no `04-tasks.md` (com o
  Produto Lead), realimentando a etapa 1 do ciclo `14`.

## Guardrails
- Stack concreta depende de `D6` (hospedagem, em aberto no PDR `03`).
- Retenção de logs observa LGPD (alinhar com Segurança Lead).
- Fase de planejamento: plano de instrumentação, não código de produção. Respeite
  os gates rígidos do doc `14`.
