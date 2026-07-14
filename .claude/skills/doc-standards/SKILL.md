---
name: doc-standards
description: Convenções da pasta docs/ do projeto Stellantis-Dictionary. Use ao criar, revisar ou atualizar QUALQUER documento em docs/ — PDR, SPEC, ADR, briefing, backlog (04-tasks.md), changelog ou o roster de agentes. Cobre numeração sequencial dos arquivos, quando é PDR (decisão) vs SPEC (técnico) vs backlog, idioma português, referências cruzadas por número, blocos de "Perguntas em aberto" e a rotina obrigatória de atualizar/reenviar 12-organizacao-agentes-empresa.md a cada novo cargo/agente.
---

# Padrões de documentação — Stellantis-Dictionary

Guia prático para manter `docs/` coerente. Antes de escrever, **leia os documentos
relacionados** (não duplique conteúdo — referencie por número).

## 1. Numeração e nomes de arquivo

- Arquivos em `docs/` são prefixados com um número sequencial de dois dígitos:
  `NN-nome-em-kebab-case.md` (ex.: `09-plataforma-comunitaria-cargos-spec.md`).
- **Nunca reutilize um número.** Um novo documento recebe o próximo número livre.
  Confira o maior número atual antes de criar (hoje o topo é `12`).
- O sufixo indica o tipo quando aplicável: `-pdr`, `-spec`, `-reference`,
  `-refinamentos`. Pares PDR+SPEC do mesmo tema recebem números consecutivos
  (ex.: `10-comunidade-qa-pdr.md` e `11-comunidade-qa-spec.md`).
- Documentos fundacionais têm nome curto: `01-briefing`, `02-spec`, `03-pdr`,
  `04-tasks`.

## 2. PDR vs SPEC vs Backlog — qual usar

| Tipo | Responde | Formato característico |
|---|---|---|
| **PDR** (decisão) | *O que* foi decidido e *por quê* | Tabela de decisões `D1, D2…` com coluna **Status** (`Confirmado` / `Recomendado — aguardando confirmação` / `Em aberto`); seções de riscos, roadmap por fases, perguntas em aberto |
| **SPEC** (técnico) | *Como* implementar | Modelo de dados, contratos de API, permissões, regras; sem inventar decisões |
| **Backlog** (`04-tasks.md`) | Passos executáveis | Tarefas `TNN` pequenas com `- [ ]`, agrupadas por Fase, com `> Depende de:` e `Ref.: SPEC NN` |

Regras:
- Uma **decisão nova** entra primeiro no PDR (`03-pdr.md`, nova linha `Dn`) e só
  depois é refletida na SPEC correspondente.
- Toda decisão referencia onde é detalhada: `Confirmado — ver SPEC \`09\` §4`.
- O backlog **não** cria decisões; ele traduz PDR/SPEC em tarefas `TNN` (mantenha a
  sequência; sufixos `T04b`, `T11a` para inserções finas).

## 3. Idioma e tom

- **Português** em todo o conteúdo. Termos técnicos consagrados ficam em inglês
  (`slug`, `embeddings`, `hotspot`, `RBAC`, `soft delete`).
- Tom objetivo e direto. Use **negrito** para o ponto-chave de cada item.
- Nomes de código/tabelas/permissões em crase: `terms`, `can()`, `qa.*`,
  `term_slug`.

## 4. Referências cruzadas

- Sempre referencie **por número** com o nome em crase: `ver SPEC \`09\`` ou
  `ver docs \`07\`/\`08\``; aponte a seção quando útil: `SPEC \`09\` §2.1`.
- Ao criar um documento derivado, declare a origem no topo ou na seção relevante:
  `> Deriva da SPEC \`09-plataforma-comunitaria-cargos-spec.md\`.`
- Perguntas em aberto herdadas apontam a fonte:
  `## 7. Perguntas em aberto (herdadas do PDR \`10\`)`.

## 5. Bloco "Perguntas em aberto"

- Todo PDR/SPEC termina com uma seção numerada `## N. Perguntas em aberto`.
- O que **não** foi decidido pelo CEO vira pergunta em aberto — **nunca invente a
  decisão** (guardrail). Formule como pergunta e marque `— ainda em aberto`.
- Ao resolver uma pergunta, **não a apague**: risque com `~~texto~~` e anote a
  decisão. Ex.: `1. ~~Onde hospedar~~ — **Decisão adiada**: definir na Fase 1.`
- Aprovações do CEO são registradas em citação ao pé do documento:
  `> Aprovação registrada em AAAA-MM-DD: … aprovados pelo stakeholder.`

## 6. Rotina obrigatória do roster de agentes

`docs/12-organizacao-agentes-empresa.md` é **documento vivo**. **Sempre que um novo
cargo/agente for criado (arquivo em `.claude/agents/`), atualize os quatro pontos:**

1. **Data no topo** — `> Última atualização: AAAA-MM-DD.`
2. **Roster (§4)** — nova linha na tabela: `Cargo | arquivo.md | Reporta a |
   Missão resumida | Pode criar sub-agentes?`.
3. **Mapa setor→docs/skills (§5)** — nova linha, se abrir setor.
4. **Histórico (§7)** — entrada `- AAAA-MM-DD — <o que mudou>`.

Depois, sinalize ao Agente Geral que o documento deve ser **reenviado ao CEO**
(ver §6 do próprio documento: "Como abrir um novo setor/cargo").

## 7. Data

Use a data corrente no formato `AAAA-MM-DD` em topos de documento vivo, histórico e
registros de aprovação. Não altere datas de entradas históricas anteriores.

## 8. Fluxo de trabalho ao editar docs

1. Ler os documentos relacionados (PDR + SPEC do tema + backlog).
2. Preferir **criar arquivo novo** a alterar um aprovado — exceto correção pontual
   ou documento explicitamente "vivo" (roster, backlog).
3. Registrar decisão no PDR → refletir na SPEC → quebrar em tarefas no backlog.
4. Verificar que toda referência cruzada aponta ao número/seção correto.
5. Resumir ao Agente Geral o que mudou e o que ficou em aberto.

## Guardrails

- Fase de planejamento: produzir **documentos**, não código de produção.
- Não inventar decisões do CEO — o indefinido vira pergunta em aberto.
- Não commitar (o Agente Geral integra e commita).
