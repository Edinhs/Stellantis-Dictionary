# Monitoramento, Observabilidade e Evolução Contínua — Stellantis-Dictionary

> Status: **rascunho**.
> Última atualização: 2026-07-15.
> Autoria: SRE/Monitoramento (`sre-engineer`), reporta ao DevOps Lead; evolução
> contínua com o Produto Lead.
> Cobre as **etapas 18 (Monitoramento)** e **19 (Evolução Contínua)** do ciclo
> `14-ciclo-de-vida-engenharia.md`.
> Deriva de: `13-arquitetura-modular.md` §6.2 (logs estruturados JSON, `request_id`;
> R5/R6), `18-manutencao-e-suporte.md` (bug report), backlog `04-tasks.md`.

Fecha o ciclo: observa o sistema em produção (etapa 18) e realimenta o backlog
(etapa 19 → etapa 1), tornando o processo um **loop**.

## 1. Métricas e SLO (rascunho)

Indicadores iniciais — SLOs a confirmar com o CEO:

| Área | Métrica (SLI) | SLO alvo (rascunho) |
|---|---|---|
| Disponibilidade | uptime da API | ≥ 99% no MVP |
| Latência | p95 de resposta da API | < 500 ms |
| Chat RAG | tempo de resposta / taxa de erro do LLM | a calibrar (depende `D5`) |
| Erros | taxa de 5xx | < 1% |
| Banco | pool saturado / queries lentas | alerta em limiar |

## 2. Logs estruturados

- **JSON, um evento por linha, como *event stream*** (já definido em `13` §6.2;
  Twelve-Factor XI; OWASP Logging).
- `request_id` de correlação em toda requisição.
- **Nunca logar segredos, senhas ou tokens** (`02` §3.6).
- Distinção: `audit_log` = registro de negócio/compliance (no banco); logs
  estruturados = operacionais (stdout). Os dois se complementam.

## 3. Alertas

- Alertas **acionáveis** ligados aos SLOs (§1): disponibilidade, latência p95, taxa
  de 5xx, saturação de banco.
- Gatilho de alerta pode disparar **rollback** (`17` §4) e abrir bug report (`18` §3).
- Sem alerta "ruidoso": cada alerta tem dono e ação esperada.

## 4. Dashboards

- Painel de saúde (uptime, latência, erros) + painel de uso (buscas no dicionário,
  perguntas no chat, atividade da Comunidade/Q&A).
- Fonte: logs estruturados (§2) + métricas (§1). Ferramenta concreta a definir com
  o `devops-lead` (depende de `D6`).

## 5. Loop de feedback → backlog (etapa 19)

```
Monitoramento (18) + uso + incidentes/manutenção (18-suporte)
        │
        ▼
Insights (gargalos, falhas recorrentes, features pedidas)
        │
        ▼
Itens priorizados no backlog 04-tasks.md (product-lead)
        │
        ▼
Etapa 1 (Ideia) do ciclo 14 → o ciclo recomeça
```

Métricas e incidentes viram **tarefas `TNN`** no `04-tasks.md`; melhorias evolutivas
seguem o fluxo da manutenção evolutiva (`18` §1).

## 6. Perguntas em aberto

1. **Stack de observabilidade** — ferramenta concreta (ex.: Prometheus/Grafana,
   OpenTelemetry ou equivalente) depende de `D6` (hospedagem) — *ainda em aberto*.
2. **Valores de SLO** — os alvos da §1 são rascunho; calibrar com uso real e `D5`
   (provedor de LLM) — *aguardando decisão*.
3. **Retenção de logs / métricas** — prazo e volume (custo vs. auditoria) — *a
   definir com `devops-lead`/`security-lead` (LGPD)*.
