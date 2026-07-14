---
name: product-backlog
description: >-
  Usar quando o CEO trouxer uma ideia/pedido nova(o) e for preciso transformá-la
  em escopo acionável para o Stellantis-Dictionary: definir objetivo/valor, separar
  MVP vs. fases, quebrar em tarefas pequenas no formato de docs/04-tasks.md, escrever
  critérios de aceite, controlar a fronteira de escopo (risco "escopo crescer demais")
  e registrar perguntas em aberto para o CEO decidir. Gatilhos típicos: "adicionar
  feature X", "e se a gente...", "colocar no backlog", "quebrar em tarefas",
  "priorizar", "isso entra no MVP?", "critérios de aceite".
---

# Produto — da ideia do CEO ao backlog acionável

Este skill é a receita de trabalho do **Produto Lead** deste projeto. Sempre que
uma ideia nova chega, produza um pacote consistente com os documentos vivos:
`docs/01-briefing.md`, `docs/03-pdr.md` (decisões + riscos) e `docs/04-tasks.md`
(backlog). Nunca improvise formato — reuse o que já existe.

## 0. Antes de propor (obrigatório)
1. Ler `docs/01-briefing.md` (objetivo, MVP vs. visão futura, métricas de sucesso).
2. Ler `docs/03-pdr.md` (tabela de decisões `D#`, riscos, roadmap por fases,
   perguntas em aberto §6).
3. Ler `docs/04-tasks.md` (fases atuais, último ID `T##` usado, dependências).
4. Se a ideia tocar um subsistema, ler a SPEC correspondente (`08` diretório,
   `09` cargos/comunidade, `11` Q&A, `05` cockpit 3D).

## 1. Pacote de saída (sempre estes 5 blocos)
Para cada ideia, entregue nesta ordem:

1. **Objetivo** — 1 frase: o que o usuário passa a conseguir fazer.
2. **Valor** — por que importa (ligue a uma proposta de valor do briefing §3 ou a
   uma métrica de sucesso §7). Se não liga a nenhuma, isso é sinal de escopo fora.
3. **Escopo MVP vs. fases** — o que entra já (versão simplificada) e o que fica
   para fase seguinte. Espelhe o padrão do briefing §5 ("MVP simplificado + visão
   futura"): sempre existe um corte mínimo entregável.
4. **Dependências** — quais tarefas `T##` ou decisões `D#` precisam vir antes.
5. **Critérios de aceite** — lista verificável (ver §4).

Delegue o detalhamento técnico ao `eng-lead` e a redação/registro nos docs ao
`doc-lead`. O Produto define o "o quê" e o "porquê", não o "como".

## 2. Quebra em tarefas — formato de `04-tasks.md`
As tarefas do backlog seguem convenções estritas. Respeite-as:

- **ID sequencial `T##`**, contínuo com o último usado (hoje o backlog vai até T40).
  Sub-tarefas de uma feature usam sufixo de letra: `T04b`, `T04c`, `T11a`, `T11b`.
- **Uma linha por tarefa**, começando com `- [ ] T## — ...`. Verbo no início,
  entregável concreto e pequeno (idealmente revisável numa passada).
- **Agrupar por fase** com cabeçalho `## Fase X — Nome`. Fases existentes:
  `0.5` (protótipo), `1a` fundação backend, `1b`/`1b2` dicionário/3D, `1c` chat RAG,
  `1d` frontend, `1e` segurança, `1f` diretório, `1g` plataforma comunitária,
  `1h` Q&A. Só crie fase nova se a feature não couber em nenhuma.
- **Dependências explícitas** logo abaixo do cabeçalho da fase, no formato
  `> Depende de: T## e D#` ou `> Deriva da SPEC 'NN-...md'.`
- **Extensibilidade de dados**: toda tabela nova de dados nasce com `metadata jsonb`
  — é a convenção do projeto (ver T20, T34). Registre isso na tarefa.
- Tarefas de fase futura vão em "Fases seguintes (backlog futuro, não detalhado)".

Exemplo de bloco bem-formado (mesmo estilo das tarefas T20–T25):
```
## Fase 1i — <Nome da feature>
> Deriva da SPEC 'NN-...md'. Depende de: T10 (termos com slug) e D5 (LLM).
- [ ] T41 — <entregável pequeno 1> (tabela nova com `metadata jsonb`)
- [ ] T42 — <entregável pequeno 2>
- [ ] T43 — (Fase posterior) <parte adiada>
```

## 3. Priorização (recomendar, não decidir)
- Priorize o que **desbloqueia** outras tarefas (fundação: auth, schema, `slug`)
  e o que valida o fluxo ponta-a-ponta do MVP.
- Marque explicitamente o que é **MVP simplificado** vs. **fase posterior** usando
  o prefixo `(Fase posterior)` na tarefa, como em T26/T40.
- Decisão final de prioridade/negócio é do CEO — apresente a recomendação e o
  trade-off, não um fato consumado.

## 4. Critérios de aceite
- Escreva-os **verificáveis e observáveis** (o QA precisa conseguir checar).
  Prefira "usuário consegue X em < N passos/tempo" e "resposta cita a fonte",
  no espírito das métricas do briefing §7.
- Inclua sempre o corte de **segurança/permissão** quando a tarefa toca dados:
  "dados pessoais só a autenticados", "escrita exige `can(user, permissão)`",
  LGPD quando houver dado pessoal (padrão de T19).
- Nenhuma tarefa é "pronta" sem passar por `qa-lead` e, se tocar dados/segurança,
  por `security-lead` (regra da empresa, doc `12` §3).

## 5. Controle de fronteira de escopo (risco do PDR)
"Escopo crescer demais para 'uso pessoal'" é um risco registrado no PDR §2. Para
cada ideia, faça o teste de fronteira:
- **Liga a uma proposta de valor do briefing §3?** Se não, questione ou adie.
- **Cabe no MVP simplificado ou é fase seguinte?** Quando em dúvida, corte para o
  mínimo entregável e mande o resto para "Fases seguintes".
- **É preferência do CEO ou requisito?** Requisitos vão ao backlog; preferências
  sem valor claro viram pergunta em aberto.
- Se a ideia expande o escopo de forma relevante, diga isso explicitamente e
  proponha o corte mínimo em vez de aceitar tudo.

## 6. Perguntas em aberto e decisões
- Dúvida que **bloqueia** o trabalho e depende do CEO → registrar em `03-pdr.md`
  §6 (perguntas em aberto), sem travar o que não depende dela. Exemplo vivo: D5
  (provedor de LLM) fica "mock/configurável" para não bloquear T12/T13.
- Decisão de negócio tomada → nova linha `D#` na tabela do PDR §1, com Status
  (`Confirmado` / `Recomendado — aguardando confirmação` / `Em aberto`).
- Não invente decisões de alto nível: proponha, marque como recomendação e deixe o
  CEO confirmar.

## 7. Handoff
Ao final, indique claramente:
- O que vai para `doc-lead` registrar (linhas de `04-tasks.md`, `D#` no PDR,
  perguntas em §6).
- O que vai para `eng-lead` detalhar tecnicamente (contratos, schema).
- Quais perguntas o CEO precisa responder para destravar.
