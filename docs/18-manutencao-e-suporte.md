# Manutenção e Suporte — Stellantis-Dictionary

> Status: **rascunho**.
> Última atualização: 2026-07-15.
> Autoria: DevOps Lead (dono da etapa 17), com o Release/Deploy Engineer e o SRE.
> Cobre a **etapa 17 (Manutenção)** do ciclo `14-ciclo-de-vida-engenharia.md`.
> Deriva de: `17-deploy-e-entrega.md` (entrega), `19-monitoramento-observabilidade.md`
> (sinais de operação), skill `devops-baseline`.

Manutenção começa **após a entrega** (etapa 16) e mantém o software saudável em
produção, roteando defeitos de volta à **etapa 14 (Correções)** do ciclo `14`.

## 1. Tipos de manutenção

| Tipo | Descrição | Destino no ciclo `14` |
|---|---|---|
| **Corretiva** | Corrigir defeitos/bugs em produção. | Etapa 14 (Correções). |
| **Adaptativa** | Ajustar a mudanças de ambiente (versões, hospedagem `D6`, dependências). | Etapa 11 (Desenvolvimento). |
| **Evolutiva** | Novas melhorias/pequenas features vindas do feedback. | Etapa 19 → 1 (backlog `04`). |

## 2. SLA (rascunho)

Tempos de **primeira resposta** e **resolução alvo** por severidade — valores
iniciais, a confirmar com o CEO:

| Severidade | Exemplo | Primeira resposta | Resolução alvo |
|---|---|---|---|
| **Bloqueante** | Sistema fora do ar; vazamento de dado | imediata | rollback + fix urgente |
| **Alta** | Fluxo crítico quebrado (login, chat) | mesmo dia | curto prazo |
| **Média** | Função secundária com defeito | poucos dias | próximo release |
| **Baixa** | Cosmético / melhoria pontual | backlog | quando priorizado |

## 3. Fluxo de bug report

```
1. Registro do bug (usuário/monitoramento) → título, passos, severidade.
2. Triagem (devops-lead / sre-engineer) → classifica tipo (§1) e severidade (§2).
3. Roteamento:
   - Corretiva  → etapa 14 (Correções, eng-lead) → reverificação QA → deploy (15).
   - Adaptativa → etapa 11 (Desenvolvimento).
   - Evolutiva  → etapa 19 → backlog 04-tasks.md (priorização product-lead).
4. Fechamento → só após reverificação por QA (regra do gate transversal, 14 §4).
```

Bugs de **segurança/dados pessoais** acionam também o `security-lead` (LGPD, `14` §4).

## 4. Perguntas em aberto

1. **Valores de SLA** — os prazos da §2 são rascunho; dependem de expectativa de uso
   e de `D6` (hospedagem) — *aguardando decisão do CEO*.
2. **Canal de suporte / bug report** — formulário na app, e-mail ou issue tracker?
   *a definir com `product-lead`/`devops-lead`*.
3. **On-call / janela de suporte** — há responsável de plantão? Só se o uso justificar
   — *fora do MVP, a decidir*.
