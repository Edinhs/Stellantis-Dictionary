---
name: requirements-elicitation
description: >-
  Use ao conduzir as etapas 2-5 do ciclo de vida do Stellantis-Dictionary:
  pesquisa/benchmark, elicitação de requisitos funcionais e não funcionais, regras
  de negócio e casos de uso (atores, pré-condições, fluxos, pós-condições).
  Consolida o que hoje está implícito nas SPECs 02/08/09/11 no doc 15. Gatilhos:
  "requisito", "regra de negócio", "caso de uso", "ator", "elicitar", "pesquisa",
  "critério verificável", "rastreabilidade", "etapa 2/3/4/5".
---

# Requirements Elicitation — Stellantis-Dictionary

Skill do **Analista de Requisitos** (`requirements-analyst`), dono das **etapas
2–5** do ciclo de vida `docs/14-ciclo-de-vida-engenharia.md`. Reporta ao Produto
Lead (aprovador desses gates).

## Fontes
`docs/01-briefing`, SPECs `docs/02`/`08`/`09`/`11`, doc `docs/14` (etapas 2–5), doc
`docs/15-casos-de-uso` (template + candidatos).

## Fluxo por etapa (gates rígidos, aprova `product-lead`)
- **2 Pesquisa** — contexto, benchmark, restrições, riscos iniciais.
- **3 Requisitos** — funcionais e não funcionais, **numerados e verificáveis**, sem
  ambiguidade; conflitos resolvidos.
- **4 Regras de Negócio** — cada regra com gatilho/condição/efeito (ex.: `can()`,
  moderação, cargos `user`/`coordinator`/`admin`).
- **5 Casos de Uso** — no doc `15`: ator, pré-condições, fluxo principal, fluxos
  alternativos/exceções, pós-condições.

## Boas práticas
- **Rastreabilidade:** todo requisito funcional coberto por ≥1 caso de uso.
- Não duplicar conteúdo das SPECs — **referencie por número** (`doc-standards`).
- Requisito bom = testável (vira roteiro de aceite na homologação `16`).
- O indefinido pelo CEO vira **pergunta em aberto** — nunca inventar decisão.

## Guardrails
- Fase de planejamento: artefatos de requisitos, não código.
- Respeite os gates rígidos do doc `14` (não pule etapas).
