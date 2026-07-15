# Plano de Homologação / UAT — Stellantis-Dictionary

> Status: **rascunho**.
> Última atualização: 2026-07-15.
> Autoria: Documentação Lead, com o QA Lead.
> Cobre a **etapa 13 (Homologação/UAT)** do ciclo `14-ciclo-de-vida-engenharia.md`.
> Deriva de: skill `qa-checklist`, roster `12-organizacao-agentes-empresa.md` (papel
> do `sicky`), SPECs `09`/`11` (matrizes de permissão por cargo).

Homologação (User Acceptance Testing) é o gate em que o **CEO aceita** que a
entrega atende ao que foi pedido, antes do deploy (etapa 15). Vem **depois** do
gate de Testes (etapa 12) e **antes** do Deploy.

## 1. Objetivo

Confirmar, com o produto exercitado como um usuário real, que os **casos de uso**
(doc `15-casos-de-uso.md`) funcionam de ponta a ponta e atendem aos critérios de
aceite — e obter o **aceite formal do CEO**.

## 2. Papéis

| Papel | Quem | Responsabilidade |
|---|---|---|
| **Aprova (aceite)** | **CEO** | Decide aprovado/reprovado do gate. |
| **Conduz** | `qa-lead` | Monta o roteiro, coordena, consolida o resultado. |
| **Executa no navegador** | `sicky` | Dirige o app rodável (Playwright/Chromium) como usuário real; sob demanda. |
| **Corrige** | `eng-lead` (delega) | Recebe defeitos → etapa 14 (Correções). |

## 3. Template de roteiro de teste de aceite

```
### RT-NN — <Nome do roteiro> (rastreia CU-NN do doc 15)
- Ator/cargo: <user / coordinator / admin>
- Pré-condições / dados de teste: <estado inicial, sem dados reais confidenciais>
- Passos:
  1. <ação do usuário>  → Resultado esperado: <...>
  2. <ação do usuário>  → Resultado esperado: <...>
- Critério de aceite: <condição objetiva de aprovação>
- Resultado: [ ] Aprovado  [ ] Reprovado  → Defeito(s): DEF-NN
- Evidência: <saída real / captura>
```

## 4. Critérios de aprovação / reprovação

- **Aprovado** quando: todos os roteiros críticos passam; nenhum defeito de
  severidade **alta/bloqueante** em aberto; permissões por cargo respeitadas
  (`user`/`coordinator`/`admin`); caminhos de erro tratados.
- **Reprovado** quando: qualquer defeito bloqueante; regra de negócio violada
  (ex.: `user` consegue ação de `admin`); vazamento de dado pessoal do diretório
  (LGPD) — nesse caso aciona também o gate de Segurança (`14` §4).

## 5. Registro de defeitos → etapa 14 (Correções)

```
### DEF-NN — <título>
- Roteiro/CU: RT-NN / CU-NN
- Severidade: bloqueante | alta | média | baixa
- Passos p/ reproduzir: <...>
- Esperado vs. obtido: <...>
- Encaminhado a: `eng-lead` (etapa 14) — Reverificação por `qa-lead`.
- Estado: aberto | corrigido | reverificado | fechado
```

Defeitos alimentam a **etapa 14 (Correções)** do ciclo `14`; após corrigidos são
**reverificados** por QA (retorno controlado às etapas 12/13) antes de o gate de
homologação fechar.

## 6. Perguntas em aberto

1. **Ambiente de homologação** — depende de `D6` (hospedagem), ainda em aberto no
   PDR `03`; até lá, UAT roda em ambiente local (Docker Compose) — *a confirmar*.
2. **Dados de teste** — usar apenas dados fictícios (nenhum dado confidencial real,
   guardrail do PDR `03` §6) — *confirmado como diretriz, detalhar seed de UAT*.
3. **Assinatura do aceite** — como o CEO registra formalmente o aceite (citação ao
   pé do doc, como nos PDRs)? *aguardando decisão*.
