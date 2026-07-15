---
name: ux-research-prototyping
description: >-
  Use ao conduzir a etapa 7 (Protótipo UI/UX) do ciclo de vida do
  Stellantis-Dictionary: pesquisa de experiência, jornadas do usuário,
  arquitetura de informação, protótipos HTML da Fase 0.5 (login, dicionário, chat
  RAG, admin, cockpit 3D, diretório, Comunidade/Q&A) e validação de usabilidade e
  acessibilidade antes do código. Coexiste com ui-design-system (que é o design
  system de implementação do frontend). Gatilhos: "protótipo", "wireframe",
  "fluxo de tela", "jornada", "usabilidade", "pesquisa de UX", "Fase 0.5", "T01-T05".
---

# UX Research & Prototyping — Stellantis-Dictionary

Skill do **Design Lead** (`design-lead`), dono da **etapa 7** do ciclo de vida
`docs/14-ciclo-de-vida-engenharia.md`. Foco: **descobrir e validar a experiência**
antes de escrever código.

## Fontes
`docs/01-briefing`, `docs/02-spec` (§2/§3), `docs/05`/`06` (3D), `docs/14` (etapa 7),
`docs/15-casos-de-uso` (atores/CU). Protótipos vivem em `prototypes/`.

## Coexistência com `ui-design-system`
- **Esta skill (`ux-research-prototyping`)**: pesquisa de UX + protótipo (Fase 0.5),
  o "o quê/porquê" da experiência. Autor: Design Lead.
- **`ui-design-system`**: paleta, componentes e padrões de **implementação** da SPA
  real. Autor: Engenharia/Frontend. Não substitui esta; complementa na etapa 11.

## Fluxo da etapa 7 (gate rígido)
1. Mapear atores e jornadas a partir dos casos de uso (`15`).
2. Prototipar telas/fluxo em HTML (`prototypes/`, tarefas `T01`–`T04d`).
3. Validar usabilidade e acessibilidade básica (a11y).
4. Revisão com o CEO (`T05`) — **gate 7 aprovado pelo CEO** antes da arquitetura (8).

## Boas práticas
- Um protótipo por tela/fluxo; navegação coerente entre eles.
- Acessibilidade desde o rascunho (contraste, foco, semântica, alternativa ao 3D).
- Rótulos de UI em português; termos técnicos em inglês quando consagrados.
- Não decidir sozinho o que é decisão do CEO — vira pergunta em aberto.

## Guardrails
- Fase de planejamento: protótipo/artefato de design, não código de produção.
- Respeite os gates rígidos do doc `14` (não pule etapas).
