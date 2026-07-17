# 27 — Conformidade dos Gates (Log de Gates do Ciclo de Vida)

> Status: **rascunho para o Agente Geral despachar / carimbo do CEO**.
> Última atualização: 2026-07-17 (2ª rodada — re-verificação das correções das
> etapas 3, 4 e 5).
> Autoria: QA Lead (`qa-lead`, skill `qa-checklist`), a mando do CEO.
> **Fonte da verdade da DoD:** `14-ciclo-de-vida-engenharia.md` — §2 (as 19 etapas:
> dono, entrada, artefatos, DoD, aprovador), §3 (tabela mestre), §4 (gates
> transversais QA+Segurança), §5 (posição atual, mapa fase→gate, grandfathering).
> **Este doc responde à pergunta em aberto do `14` §8 Q2** ("onde fica o carimbo de
> gate aprovado?") — é o **log de gates** que faltava.
> Inventário cruzado: `01`–`13`, `15`, `16`–`19`, `20`–`26`, **`28` (regras de
> negócio)**, e código em `prototypes/portal-spa/`.

---

## 0. Registro de mudanças

- **2026-07-17 (1ª rodada):** auditoria inicial. Etapas 3, 4, 5, 7 = LACUNA.
- **2026-07-17 (2ª rodada, esta):** setores corrigiram as lacunas de execução das
  etapas 3, 4 e 5. **Re-verificado de verdade contra a DoD do `14`** — as três
  passam a **CONFORME** (evidência na §3). Lacunas de execução: **zeradas**. Restam
  apenas etapas dependentes de **decisão do CEO** ou de gate anterior (BLOQUEADO) e
  as de operação (N/A-futuro).

---

## 1. Método e legenda

**Como cada etapa foi verificada.** Para cada uma das 19 etapas do `14` §2, cruzei a
**DoD declarada** contra os **artefatos reais** existentes (por número), exercitando
o critério — não apenas lendo. Onde a DoD exige comportamento em código (etapas
9, 11–14), aplico a **regra de ouro** da skill `qa-checklist` §0: sem execução real,
o veredito é **BLOQUEADO / não verificado**, com o motivo explícito. Não invento
decisão do CEO (guardrail): o que depende de decisão em aberto vira **BLOQUEADO** e
pergunta em aberto (§7).

**Legenda de Status:**
- **CONFORME** — DoD atendida pelos artefatos e verificada por QA; falta no máximo o
  carimbo formal do aprovador nominal.
- **LACUNA** — artefato existe mas a DoD **não** está integralmente satisfeita.
- **BLOQUEADO** — depende de **decisão do CEO** em aberto (fronteira MVP; LGPD dados
  reais×fictício, doc `24`; `D5`/`D6`; aprovar `T05`) ou de um gate anterior ainda
  não fechado. **Não é lacuna de execução dos setores.**
- **N/A-futuro** — etapa de operação sem ambiente-alvo (`D6` TBD); planejamento
  documental pode existir, mas execução não se aplica ainda.

---

## 2. Tabela mestre de conformidade (etapas 1→19)

| # | Etapa | Dono | Artefato(s) reais | DoD atendida? | Status | Gate transversal (QA/Seg) e situação | Aprovador | Ação necessária |
|---|---|---|---|---|---|---|---|---|
| 1 | Ideia | `product-lead` | `01` | Sim | **CONFORME** | — (não toca código/dados) | CEO | Aprovação já registrada no PDR `03` (2026-07-13). |
| 2 | Pesquisa | `requirements-analyst` | `26` (+ `15` §1 atores) | Sim (contexto, restrições, refs, **riscos R1–R10**) | **CONFORME** | — | `product-lead` | Carimbar gate (doc `26` "aguardando `product-lead`"). |
| 3 | Requisitos | `requirements-analyst` | `21` (RF), `22` (RNF) | **Sim** — conflito de taxonomia **RESOLVIDO** | **CONFORME** ✔ | QA verificou verificabilidade e resolução | `product-lead` | Carimbar (conteúdo pronto; sair de "rascunho"). |
| 4 | Regras de Negócio | `requirements-analyst` | **`28`** (RN-01..26) | **Sim** — regras explícitas gatilho→cond→efeito, ligadas a RF | **CONFORME** ✔ | QA (regras viram casos de teste) | `product-lead` | Carimbar (doc `28` "aguardando `product-lead`"). |
| 5 | Casos de Uso | `requirements-analyst` | `15` (CU-01..21) | **Sim** — todo RF com ≥1 CU (exceção justificada RF-070) | **CONFORME** ✔ | QA verificou rastreabilidade RF→CU | `product-lead` | Carimbar; detalhar CU-01..08 [FUTURO] quando priorizados. |
| 6 | Modelagem | `eng-lead`/`backend-engineer` | `02` §3–4, `13` §2, `25` §3 | Base sim; módulos novos pendentes de escopo | **CONFORME** (com ressalva) | Segurança (S6 LGPD no modelo) | `eng-lead` | Detalhar entidades dos 7 módulos novos na Etapa 9. |
| 7 | Protótipo UI/UX | `design-lead` | `prototypes/`, `20`, `23` | Artefatos prontos; **falta aprovação formal do CEO (`T05`)** | **BLOQUEADO** (decisão CEO) | QA (regressão telas T01–T04d) | CEO | **B3** — executar `T05` (ato de aprovação do CEO). Sem lacuna de execução. |
| 8 | Arquitetura | `eng-lead` | `13`, `25` | Sim (estilo, fronteiras, `D5`/`D6` isolados, S1–S9) | **CONFORME** | QA (esta auditoria) + Segurança (confirmar S1–S9) | `eng-lead` (→CEO p/ `Dxx`) | **Recomendado por eng-lead** (`25` §10) — carimbar após OK de Seg. |
| 9 | Banco de Dados | `backend-engineer` | design em `02`/`09`/`11`/`13`/`25` §3.1 | **Não** — sem migrações; depende de escopo/LGPD | **BLOQUEADO** (decisão CEO + gate 8) | QA + **Segurança** (LGPD) | `eng-lead` + Segurança | Depende de gate 8 + **B1** (MVP) + **B2** (LGPD). |
| 10 | Planejamento | `product-lead` | `03`, `04` | Base sim; **fronteira MVP das 7 famílias em aberto** | **BLOQUEADO** (decisão CEO) | — | CEO | **B1** — decidir escopo MVP (Fase 0.6, `04` T05a–T05g). |
| 11 | Desenvolvimento | `eng-lead` | nenhum código de produção (só protótipo grandfathered) | Não iniciado | **BLOQUEADO** (gates 8→10) | **QA + Segurança** (obrigatórios) | `eng-lead` + QA + Seg | Aguarda gates 8→10. |
| 12 | Testes | `qa-lead` | `qa-checklist`, este `27` | Sem código a exercitar | **BLOQUEADO** (gate 11) | **É o gate de QA (§4)** | `qa-lead` | Aguarda entrega da Etapa 11. |
| 13 | Homologação (UAT) | `qa-lead`+`sicky`+CEO | `16` (plano) | Plano pronto; sem build a homologar | **BLOQUEADO** (gate 12 + `D6`) | QA conduz; Seg em vazamento PII | CEO | Aguarda Etapa 12; ambiente depende de **B5** (`D6`). |
| 14 | Correções | `eng-lead` | — | Sem defeitos de produção | **BLOQUEADO** (gate 13) | QA (reverificação) + Segurança | `qa-lead` | Aguarda defeitos vindos da Etapa 13. |
| 15 | Deploy | `release-engineer` | `17` (documental) | Documental pronto; **execução bloqueada por `D6`** | **N/A-futuro** | **Segurança** (segredos runtime) | `devops-lead` + Seg | **B5** — decidir `D6`. |
| 16 | Entrega | `release-engineer` | `17` (documental) | idem | **N/A-futuro** | **Segurança** (config produção) | CEO + Seg | Depende do gate 15. |
| 17 | Manutenção | `devops-lead` | `18` (documental) | idem | **N/A-futuro** | **Segurança** (patches/segredos) | `devops-lead` + Seg | Depende da Entrega. |
| 18 | Monitoramento | `sre-engineer` | `19` (documental) | idem | **N/A-futuro** | **Segurança** (TLS, retenção logs, LGPD) | `devops-lead` + Seg | Depende da Manutenção. |
| 19 | Evolução Contínua | `sre-engineer`/`product-lead` | `19` → `04` (documental) | idem | **N/A-futuro** | **Segurança** (dados reais em produção) | `product-lead` (→CEO) + Seg | Depende do Monitoramento. |

> Nota (`14` §4): o **gate de Segurança** cobre por definição as etapas 9, 11, 14,
> 15, 16, 17, 18 e 19 — inclusive as N/A-futuro, que quando executadas o exigem.

---

## 3. Verificação da DoD por etapa (evidência)

### Etapa 1 — Ideia · CONFORME
DoD (`14` L61): "ideia descrita com problema, valor e público; escopo macro
delimitado." **Verificado:** `01-briefing` §1/§2/§4/§5. Aprovação do CEO registrada
no PDR `03` (rodapé, 2026-07-13). **Sem pendência.**

### Etapa 2 — Pesquisa · CONFORME (falta carimbo)
DoD (`14` L69): "contexto, restrições e referências levantados; **riscos iniciais
listados**." **Verificado:** doc `26` §1/§3/§4/§5 (**riscos R1–R10**)/§6. DoD atendida;
falta apenas o carimbo do `product-lead`.

### Etapa 3 — Requisitos · CONFORME ✔ (re-verificado 2ª rodada)
DoD (`14` L76): "requisitos numerados, verificáveis e sem ambiguidade; **conflitos
resolvidos**." **Re-verificado:** o conflito de taxonomia que reprovava esta etapa na
1ª rodada está **RESOLVIDO**:
- doc `21` **RF-002** fixa a taxonomia canônica **`{motorizacao, tecnologia,
  componentes, plataformas}`** com citação de decisão do CEO (2026-07-17, "o
  protótipo manda") e **descarta explicitamente** a lista da spec-original; o
  critério de aceite passou a enumerar exatamente esses botões.
- doc `21` **RF-006** alinhado (campo `categoria` aceita apenas esses valores).
- doc `26` **R10** marcado **RESOLVIDO**; doc `26` §7.5 riscado.
- doc `20` §8 Q4 (inventário-fonte) **riscado** e apontando à resolução (correção de
  rastreabilidade aplicada nesta auditoria — §6).
Não restam ambiguidades/conflitos abertos na taxonomia. Os RF seguem numerados e com
critério verificável. **DoD atendida.** (Ressalva formal: doc `21`/`22` ainda marcam
"rascunho" no topo — é o **carimbo do `product-lead`** que falta, não conteúdo.)

### Etapa 4 — Regras de Negócio · CONFORME ✔ (re-verificado 2ª rodada)
DoD (`14` L83): "cada regra tem **gatilho, condição e efeito** claros; **ligada aos
requisitos**." **Re-verificado** no novo doc `28`:
- **RN-01..RN-26** — cada regra escrita no formato explícito **Gatilho → Condição →
  Efeito** (verificado item a item: RBAC/`can()` RN-01..04; moderação/máquina de
  estados RN-05..10; Q&A RN-11..14; gamificação-invariante RN-15..20; `target_type`
  RN-21; RAG RN-22..23; LGPD/pessoas RN-24..26).
- **Ligação a RF:** cada RN cita os `RF-###` cobertos **e** a SPEC de origem; a
  **§8 traz a matriz RN↔RF↔fonte** completa. Sem regra "solta".
- O invariante crítico está capturado (**RN-15**: gamificação nunca alimenta
  `can()`), coerente com doc `25` §4/S4 e a skill `qa-checklist` §3.
As regras que a skill de QA precisa para virar caso de teste (anti-escalonamento
RN-04, exceção LGPD RN-24, máquinas de estado RN-07/RN-14) agora estão explícitas.
**DoD atendida.** (Falta o carimbo do `product-lead`.)

### Etapa 5 — Casos de Uso · CONFORME ✔ (re-verificado 2ª rodada)
DoD (`14` L90): "**todo requisito funcional está coberto por ≥1 caso de uso
rastreável**." **Re-verificado varrendo eu mesmo** cada RF do doc `21` contra a
matriz §10 e os "Requisitos cobertos" dos CU do doc `15`:
- Os RF antes órfãos agora têm CU: **RF-014**→CU-17; **RF-021/022**→CU-03/09/13;
  **RF-030..034** (Notebook)→CU-16; **RF-039/040/042/043/046/046b**→CU-18;
  **RF-047/048/049**→CU-19; **RF-055/059**→CU-20; **RF-065**→CU-21. Verifiquei que
  os CU-16..CU-21 existem detalhados no doc `15` §3.2 (com linha "Requisitos
  cobertos").
- FUTUROS mapeados: RF-062→CU-01, RF-063→CU-05/06/14, RF-064→CU-06, RF-067→CU-07,
  RF-068→CU-03, RF-069→CU-08/13.
- **Única exceção: RF-070** (migração `localStorage`→backend) — **sem CU, e com
  justificativa válida**: é requisito de **infraestrutura/dados transversal**, não
  iniciado por um ator, verificável por critério técnico (dados em Postgres via API
  autenticada). Não é órfão por omissão. **QA aceita a exceção.**
**DoD atendida** (cobertura RF→CU completa; a única lacuna do doc `15` que resta é o
detalhamento dos CU-01..08 [FUTURO], que dependem de decisões abertas — não conta
contra esta DoD, que é de *cobertura*).

### Etapa 6 — Modelagem · CONFORME (com ressalva)
DoD (`14` L98): entidades/relacionamentos/fronteiras coerentes com CUs;
extensibilidade (`slug`, `metadata jsonb`). **Verificado:** SPEC `02` §3–4 + doc `13`
§2/§6.3 (núcleo) + doc `25` §3.1 (7 módulos novos com tabelas propostas).
**Ressalva:** detalhamento fino das entidades novas adiado à Etapa 9 e condicionado
ao escopo MVP (doc `25` §11.1).

### Etapa 7 — Protótipo UI/UX · BLOQUEADO (decisão do CEO — B3)
DoD (`14` L108): "telas/fluxo validados; navegação coerente; acessibilidade básica;
**pronto para revisão do CEO (`T05`)**." **Verificado:** o protótipo está íntegro e
catalogado (doc `20`, design system doc `23`); é grandfathered. **Não há lacuna de
execução dos setores** — o único pendente é o **ato de aprovação do CEO** (`04` T05,
ainda `[ ]`), que É o aprovador nominal do gate. Por isso a etapa é **BLOQUEADO por
decisão do CEO (B3)**, não LACUNA. (Ressalva: acessibilidade "básica" é dívida
assumida — doc `22` RNF-014 [ALVO], WCAG-alvo em aberto A7.)

### Etapa 8 — Arquitetura · CONFORME (recomendado — carimbar)
DoD (`14` L116): estilo decidido; fronteiras/regras fixadas; `D5`/`D6` isolados por
port/adapter. **Verificado:** doc `25` §2 (monólito modular), §3/§6 (módulos/camadas/
dependências, incl. 7 novos), §7 (`D5`/`D6` isolados, não-bloqueantes), §8 (S1–S9 do
doc `24`), §4 (invariante gamificação≠`can()`). doc `25` §10 = **recomendação do
`eng-lead` de APROVAR**. Pende apenas OK cumulativo da Segurança (S1–S9 vs. `24`).

### Etapa 9 — Banco de Dados · BLOQUEADO
DoD (`14` L124): schema **versionado** (`db/migrations`), índices, `pgvector`,
validado. **Verificado:** schema **desenhado** (SPECs + doc `25` §3.1) mas **sem
`db/migrations` nem código** — não verificável (regra de ouro `qa-checklist` §0).
Depende de gate 8 + **B1** (escopo MVP) + **B2** (LGPD, doc `24` R1/R2). Gate exige
**+ Segurança**.

### Etapa 10 — Planejamento · BLOQUEADO (parcial)
DoD (`14` L132): tarefas pequenas priorizadas com critério de aceite; bloqueios
explícitos. **Verificado:** backlog `04` cumpre a forma. **Fronteira MVP das 7
famílias em aberto** (Fase 0.6 marca "MVP? — em aberto"). Base aprovada (PDR `03`);
a extensão pós-protótipo é **BLOQUEADO por B1**.

### Etapas 11–14 — Dev / Testes / Homologação / Correções · BLOQUEADO
DoD (`14` L142/L151/L159/L167) exigem **código exercitado**. **Verificado:** não
existe código de produção (só protótipo grandfathered). Todas **bloqueadas** pela
cadeia sequencial (aguardam gates 8→10 e início do dev). Gate **QA+Segurança**
obrigatório quando houver entrega. Este doc `27` é QA de gate documental — **não**
substitui o gate de Testes de código.

### Etapas 15–19 — Deploy / Entrega / Manutenção / Monitoramento / Evolução · N/A-futuro
DoD (`14` L176..L207) exigem ambiente-alvo publicado. **Verificado:** planejamento
documental existe (`17`/`18`/`19`), execução **bloqueada por `D6`** (B5). O **gate de
Segurança já as cobre por definição** (`14` §4) e será obrigatório quando executadas.

---

## 4. Lista priorizada de lacunas (para o Agente Geral despachar)

> **Atualização 2ª rodada:** as lacunas de **execução** (etapas 3, 4, 5 e A1/A2/A5)
> foram **fechadas**. O que resta é **decisão do CEO** e carimbos formais.

### 4.1 Bloqueantes — todos dependem de DECISÃO DO CEO (não de execução)

| L# | Bloqueante | Etapa | Setor / dono | Referência |
|---|---|---|---|---|
| B1 | **Escopo MVP** das 7 famílias novas — destrava etapas 9 e 10 | 10, 9 | **CEO** (recomendação Produto/Eng) | `25` §11.1; `04` Fase 0.6 |
| B2 | **LGPD**: seed **fictício × real** no organograma/especialistas (~205 nomes reais) — pré-condição da Etapa 9 | 9 | **CEO** (parecer Seg: fictício) | `24` §2.1/R1–R2; `28` RN-26 |
| B3 | **Aprovar protótipo (`T05`)** — fecha o gate 7 (posição atual) | 7 | **CEO** (conduz `design-lead`) | `04` T05; `14` §5 |
| B5 | **`D6` (hospedagem)** — bloqueia 15–19 e ambiente de UAT | 15–19, 13 | **CEO** (com `devops-lead`) | PDR `03` D6; `17` |

### 4.2 Atenção — carimbos formais e itens menores (não bloqueiam)

| A# | Item | Etapa | Setor / dono | Situação |
|---|---|---|---|---|
| A1 | RF órfãos de CU | 5 | `requirements-analyst` | **FECHADO** ✔ (CU-16..21; 0 órfãos exceto RF-070 justificado) |
| A2 | Regras de negócio consolidadas | 4 | `requirements-analyst` | **FECHADO** ✔ (doc `28` RN-01..26) |
| A5 | `assets/CREDITS.md` | 6/9 | Doc Lead | **FECHADO** ✔ (arquivo criado) |
| A3 | Aprovar/sair de "rascunho" `21`/`22` (carimbo Etapa 3) | 3 | Produto Lead | Pendente (só carimbo) |
| A4 | Carimbar gate 2 (doc `26`) e gate 4 (doc `28`) | 2, 4 | Produto Lead | Pendente (só carimbo) |
| A6 | `D5` (provedor de LLM) — isolado por `LlmProvider` | 8/11 | CEO (com `eng-lead`) | Não bloqueia; registrar |
| A7 | WCAG-alvo (acessibilidade básica do gate 7) | 7 | Design Lead | Pendente (dívida assumida) |

---

## 5. Registro de gates aprovados (carimbos)

> Formato: `Gate N — <etapa> — <verificação QA> ; <aprovação do dono/aprovador>`.
> **Só se carimba com aprovação real registrável.**

**Aprovados / verificados:**
- **Gate 1 — Ideia — aprovado por CEO em 2026-07-13** (rodapé do PDR `03`).
- **Gate 3 — Requisitos — verificado por QA em 2026-07-17** (DoD "conflitos
  resolvidos" satisfeita: taxonomia canônica fixada, doc `21` RF-002/RF-006, doc `26`
  R10 RESOLVIDO); **aprovação do `product-lead` pendente** (carimbo formal — A3).
- **Gate 4 — Regras de Negócio — verificado por QA em 2026-07-17** (DoD "gatilho,
  condição e efeito claros; ligada aos requisitos" satisfeita: doc `28` RN-01..26 +
  matriz §8); **aprovação do `product-lead` pendente** (A4).
- **Gate 5 — Casos de Uso — verificado por QA em 2026-07-17** (DoD "todo RF com ≥1
  CU rastreável" satisfeita: matriz doc `21` §10 fechada, CU-16..21, exceção RF-070
  justificada); **aprovação do `product-lead` pendente**.

**Recomendados / prontos para carimbo:**
- **Gate 2 — Pesquisa — verificado por QA (DoD atendida); aguardando `product-lead`.**
- **Gate 8 — Arquitetura — RECOMENDADO por `eng-lead` (doc `25` §10) + verificado por
  QA em 2026-07-17;** aguardando **Segurança** confirmar S1–S9 vs. doc `24`.

**Pendentes (não carimbar — bloqueio por decisão do CEO ou gate anterior):**
- Gate 6 (base OK; ressalva de escopo), Gate 7 (aguarda `T05`/CEO — B3), Gates 9–14
  (BLOQUEADO — B1/B2/`D6` e cadeia sequencial), Gates 15–19 (N/A-futuro — B5).

---

## 6. Parecer consolidado (2ª rodada)

**Recontagem por status (19 etapas):**
- **CONFORME: 7** — Etapas **1, 2, 3, 4, 5, 6, 8** (2/6 com ressalva; 8 recomendado,
  a carimbar após Segurança). **↑3 desde a 1ª rodada** (3, 4, 5 subiram).
- **LACUNA: 0** — **nenhuma lacuna de execução em aberto.**
- **BLOQUEADO: 7** — Etapas **7, 9, 10, 11, 12, 13, 14** — **todas dependem de decisão
  do CEO** (B1 MVP, B2 LGPD, B3 aprovar `T05`, B5 `D6`) **ou de gate anterior na
  cadeia sequencial**, não de trabalho pendente dos setores.
- **N/A-futuro: 5** — Etapas **15–19** (execução bloqueada por `D6`/B5; gate de
  Segurança já as cobre por definição).

**Conclusão.** As três lacunas de execução apontadas na 1ª rodada (etapas 3, 4, 5)
foram corrigidas e **re-verificadas de verdade contra a DoD do `14`** — passam a
CONFORME. **Não resta nenhuma lacuna de execução.** O avanço do ciclo agora depende
**exclusivamente de decisões do CEO** (B1, B2, B3, B5) e de carimbos formais do
`product-lead` (gates 2, 3, 4, 5) e da Segurança (gate 8). O Gate 8 é o mais maduro e
pode ser carimbado assim que a Segurança confirmar S1–S9.

**Ações por setor (para o Agente Geral despachar):**
- **CEO:** B1 (escopo MVP), B2 (LGPD), B3 (aprovar `T05`), B5 (`D6`), A6 (`D5`).
- **Produto Lead:** carimbar gates 2, 3, 4, 5 (conteúdo verificado por QA); sair de
  "rascunho" em `21`/`22`/`26`/`28`.
- **Segurança Lead:** confirmar S1–S9 do doc `25` para carimbar o Gate 8; manter B2.
- **`eng-lead`:** carimbar Gate 8 (após Seg); detalhar entidades novas na Etapa 9.
- **Design Lead:** A7 (WCAG-alvo); conduzir `T05` com o CEO.
- **DevOps Lead:** manter etapas 15–19 documentais até `D6`.

**Correções de rastreabilidade aplicadas por esta auditoria (triviais e seguras):**
1. (1ª rodada) doc `26` §3.d: `RF-006..RF-009` → **`RF-010..RF-015`** (RF reais do 3D).
2. (2ª rodada) doc `20` §8 Q4 (taxonomia): **riscado** e apontando à resolução (doc
   `21` RF-002/RF-006, doc `26` R10), para o inventário-fonte não contradizer os docs
   derivados. Nenhuma outra edição de conteúdo — o restante é decisão/carimbo e
   apenas reportado.

---

## 7. Perguntas em aberto

1. **Registro de aprovação de gate (`14` §8 Q2)** — este doc `27` passa a ser o **log
   canônico de gates** (carimbos na §5)? *— proposta deste doc; aguardando
   confirmação.*
2. **Escopo MVP das 7 famílias (B1)** — bloqueia etapas 9–10. *— decisão do CEO em
   aberto.*
3. **LGPD: seed fictício × real (B2)** — pré-condição da Etapa 9. *— decisão do CEO em
   aberto.*
4. **Aprovação do protótipo `T05` (B3)** — fecha o gate 7. *— decisão do CEO em
   aberto.*
5. **`D5`/`D6` (A6/B5)** — provedor de LLM e hospedagem seguem em aberto no PDR `03`;
   `D6` bloqueia 15–19. *— ainda em aberto.*
6. **Assinatura formal do aceite** (protótipo `T05` e futuros UAT) — como o CEO
   registra (citação ao pé, como nos PDRs)? *— herda `16` §6.3; aguardando decisão.*
7. **Paralelismo permitido entre gates** (`14` §8 Q4) — formalizar quais gates
   admitem sobreposição controlada. *— aguardando decisão.*
