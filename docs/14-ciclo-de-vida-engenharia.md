# Ciclo de Vida de Engenharia de Software — Espinha dorsal governada

> Documento **vivo** e **mestre** do processo. Define as 19 etapas do ciclo de
> vida como **portões (gates) sequenciais rígidos**: uma etapa só abre quando a
> anterior fecha (Definition of Done cumprida e gate aprovado).
> Status: **aprovado** (decisão `D18` do PDR `03-pdr.md`).
> Última atualização: 2026-07-15.
> Autoria: Documentação Lead, a mando do CEO (Agente Geral orquestrando).
> Deriva de: PDR `03-pdr.md` (`D18`/`D19`), roster `12-organizacao-agentes-empresa.md`
> (regra de QA+Segurança), backlog `04-tasks.md` (fases) e arquitetura
> `13-arquitetura-modular.md`.

Este é o **centro de tudo**: o processo que governa como uma ideia vira software
entregue e mantido. Cada uma das 19 etapas é um **gate**: tem dono, critérios de
entrada, artefatos produzidos, critérios de saída (Definition of Done — DoD) e um
**aprovador do gate**. Nada avança "por fora"; o Agente Geral só delega a etapa
`N+1` depois que o gate `N` está aprovado.

## 1. Modelo de gates rígidos

**Regra de ouro (sequencial):** as etapas 1→19 são executadas **em ordem**. Um
gate fecha quando (a) todos os artefatos previstos existem e estão referenciados
por número (ver `doc-standards`), (b) a DoD está integralmente satisfeita e (c) o
**aprovador do gate** registra a aprovação. Só então a próxima etapa abre.

**Sem pular etapas.** Se uma etapa depende de decisão do CEO ainda "em aberto"
(ex.: `D5`/`D6` do PDR `03`), a etapa fica **bloqueada** e a pendência vira
"pergunta em aberto" — nunca se inventa a decisão (guardrail).

**Retorno controlado.** Falha na DoD **não** avança: volta ao dono da etapa (ou à
etapa 14 — Correções, quando o defeito surge na homologação). Um retorno é
registrado, não apagado.

### 1.1 Papéis de um gate

| Papel | Quem | O que faz |
|---|---|---|
| **Dono da etapa** | agente de setor responsável | Executa a etapa e produz os artefatos. |
| **Aprovador do gate** | lead/CEO indicado na tabela §3 | Verifica a DoD e libera (ou barra) a passagem. |
| **Gate transversal QA** | `qa-lead` | Obrigatório antes de fechar qualquer gate que toque **código** (ver §4). |
| **Gate transversal Segurança** | `security-lead` | Obrigatório antes de fechar qualquer gate que toque **dados/segurança** (ver §4). |
| **Orquestrador** | Agente Geral | Delega a etapa ao dono, coleta o aprovado e abre a próxima. |

## 2. As 19 etapas como portões

Para cada etapa: **dono**, **entrada** (critérios de entrada), **artefatos**,
**DoD** (critérios de saída) e **aprovador do gate**.

### Etapa 1 — Ideia
- **Dono:** `product-lead`. **Entrada:** demanda/visão do CEO.
- **Artefatos:** registro no briefing `01-briefing.md` (objetivo, valor, problema).
- **DoD:** ideia descrita com problema, valor e público; escopo macro delimitado.
- **Aprovador do gate:** **CEO**.

### Etapa 2 — Pesquisa
- **Dono:** `requirements-analyst` (reporta ao `product-lead`). **Entrada:** ideia
  aprovada (gate 1).
- **Artefatos:** notas de pesquisa/benchmark consolidadas na SPEC do tema e/ou no
  doc `15-casos-de-uso.md` (contexto/atores).
- **DoD:** contexto, restrições e referências levantados; riscos iniciais listados.
- **Aprovador do gate:** `product-lead`.

### Etapa 3 — Requisitos
- **Dono:** `requirements-analyst`. **Entrada:** pesquisa aprovada (gate 2).
- **Artefatos:** requisitos funcionais e não funcionais nas SPECs (`02`, `08`,
  `09`, `11`) e referências cruzadas no doc `15`.
- **DoD:** requisitos numerados, verificáveis e sem ambiguidade; conflitos resolvidos.
- **Aprovador do gate:** `product-lead`.

### Etapa 4 — Regras de Negócio
- **Dono:** `requirements-analyst`. **Entrada:** requisitos aprovados (gate 3).
- **Artefatos:** regras de negócio nas SPECs (ex.: RBAC/`can()`, moderação, cargos)
  e no doc `15`.
- **DoD:** cada regra tem gatilho, condição e efeito claros; ligada aos requisitos.
- **Aprovador do gate:** `product-lead`.

### Etapa 5 — Casos de Uso
- **Dono:** `requirements-analyst`. **Entrada:** regras de negócio aprovadas (gate 4).
- **Artefatos:** doc `15-casos-de-uso.md` (atores, pré-condições, fluxo principal,
  fluxos alternativos, pós-condições).
- **DoD:** todo requisito funcional está coberto por ≥1 caso de uso rastreável.
- **Aprovador do gate:** `product-lead`.

### Etapa 6 — Modelagem
- **Dono:** `eng-lead` (com `backend-engineer`). **Entrada:** casos de uso aprovados
  (gate 5).
- **Artefatos:** modelagem de domínio/dados na SPEC `02-spec.md` e na arquitetura
  modular `13-arquitetura-modular.md` (mapa de módulos/entidades).
- **DoD:** entidades, relacionamentos e fronteiras de módulo definidos e coerentes
  com os casos de uso; extensibilidade preservada (`slug`, `metadata jsonb`).
- **Aprovador do gate:** `eng-lead`.

### Etapa 7 — Protótipo UI/UX
- **Dono:** `design-lead` (7º lead, reporta ao Agente Geral). **Entrada:** modelagem
  aprovada (gate 6) — na prática o protótipo pode andar em paralelo à modelagem
  (ver §5, posição atual).
- **Artefatos:** protótipos HTML da **Fase 0.5** (`prototypes/`, tarefas `T01`–`T04d`
  do backlog `04-tasks.md`).
- **DoD:** telas e fluxo validados; navegação coerente; acessibilidade básica; pronto
  para revisão do CEO (`T05`).
- **Aprovador do gate:** **CEO** (revisão do protótipo, `T05`).

### Etapa 8 — Arquitetura
- **Dono:** `eng-lead`. **Entrada:** modelagem (gate 6) e protótipo (gate 7) aprovados.
- **Artefatos:** arquitetura modular `13-arquitetura-modular.md` (estilo, camadas,
  regras de dependência, contrato de API).
- **DoD:** estilo arquitetural decidido/recomendado; fronteiras e regras de
  dependência fixadas; decisões voláteis (`D5`/`D6`) isoladas por port/adapter.
- **Aprovador do gate:** `eng-lead` (recomendação ao CEO quando envolve `Dxx` do PDR).

### Etapa 9 — Banco de Dados
- **Dono:** `backend-engineer`. **Entrada:** arquitetura aprovada (gate 8).
- **Artefatos:** schema/migrações nas SPECs (`02` §3–4, `09`, `11`) e convenção de
  migração (`13` §6.3); `seeds/`.
- **DoD:** schema versionado (`db/migrations`), índices, `metadata jsonb` +
  timestamps, `pgvector` previsto; validado contra a modelagem (gate 6).
- **Aprovador do gate:** `eng-lead` — **+ Segurança** (dados pessoais/LGPD, ver §4).

### Etapa 10 — Planejamento
- **Dono:** `product-lead`. **Entrada:** banco de dados aprovado (gate 9).
- **Artefatos:** decisões no PDR `03-pdr.md` e backlog `04-tasks.md` (tarefas `TNN`
  por fase, dependências, critérios de aceite).
- **DoD:** escopo quebrado em tarefas pequenas, priorizadas e com critério de aceite;
  dependências e bloqueios (`D5`/`D6`) explícitos.
- **Aprovador do gate:** **CEO**.

### Etapa 11 — Desenvolvimento
- **Dono:** `eng-lead` (delega a Backend/Frontend/3D/RAG). **Entrada:** planejamento
  aprovado (gate 10).
- **Artefatos:** **código** de produção nos módulos (backend/frontend/threed),
  seguindo `13` e as skills de engenharia.
- **DoD:** funcionalidade implementada conforme SPEC/contrato; testes de unidade do
  autor passando; sem segredos hardcoded.
- **Aprovador do gate:** `eng-lead` — **+ QA e Segurança** (código/dados, ver §4).

### Etapa 12 — Testes
- **Dono:** `qa-lead` (skill `qa-checklist`). **Entrada:** desenvolvimento entregue
  (gate 11).
- **Artefatos:** plano de teste + resultados (caminho feliz e de erro, permissões
  por cargo, máquinas de estado de moderação/aprovação), checklist de regressão.
- **DoD:** todos os critérios de aceite verificados exercitando o comportamento;
  defeitos abertos triados; regressão sem falha nova.
- **Aprovador do gate:** `qa-lead`. **(Este é o gate transversal de QA — §4.)**

### Etapa 13 — Homologação (UAT)
- **Dono:** `qa-lead` (conduz) + `sicky` (executa no navegador) + **CEO** (aceita).
  **Entrada:** testes aprovados (gate 12).
- **Artefatos:** plano/roteiro e registro de homologação em `16-homologacao-uat.md`.
- **DoD:** roteiro de aceite executado; critérios de aprovação atendidos; defeitos
  encaminhados à etapa 14; aceite formal do CEO.
- **Aprovador do gate:** **CEO** (com `qa-lead` conduzindo).

### Etapa 14 — Correções
- **Dono:** `eng-lead` (delega aos engenheiros). **Entrada:** defeitos vindos da
  homologação (gate 13) ou da manutenção (etapa 17).
- **Artefatos:** correções de código + notas de fix; atualização do registro em `16`.
- **DoD:** defeito reproduzido, corrigido e **reverificado** por QA (retorno à etapa
  12/13 conforme o caso); sem regressão nova.
- **Aprovador do gate:** `qa-lead` (reverificação) — **+ Segurança** se tocou dados.

### Etapa 15 — Deploy
- **Dono:** `release-engineer` (reporta ao `devops-lead`). **Entrada:** homologação
  aprovada (gate 13) e correções fechadas (gate 14).
- **Artefatos:** estratégia de release, versionamento e checklist de deploy em
  `17-deploy-e-entrega.md`.
- **DoD:** artefato versionado, publicado no ambiente-alvo, health-check verde, plano
  de rollback pronto. Depende de `D6` (hospedagem) — **bloqueado enquanto TBD**.
- **Aprovador do gate:** `devops-lead`.

### Etapa 16 — Entrega
- **Dono:** `release-engineer`. **Entrada:** deploy aprovado (gate 15).
- **Artefatos:** documentação de entrega/handover e notas de versão em `17`.
- **DoD:** release comunicado; handover e documentação de operação entregues;
  usuários habilitados a usar a versão.
- **Aprovador do gate:** **CEO**.

### Etapa 17 — Manutenção
- **Dono:** `devops-lead`. **Entrada:** entrega concluída (gate 16).
- **Artefatos:** política e fluxo de manutenção/suporte em `18-manutencao-e-suporte.md`.
- **DoD:** tipos de manutenção (corretiva/adaptativa/evolutiva) e SLA definidos;
  fluxo de bug report ativo; defeitos roteados à etapa 14.
- **Aprovador do gate:** `devops-lead`.

### Etapa 18 — Monitoramento
- **Dono:** `sre-engineer` (reporta ao `devops-lead`). **Entrada:** manutenção em
  operação (gate 17).
- **Artefatos:** métricas/SLO, logs estruturados (`13` §6.2), alertas e dashboards em
  `19-monitoramento-observabilidade.md`.
- **DoD:** SLOs definidos e instrumentados; alertas acionáveis; dashboards no ar;
  sem logar segredos.
- **Aprovador do gate:** `devops-lead`.

### Etapa 19 — Evolução Contínua
- **Dono:** `sre-engineer` + `product-lead`. **Entrada:** monitoramento ativo (gate 18).
- **Artefatos:** loop de feedback→backlog em `19` (métricas/incidentes viram tarefas
  `TNN` no `04-tasks.md`).
- **DoD:** insights de operação/uso convertidos em itens priorizados de backlog,
  realimentando a etapa 1 (ciclo se repete).
- **Aprovador do gate:** `product-lead` (com aprovação do CEO para novo escopo).

## 3. Tabela mestre: etapa → dono → artefato/doc → aprovador do gate

| # | Etapa | Dono | Artefato / Doc | Aprovador do gate |
|---|---|---|---|---|
| 1 | Ideia | `product-lead` | `01-briefing` | CEO |
| 2 | Pesquisa | `requirements-analyst` | SPECs + `15` | `product-lead` |
| 3 | Requisitos | `requirements-analyst` | SPECs + `15` | `product-lead` |
| 4 | Regras de Negócio | `requirements-analyst` | SPECs + `15` | `product-lead` |
| 5 | Casos de Uso | `requirements-analyst` | `15-casos-de-uso` | `product-lead` |
| 6 | Modelagem | `eng-lead` / `backend-engineer` | `02-spec` / `13` | `eng-lead` |
| 7 | Protótipo UI/UX | `design-lead` | Fase 0.5 (`prototypes/`, `04` `T01`–`T04d`; `T05` = gate/aprovação CEO) | CEO |
| 8 | Arquitetura | `eng-lead` | `13-arquitetura-modular` | `eng-lead` (→ CEO p/ `Dxx`) |
| 9 | Banco de Dados | `backend-engineer` | SPECs (`02`/`09`/`11`) | `eng-lead` + Segurança |
| 10 | Planejamento | `product-lead` | `03-pdr` / `04-tasks` | CEO |
| 11 | Desenvolvimento | `eng-lead` | código | `eng-lead` + QA + Segurança |
| 12 | Testes | `qa-lead` | skill `qa-checklist` | `qa-lead` |
| 13 | Homologação | `qa-lead` + `sicky` + CEO | `16-homologacao-uat` | CEO |
| 14 | Correções | `eng-lead` | código | `qa-lead` (reverificação) |
| 15 | Deploy | `release-engineer` | `17-deploy-e-entrega` | `devops-lead` |
| 16 | Entrega | `release-engineer` | `17-deploy-e-entrega` | CEO |
| 17 | Manutenção | `devops-lead` | `18-manutencao-e-suporte` | `devops-lead` |
| 18 | Monitoramento | `sre-engineer` | `19-monitoramento-observabilidade` | `devops-lead` |
| 19 | Evolução Contínua | `sre-engineer` / `product-lead` | `19` → `04-tasks` | `product-lead` (→ CEO) |

## 4. Gates transversais obrigatórios (QA e Segurança)

Além do aprovador nominal de cada gate, **dois gates transversais** são
obrigatórios — regra já vigente no roster `12-organizacao-agentes-empresa.md` §3
(item 5) e reafirmada aqui:

1. **Gate de QA (`qa-lead`).** Obrigatório antes de fechar **qualquer gate que
   toque código** (etapas 9, 11, 14 e a própria 12). Nada é "pronto" sem
   verificação objetiva contra critérios de aceite (skill `qa-checklist`).
2. **Gate de Segurança (`security-lead`).** Obrigatório antes de fechar **qualquer
   gate que toque dados ou segurança** (etapas 9, 11, 14, 15) — OWASP/ASVS, RBAC,
   LGPD (dados pessoais do diretório), gestão de segredos, superfícies de ataque.

Se QA **ou** Segurança reprovar, o gate **não fecha**: retorna ao dono (ou à etapa
14). Estes gates são **cumulativos** ao aprovador nominal, nunca o substituem.

## 5. Posição atual do projeto

**O projeto está na Fase 0.5 (Protótipo) — etapa 7 (Protótipo UI/UX).**

- As etapas **1 (Ideia)** e **10 (Planejamento inicial)** já produziram artefatos
  (`01-briefing`, `03-pdr`, `04-tasks`); as etapas **2–6, 8–9** foram
  **adiantadas em documentação** (SPECs `02`/`08`/`09`/`11`, arquitetura `13`)
  durante a fase de planejamento, antes da formalização deste ciclo.
- **Grandfathering do protótipo.** O trabalho de protótipo já feito na Fase 0.5
  (`prototypes/`, tarefas `T01`–`T04d`) é **reconhecido como válido e não será
  refeito** só para "encaixar" retroativamente nos gates 2–6. A partir de agora,
  porém, **todo novo trabalho segue os gates rígidos** deste documento. O gate 7
  formaliza-se na revisão `T05` (aprovação do CEO).
- **Como as fases do backlog se encaixam nos gates.** As fases de `04-tasks.md`
  mapeiam nos gates deste ciclo:

| Fase do backlog (`04`) | Gates deste ciclo |
|---|---|
| Fase 0.5 — Protótipo (trabalho `T01`–`T04d`; `T05` = gate/aprovação CEO) | Etapa **7** (dono `design-lead`; aprova CEO) |
| Fase 1a — Fundação (`T06`–`T09`) | Etapas **8, 9, 11** (arquitetura/BD/dev) |
| Fase 1b/1b2/1c — Dicionário/3D/RAG | Etapas **11–12** (dev + testes) |
| Fase 1d — Frontend real | Etapas **11–12** |
| Fase 1f/1g/1h — Diretório/Comunidade/Q&A | Etapas **11–12** (+ Segurança no gate) |
| Fase 1e — Segurança transversal (`T18`/`T19`) | **Gate transversal de Segurança** (§4) |
| Fases 2–4 — futuras | Etapas **15–19** entram quando houver deploy real |

> Nota: enquanto `D6` (hospedagem) estiver **em aberto** no PDR `03`, as etapas
> **15–19** (deploy, entrega, manutenção, monitoramento) ficam **bloqueadas** para
> execução real — planejamento documental (docs `17`/`18`/`19`) pode adiantar, mas
> o gate só fecha quando houver ambiente-alvo decidido.

## 6. Fluxo do orquestrador (resumo operacional)

1. Agente Geral identifica em que **etapa/gate** o trabalho está.
2. Delega a etapa ao **dono** (via ferramenta Agent), com os artefatos de entrada.
3. Dono produz os artefatos e sinaliza DoD cumprida.
4. Aciona o(s) **gate(s) transversal(is)** aplicável(is) (QA/Segurança, §4).
5. **Aprovador do gate** verifica a DoD e libera (ou barra → retorno/etapa 14).
6. Só com o gate aprovado, o Agente Geral abre a **próxima etapa**.

## 7. Referências cruzadas

- Fundacionais: `01-briefing`, `02-spec`, `03-pdr` (`D18`/`D19`), `04-tasks`.
- Domínio: `05-cockpit-3d-reference`, `06-t04b-refinamentos`, `07`/`08`
  (diretório), `09` (cargos/comunidade), `10`/`11` (Q&A).
- Governança/arquitetura: `12-organizacao-agentes-empresa` (roster, gate QA+Seg),
  `13-arquitetura-modular`.
- Novos docs deste ciclo: `15-casos-de-uso`, `16-homologacao-uat`,
  `17-deploy-e-entrega`, `18-manutencao-e-suporte`, `19-monitoramento-observabilidade`.

## 8. Perguntas em aberto

1. **Granularidade do ciclo.** O ciclo de 19 etapas aplica-se **por release** (macro)
   ou também **por feature** dentro de uma fase? Recomendação: por release para os
   gates 1–5/15–19 e por feature para 6–14 — *aguardando confirmação do CEO*.
2. **Registro de aprovação de gate.** Onde fica o carimbo de "gate N aprovado"? Um
   log de gates neste doc §9 (a criar) ou no próprio artefato de cada etapa? —
   *aguardando decisão*.
3. **`D6` (hospedagem)** segue em aberto no PDR `03` e **bloqueia as etapas 15–19**
   para execução real — *ainda em aberto*.
4. **Paralelismo permitido.** Protótipo (7) andou em paralelo à modelagem (6) na
   prática; formalizar quais gates admitem sobreposição controlada sem quebrar a
   regra sequencial — *aguardando decisão*.
