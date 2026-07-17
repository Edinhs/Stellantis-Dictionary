# 27 — Conformidade dos Gates (Log de Gates do Ciclo de Vida)

> Status: **rascunho para o Agente Geral despachar / carimbo do CEO**.
> Última atualização: 2026-07-17.
> Autoria: QA Lead (`qa-lead`, skill `qa-checklist`), a mando do CEO.
> **Fonte da verdade da DoD:** `14-ciclo-de-vida-engenharia.md` — §2 (as 19 etapas:
> dono, entrada, artefatos, DoD, aprovador), §3 (tabela mestre), §4 (gates
> transversais QA+Segurança), §5 (posição atual, mapa fase→gate, grandfathering).
> **Este doc responde à pergunta em aberto do `14` §8 Q2** ("onde fica o carimbo de
> gate aprovado?") — é o **log de gates** que faltava.
> Inventário cruzado: `01`–`13`, `15`, `16`–`19`, `20`–`26`, e código em
> `prototypes/portal-spa/`.

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
- **CONFORME** — DoD atendida pelos artefatos; falta no máximo o carimbo formal.
- **LACUNA** — artefato existe mas a DoD **não** está integralmente satisfeita
  (conflito não resolvido, cobertura incompleta, aprovação formal ausente).
- **BLOQUEADO** — depende de decisão do CEO em aberto (fronteira MVP; LGPD dados
  reais×fictício, doc `24`; `D5`/`D6`) ou de um gate anterior ainda não fechado.
- **N/A-futuro** — etapa de operação sem ambiente-alvo (`D6` TBD); planejamento
  documental pode existir, mas execução não se aplica ainda.

---

## 2. Tabela mestre de conformidade (etapas 1→19)

| # | Etapa | Dono | Artefato(s) reais | DoD atendida? | Status | Gate transversal (QA/Seg) e situação | Aprovador | Ação necessária |
|---|---|---|---|---|---|---|---|---|
| 1 | Ideia | `product-lead` | `01` | Sim | **CONFORME** | — (não toca código/dados) | CEO | Carimbar (aprovação já registrada no PDR `03`, 2026-07-13). |
| 2 | Pesquisa | `requirements-analyst` | `26` (+ `15` §1 atores) | Sim (contexto, restrições, refs, **riscos R1–R10**) | **CONFORME** | — | `product-lead` | Carimbar gate (doc `26` está "aguardando `product-lead`"). |
| 3 | Requisitos | `requirements-analyst` | `21` (RF), `22` (RNF) | **Não** — conflito de taxonomia não resolvido | **LACUNA** | QA revisa verificabilidade | `product-lead` | Resolver taxonomia de categorias (§3.3 abaixo); sair de "rascunho". |
| 4 | Regras de Negócio | `requirements-analyst` | implícitas em SPECs `02`/`09`/`11`; refs em `15` | **Parcial** — não consolidadas com gatilho/condição/efeito | **LACUNA** | QA (regras viram casos de teste) | `product-lead` | Consolidar regras explícitas ligadas a RF (§3.4). |
| 5 | Casos de Uso | `requirements-analyst` | `15` | **Não** — nem todo RF tem CU | **LACUNA** | QA (rastreabilidade RF→CU→teste) | `product-lead` | Cobrir RF órfãos (§3.5); detalhar CU-01..08. |
| 6 | Modelagem | `eng-lead`/`backend-engineer` | `02` §3–4, `13` §2, `25` §3 | Base sim; módulos novos pendentes de escopo | **CONFORME** (com ressalva) | Segurança (S6 LGPD no modelo) | `eng-lead` | Detalhar entidades dos 7 módulos novos na Etapa 9. |
| 7 | Protótipo UI/UX | `design-lead` | `prototypes/`, `20`, `23` (design system) | Artefatos sim; **falta aprovação formal (T05)** | **LACUNA** | QA (regressão telas T01–T04d) | CEO | Executar `T05` (aprovação do CEO) — gate ainda aberto. |
| 8 | Arquitetura | `eng-lead` | `13`, `25` | Sim (estilo, fronteiras, `D5`/`D6` isolados, S1–S9) | **CONFORME** | QA (esta auditoria) + Segurança (confirmar S1–S9) | `eng-lead` (→CEO p/ `Dxx`) | **Recomendado por eng-lead** (`25` §10) — carimbar após OK de QA+Seg. |
| 9 | Banco de Dados | `backend-engineer` | design em `02`/`09`/`11`/`13` §6.3, `25` §3.1 | **Não** — sem migrações versionadas; depende de escopo/LGPD | **BLOQUEADO** | QA + **Segurança** (LGPD) | `eng-lead` + Segurança | Depende do gate 8 + decisão MVP + decisão LGPD (`24`). |
| 10 | Planejamento | `product-lead` | `03`, `04` | Base sim; **fronteira MVP das 7 famílias em aberto** | **BLOQUEADO** | — | CEO | Decidir escopo MVP (Fase 0.6, `04` T05a–T05g). |
| 11 | Desenvolvimento | `eng-lead` | nenhum código de produção (só protótipo grandfathered) | Não iniciado | **BLOQUEADO** | **QA + Segurança** (obrigatórios) | `eng-lead` + QA + Seg | Aguarda gates 8→10. |
| 12 | Testes | `qa-lead` | `qa-checklist`, este `27` | Sem código a exercitar | **BLOQUEADO** | **É o gate de QA (§4)** | `qa-lead` | Aguarda entrega da Etapa 11. |
| 13 | Homologação (UAT) | `qa-lead`+`sicky`+CEO | `16` (plano) | Plano pronto; sem build a homologar | **BLOQUEADO** | QA conduz; Seg em vazamento PII | CEO | Aguarda Etapa 12; ambiente depende de `D6`. |
| 14 | Correções | `eng-lead` | — | Sem defeitos de produção (nada em UAT) | **BLOQUEADO** | QA (reverificação) + Segurança | `qa-lead` | Aguarda defeitos vindos da Etapa 13. |
| 15 | Deploy | `release-engineer` | `17` (documental) | Documental pronto; **execução bloqueada por `D6`** | **N/A-futuro** | **Segurança** (segredos runtime) | `devops-lead` + Seg | Decidir `D6` (hospedagem). |
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
delimitado." **Verificado:** `01-briefing` §1 (problema/barreira de entrada), §2
(valor/visão), §4 (usuários-alvo), §5 (escopo MVP). Aprovação do CEO registrada no
PDR `03` (rodapé, 2026-07-13). **Sem pendência.**

### Etapa 2 — Pesquisa · CONFORME (falta carimbo)
DoD (`14` L69): "contexto, restrições e referências levantados; **riscos iniciais
listados**." **Verificado:** doc `26` §1 (contexto), §3 (benchmark por 4 categorias),
§4 (restrições), §5 (**riscos R1–R10** com impacto e mitigação), §6 (referências
internas/externas). DoD integralmente atendida. Único pendente: o próprio doc `26`
encerra "aprovação do gate pendente do `product-lead`" — **carimbar** (§5 abaixo).

### Etapa 3 — Requisitos · LACUNA
DoD (`14` L76): "requisitos numerados, verificáveis e sem ambiguidade; **conflitos
resolvidos**." **Verificado:** doc `21` traz RF-001..RF-070 (≈55 RF) numerados e com
critério de aceite verificável — bom. **PORÉM a DoD falha em dois pontos:**
1. **Conflito de taxonomia NÃO resolvido.** doc `20` §8 Q4 e doc `26` R10 registram
   o conflito: o protótipo usa `{motorizacao, tecnologia, componentes, plataformas}`
   e a spec-original cita `{Tecnologia, Engenharia, Negócios, Gestão}`. O próprio
   doc `21` RF-002 lista a segunda taxonomia como exemplo enquanto o modelo de dados
   (doc `20` §4) grava a primeira — **ambiguidade ativa**. doc `21` §12 e doc `26`
   §7.5 remetem a resolução "à Etapa 3", que é justamente esta — **ainda aberta**.
2. **Docs em "rascunho para revisão"** (topo de `21`/`22`), sem aprovação do
   `product-lead`. A DoD de "sem ambiguidade / conflitos resolvidos" não pode ser
   declarada cumprida com o conflito em aberto.

### Etapa 4 — Regras de Negócio · LACUNA
DoD (`14` L83): "cada regra tem **gatilho, condição e efeito** claros; **ligada aos
requisitos**." **Verificado:** as regras existem, mas **dispersas e implícitas** nas
SPECs (`09` RBAC/`can()`/moderação, `11` Q&A/moderação reativa) e citadas de forma
solta no campo "Regras de negócio relacionadas" dos CU do doc `15`. **Não há
artefato que enuncie cada regra no formato gatilho→condição→efeito ligada a um RF.**
A skill `qa-checklist` §3–§4 depende dessas regras (anti-escalonamento, exceção LGPD
de `people`, máquinas de estado) para virar caso de teste — hoje elas teriam de ser
reconstruídas a partir do código-fonte das SPECs. **Consolidação pendente.**

### Etapa 5 — Casos de Uso · LACUNA
DoD (`14` L90): "**todo requisito funcional está coberto por ≥1 caso de uso
rastreável**." **Verificado** cruzando a matriz doc `21` §10 contra os CU do doc `15`.
A cobertura é **parcial**. RF **sem nenhum CU** (amostra confirmada na matriz):
- **RF-014** (inspeção de componente 3D / anotar ideia) — ausente da matriz §10 (que
  lista RF-010..013 e 015, pulando o 014).
- **RF-030..RF-034** (Notebook de Engenharia inteiro) — **nenhum CU** o cobre.
- **RF-039, RF-040** (Canais, Kit), **RF-042, RF-043** (Componentes Tier-1, Projetos),
  **RF-046/RF-046b** (Automações), **RF-047/048/049** (Diretrizes/Timeline/Veículos),
  **RF-055, RF-059** (perfil editável, insígnias de setor), **RF-065** (navegação SPA)
  — sem CU rastreável.
Além disso, doc `15` §3 mantém CU-01..CU-08 apenas como **candidatos** (só CU-01 tem
detalhamento-exemplo); os detalhados são CU-09..CU-15 (protótipo). doc `15` §4.4
reconhece que CU-03/06/07 [FUTURO] dependem de decisões abertas. **DoD não cumprida.**

### Etapa 6 — Modelagem · CONFORME (com ressalva)
DoD (`14` L98): "entidades, relacionamentos e fronteiras de módulo definidos e
coerentes com os casos de uso; extensibilidade preservada (`slug`, `metadata
jsonb`)." **Verificado:** SPEC `02` §3–4 + doc `13` §2/§6.3 modelam o núcleo
(`terms`, `workflows`, `contributions`, `directory`, `community-qa`, `rag`,
`auth`/`users`) com `slug`/`metadata jsonb`/`target_type` polimórfico. doc `25` §3.1
estende o mapa com os 7 módulos novos e tabelas propostas coerentes. **Ressalva:** o
detalhamento fino das entidades novas (`training`, `gamification` etc.) é
explicitamente adiado para a Etapa 9 e **condicionado ao escopo MVP** (doc `25` §11.1)
— por isso a Etapa 6 é conforme na **base transversal grandfathered**, com débito
que se materializa quando o escopo for decidido.

### Etapa 7 — Protótipo UI/UX · LACUNA (gate aberto)
DoD (`14` L108): "telas e fluxo validados; navegação coerente; acessibilidade
básica; **pronto para revisão do CEO (`T05`)**." **Verificado:** o protótipo em
`prototypes/portal-spa/` está íntegro, catalogado fielmente (doc `20`) e com design
system documentado (doc `23`); é **grandfathered** (`14` §5, não se refaz). **Porém o
gate não fechou:** `04` T05 ("Revisão/aprovação do protótipo com o CEO") está
**`[ ]` não marcada** — a aprovação formal do CEO, que É o gate desta etapa, ainda
não ocorreu. Ressalva adicional: acessibilidade é reconhecidamente **não garantida**
hoje (doc `22` RNF-014 [ALVO]); "acessibilidade básica" da DoD é dívida assumida.
**Status: aguardando `T05`.**

### Etapa 8 — Arquitetura · CONFORME (recomendado — carimbar)
DoD (`14` L116): "estilo arquitetural decidido/recomendado; fronteiras e regras de
dependência fixadas; decisões voláteis (`D5`/`D6`) isoladas por port/adapter."
**Verificado:** doc `25` cumpre item a item — §2 confirma monólito modular; §3/§6
fixam módulos, camadas e direção de dependência (incl. os 7 novos); §7 isola `D5`
(port `LlmProvider`) e `D6` (config por ambiente) como **não-bloqueantes**; §8
incorpora as restrições de segurança do doc `24` como invariantes S1–S9; §4 crava o
invariante crítico "gamificação nunca alimenta `can()`". doc `25` §10 traz a
**recomendação explícita do `eng-lead`: APROVAR a Etapa 8**. **Este é o gate com
aprovação real registrável** — pende apenas o OK cumulativo de QA (esta auditoria) e
da Segurança (confirmar que S1–S9 refletem o `24`).

### Etapa 9 — Banco de Dados · BLOQUEADO
DoD (`14` L124): "schema **versionado** (`db/migrations`), índices, `metadata jsonb`
+ timestamps, `pgvector` previsto; validado contra a modelagem." **Verificado:** o
schema está **desenhado** (SPECs + doc `25` §3.1) mas **não existe `db/migrations`
nem código** — não há artefato versionado a validar (regra de ouro `qa-checklist` §0:
não verificável ⇒ não conforme). Além disso, a Etapa 9 **depende do gate 8 fechar** e
de duas decisões do CEO: **escopo MVP** (quais tabelas materializar) e **LGPD** (seed
fictício × real, doc `24` R1/R2 — pré-condição de dado para popular seeds, doc `25`
§10). Gate exige **+ Segurança**. **Bloqueado até gate 8 + decisões.**

### Etapa 10 — Planejamento · BLOQUEADO (parcial)
DoD (`14` L132): "escopo quebrado em tarefas pequenas, priorizadas e com critério de
aceite; **dependências e bloqueios (`D5`/`D6`) explícitos**." **Verificado:** o
backlog `04` cumpre a forma (tarefas `TNN`, `> Depende de:`, blocos `D5`/`D6`
explícitos). **Porém a fronteira de MVP das 7 famílias novas está em aberto** — a
Fase 0.6 (`04` T05a–T05g) marca repetidamente "**MVP? — em aberto**", e as Notas ao
PDR pedem decisão do CEO (gamificação, notebook, automações etc.). Sem essa decisão o
planejamento **não pode priorizar** o que entra no primeiro corte. Base aprovada
(PDR `03`, 2026-07-13); a **extensão pós-protótipo é BLOQUEADO por decisão do CEO**.

### Etapas 11–14 — Dev / Testes / Homologação / Correções · BLOQUEADO
DoD respectivas (`14` L142/L151/L159/L167) exigem **código exercitado**. **Verificado:**
não existe código de produção — só o protótipo (SPA `localStorage`, sem
backend/auth/RBAC, grandfathered). Logo:
- **11 (Dev):** nada implementado; gate **QA+Segurança** obrigatório quando houver.
- **12 (Testes):** sem build a exercitar; **este doc `27` é atividade de QA de gate
  documental**, não substitui o gate de Testes de código (`qa-checklist` §0).
- **13 (UAT):** plano pronto (doc `16`), mas sem produto a homologar; ambiente
  depende de `D6`.
- **14 (Correções):** sem defeitos de produção (nada passou por UAT).
Todas **bloqueadas** pela cadeia sequencial (aguardam gates 8→10 e o início do dev).

### Etapas 15–19 — Deploy / Entrega / Manutenção / Monitoramento / Evolução · N/A-futuro
DoD (`14` L176..L207) exigem **ambiente-alvo publicado**. **Verificado:** o
planejamento documental existe (docs `17`/`18`/`19`), mas a **execução está
bloqueada por `D6`** (hospedagem TBD) — declarado no próprio `14` §3 (nota), §5
(nota) e reafirmado no doc `17` (bloqueio conhecido). **Registro obrigatório (`14`
§4):** o **gate de Segurança já cobre por definição** as cinco etapas — segredos em
runtime (16), patches/segredos (17), TLS + retenção de logs + LGPD (18), dados reais
em produção realimentando backlog (19) — e será **obrigatório quando executadas**.

---

## 4. Lista priorizada de lacunas (para o Agente Geral despachar)

### 4.1 Bloqueantes (barram o avanço sequencial)

| L# | Lacuna | Etapa | Setor / dono sugerido | Referência |
|---|---|---|---|---|
| B1 | **Decisão de escopo MVP** das 7 famílias novas (fronteira do primeiro corte) — destrava etapas 9 e 10 | 10 (e 9) | **CEO** (recomendação do Produto/Eng) | `25` §11.1; `04` Fase 0.6; `20` §8.1 |
| B2 | **Decisão LGPD**: seed **fictício × dados reais** no organograma/especialistas (~205 nomes reais versionados) — pré-condição de dado para a Etapa 9 | 9 | **CEO** (parecer Segurança: fictício) | `24` §2.1/R1–R2; `22` §9.4; `25` §11.3 |
| B3 | **Aprovação formal do protótipo (`T05`)** pelo CEO — fecha o gate 7 (posição atual do projeto) | 7 | **CEO** (conduz `design-lead`) | `04` T05; `14` §5 |
| B4 | **Conflito de taxonomia de categorias** não resolvido — barra a DoD da Etapa 3 | 3 | **Produto Lead** + `requirements-analyst` | `20` §8 Q4; `21` §12; `26` R10 |
| B5 | **`D6` (hospedagem)** em aberto — bloqueia etapas 15–19 e o ambiente de UAT | 15–19, 13 | **CEO** (com `devops-lead`) | PDR `03` D6; `14` §5; `17` |

### 4.2 Atenção (não barram, mas a DoD exige antes de "pronto")

| A# | Lacuna | Etapa | Setor / dono sugerido | Referência |
|---|---|---|---|---|
| A1 | **RF órfãos de CU** (RF-014, RF-030..034 Notebook, RF-039/040/042/043/046/047/048/049/055/059/065) — completar cobertura RF→CU | 5 | `requirements-analyst` (→ Produto) | `21` §10; `15` §3 |
| A2 | **Regras de negócio não consolidadas** (gatilho/condição/efeito ligadas a RF) — hoje implícitas nas SPECs | 4 | `requirements-analyst` (→ Produto) | `09`/`11`; `15` |
| A3 | **docs `21`/`22` em "rascunho"** sem aprovação do `product-lead` (carimbo da Etapa 3) | 3 | Produto Lead | `21`/`22` topo |
| A4 | **Carimbo do gate 2** (doc `26` aguardando `product-lead`) | 2 | Produto Lead | `26` §7 (rodapé) |
| A5 | **`assets/CREDITS.md` inexistente** (proveniência/licença de logos e avatares — R6) | 6/9 | Doc Lead | `24` R6 (confirmado ausente) |
| A6 | **`D5` (provedor de LLM)** em aberto — não bloqueia (isolado por `LlmProvider`), mas registrar | 8/11 | CEO (com `eng-lead`) | PDR `03` D5; `25` §7 |
| A7 | **Acessibilidade básica** (WCAG-alvo indefinido) — dívida assumida do gate 7 | 7 | Design Lead | `22` RNF-014; `24` §4.3 |

---

## 5. Registro de gates aprovados (carimbos)

> Seção-carimbo para responder ao `14` §8 Q2. Formato:
> `Gate N — <etapa> — aprovado por <aprovador> em AAAA-MM-DD — <evidência>.`
> **Só se carimba com aprovação real registrável.** Os demais ficam pendentes até o
> aprovador nominal (e os gates transversais QA/Segurança, quando aplicável) liberarem.

**Aprovados (registráveis hoje):**
- **Gate 1 — Ideia — aprovado por CEO em 2026-07-13** — evidência: rodapé do PDR
  `03` ("Briefing, SPEC e PDR aprovados pelo stakeholder").

**Recomendados / prontos para carimbo (falta o ato formal):**
- **Gate 2 — Pesquisa — recomendado; aguardando `product-lead`** — DoD atendida
  (doc `26` §1–§6, riscos R1–R10). Ação: `product-lead` registra o aceite.
- **Gate 8 — Arquitetura — RECOMENDADO por `eng-lead` (doc `25` §10)** — aguardando
  OK cumulativo de **QA** (esta auditoria: DoD da §3 Etapa 8 verificada como
  atendida) **e de Segurança** (confirmar S1–S9 vs. doc `24`). Ao obter os dois,
  carimbar: `Gate 8 — aprovado por eng-lead em AAAA-MM-DD (QA+Seg OK)`.

**Pendentes (não carimbar — DoD incompleta ou bloqueio):**
- Gate 3 (LACUNA — taxonomia), Gate 4 (LACUNA — regras dispersas), Gate 5 (LACUNA —
  RF órfãos), Gate 7 (aguarda `T05`/CEO), Gate 6 (base OK; ressalva de escopo),
  Gates 9–14 (BLOQUEADO), Gates 15–19 (N/A-futuro — `D6`).

**Veredito de QA sobre o Gate 8 (para o carimbo):** APROVADO COM RESSALVA — a DoD do
gate 8 está atendida (§3 Etapa 8); a ressalva é que as decisões que **a Etapa 9**
exige (MVP B1, LGPD B2) permaneçam como pendências rastreadas, não como bloqueio da
arquitetura (coerente com doc `25` §10).

---

## 6. Parecer consolidado

**Contagem por status (19 etapas):**
- **CONFORME: 4** — Etapas **1, 2, 6, 8** (2 e 6 com ressalva; 8 recomendado, a
  carimbar após QA+Seg).
- **LACUNA: 4** — Etapas **3** (taxonomia), **4** (regras dispersas), **5** (RF sem
  CU), **7** (falta aprovação `T05`).
- **BLOQUEADO: 6** — Etapas **9, 10, 11, 12, 13, 14** (decisões MVP/LGPD/`D6` e
  cadeia sequencial de dev/teste ainda não iniciada).
- **N/A-futuro: 5** — Etapas **15–19** (execução bloqueada por `D6`; gate de
  Segurança já as cobre por definição).

**Conclusão.** Nenhuma etapa nova deve abrir sem sanar as lacunas dos gates
anteriores. O caminho crítico imediato é **destravar decisões do CEO** (B1 escopo
MVP, B2 LGPD, B3 aprovar protótipo/`T05`, B5 `D6`) e **fechar a Etapa 3** (B4
taxonomia, A2/A1 regras e CU). O **Gate 8 pode ser carimbado** assim que Segurança
confirmar S1–S9; ele é o gate mais maduro e não deve ser refém das decisões que só a
Etapa 9 exige.

**Ações por setor (para o Agente Geral despachar):**
- **CEO:** B1 (escopo MVP), B2 (LGPD), B3 (aprovar `T05`), B5 (`D6`), A6 (`D5`).
- **Produto Lead:** A4 (carimbar gate 2), A3 (aprovar `21`/`22`), coordenar B4/A1/A2.
- **`requirements-analyst`:** B4 (resolver taxonomia na Etapa 3), A1 (RF→CU), A2
  (consolidar regras de negócio).
- **Segurança Lead:** confirmar S1–S9 do doc `25` p/ carimbar Gate 8; manter B2.
- **`eng-lead`:** carimbar Gate 8 (após QA+Seg); detalhar entidades novas na Etapa 9.
- **Design Lead:** A7 (definir WCAG-alvo); conduzir `T05` com o CEO.
- **Doc Lead:** A5 (criar `assets/CREDITS.md`).
- **DevOps Lead:** manter etapas 15–19 documentais até `D6`.

**Correção de rastreabilidade aplicada nesta auditoria (trivial e segura):** doc `26`
§3.d referenciava os RF do Explorador 3D como `RF-006..RF-009` (RF inexistentes /
do Dicionário); corrigido para **`RF-010..RF-015`** (os RF reais do 3D no doc `21`).
Nenhuma outra edição de conteúdo foi feita — as demais lacunas são decisão/conteúdo e
apenas reportadas.

---

## 7. Perguntas em aberto

1. **Registro de aprovação de gate (`14` §8 Q2)** — este doc `27` passa a ser o **log
   canônico de gates**? Confirmar com o CEO/Agente Geral que os carimbos ficam aqui
   (§5), e não espalhados em cada artefato. *— proposta deste doc; aguardando
   confirmação.*
2. **Escopo MVP das 7 famílias (B1)** — quais entram no primeiro corte? Bloqueia
   etapas 9–10. *— decisão do CEO em aberto (herda `25` §11.1, `20` §8.1).*
3. **LGPD: seed fictício × real (B2)** — pré-condição da Etapa 9. *— decisão do CEO em
   aberto (herda `24` §4.1).*
4. **Taxonomia de categorias (B4)** — qual conjunto vale? Fecha a DoD da Etapa 3. *—
   a resolver na Etapa 3 (herda `20` §8 Q4, `21` §12, `26` §7.5).*
5. **`D5`/`D6` (A6/B5)** — provedor de LLM e hospedagem seguem em aberto no PDR `03`;
   `D6` bloqueia 15–19. *— ainda em aberto.*
6. **Assinatura formal do aceite** (protótipo `T05` e futuros UAT) — como o CEO
   registra (citação ao pé, como nos PDRs)? *— herda `16` §6.3; aguardando decisão.*
7. **Paralelismo permitido entre gates** (`14` §8 Q4) — formalizar quais gates
   admitem sobreposição (protótipo 7 andou em paralelo à modelagem 6). *— aguardando
   decisão.*
