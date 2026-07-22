# 27 — Conformidade dos Gates (Log de Gates do Ciclo de Vida)

> Status: **rascunho para o Agente Geral despachar / carimbo do CEO**.
> Última atualização: 2026-07-19 (13ª rodada — Gate 12 (Testes) carimbado: plano formal do qa-lead, 99/99 testes (70 novos), sem defeito; 12 gates conformes; RN-08 e B5 restam como pendências).
> 12ª rodada — Gate 11 (Desenvolvimento) carimbado: backend real validado por QA e Segurança após correção de 2 achados ALTA.
> 11ª rodada — Gate 9 (Banco de Dados) carimbado: schema/migrações/seeds do MVP validados por QA e Segurança.
> 10ª rodada — B1/MVP resolvido: CEO define núcleo + Componentes + Projetos (D20, PDR `03`).
> 9ª rodada — B2/LGPD resolvido: CEO confirmou dados fictícios; doc `24` atualizado.
> 8ª rodada (2026-07-19) — Gate 7 (Protótipo) carimbado; CEO aprovou o protótipo, T05 concluído; B3 resolvido.
> 7ª rodada (2026-07-17) — Gate 8 (Arquitetura) carimbado; aval oficial da Segurança APROVAR COM RESSALVA; nota R6 em `25` §8.
> 6ª rodada — Gate 5 (Casos de Uso) carimbado; doc `15` aprovado.
> 5ª rodada — Gate 4 (Regras de Negócio) carimbado; doc `28` aprovado.
> 4ª rodada — Gate 3 (Requisitos) carimbado; docs `21`/`22` aprovados.
> Nota da 3ª rodada — carimbos formais dos gates 1 (Ideia,
> briefing ampliado) e 2 (Pesquisa) após revisão de conformidade contra a DoD do `14`;
> 2ª rodada — re-verificação das correções das etapas 3, 4 e 5).
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
- **2026-07-17 (2ª rodada):** setores corrigiram as lacunas de execução das
  etapas 3, 4 e 5. **Re-verificado de verdade contra a DoD do `14`** — as três
  passam a **CONFORME** (evidência na §3). Lacunas de execução: **zeradas**. Restam
  apenas etapas dependentes de **decisão do CEO** ou de gate anterior (BLOQUEADO) e
  as de operação (N/A-futuro).
- **2026-07-17 (3ª rodada, esta):** revisão de conformidade das etapas **1 (Ideia)** e
  **2 (Pesquisa)** contra a DoD do `14` → ambas CONFORME. **Carimbos formais
  aplicados** (§5): Gate 1 re-aprovado pelo CEO para o briefing ampliado; Gate 2
  aprovado pelo `product-lead`. Ponteiro do ciclo pronto para focar a **Etapa 3
  (Requisitos)**, já CONFORME (docs `21`/`22`).

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
| 1 | Ideia | `product-lead` | `01` | Sim | **CONFORME** ✔ | — (não toca código/dados) | CEO | **Gate 1 carimbado** (§5): CEO 2026-07-13 + re-aprovação 2026-07-17 (briefing ampliado). |
| 2 | Pesquisa | `requirements-analyst` | `26` (+ `15` §1 atores) | Sim (contexto, restrições, refs, **riscos R1–R10**) | **CONFORME** ✔ | — | `product-lead` | **Gate 2 carimbado** (§5): `product-lead` 2026-07-17. |
| 3 | Requisitos | `requirements-analyst` | `21` (RF), `22` (RNF) | **Sim** — conflito de taxonomia **RESOLVIDO** | **CONFORME** ✔ | QA verificou verificabilidade e resolução | `product-lead` | **Gate 3 carimbado** (§5): `product-lead` 2026-07-17; `21`/`22` aprovados. |
| 4 | Regras de Negócio | `requirements-analyst` | **`28`** (RN-01..26) | **Sim** — regras explícitas gatilho→cond→efeito, ligadas a RF | **CONFORME** ✔ | QA (regras viram casos de teste) | `product-lead` | **Gate 4 carimbado** (§5): `product-lead` 2026-07-17; doc `28` aprovado. |
| 5 | Casos de Uso | `requirements-analyst` | `15` (CU-01..21) | **Sim** — todo RF com ≥1 CU (exceção justificada RF-070) | **CONFORME** ✔ | QA verificou rastreabilidade RF→CU | `product-lead` | **Gate 5 carimbado** (§5): `product-lead` 2026-07-17. Detalhar CU-01..08 [FUTURO] quando priorizados. |
| 6 | Modelagem | `eng-lead`/`backend-engineer` | `02` §3–4, `13` §2, `25` §3 | Base sim; módulos novos pendentes de escopo | **CONFORME** (com ressalva) | Segurança (S6 LGPD no modelo) | `eng-lead` | Detalhar entidades dos 7 módulos novos na Etapa 9. |
| 7 | Protótipo UI/UX | `design-lead` | `prototypes/`, `20`, `23` | Sim — aprovado pelo CEO | **CONFORME** ✔ | QA (regressão telas T01–T04d) | CEO | **Gate 7 carimbado** (§5): CEO 2026-07-19; `T05` concluído (`04`). |
| 8 | Arquitetura | `eng-lead` | `13`, `25` | Sim (estilo, fronteiras, `D5`/`D6` isolados, S1–S9) | **CONFORME** ✔ | QA + **Segurança APROVOU COM RESSALVA** (S1–S9 vs `24`) | `eng-lead` (→CEO p/ `Dxx`) | **Gate 8 carimbado** (§5): 2026-07-17. Ressalva R6 (assets/IP). Pré-cond. Etapa 9: B2/S6/S9. |
| 9 | Banco de Dados | `backend-engineer` | `db/migrations/0001..0007`, `seeds/*` | **Sim** — schema versionado, índices, `pgvector`, `metadata jsonb`/timestamps | **CONFORME** ✔ | **QA APROVOU COM RESSALVA** (validado contra Postgres+pgvector real) + **Segurança APROVOU COM RESSALVA** (S6/S9 conformes) | `eng-lead` + Segurança | **Gate 9 carimbado** (§5): 2026-07-19. Ressalvas de acompanhamento F1/F2 (ver §5) para a Etapa 10/11. |
| 10 | Planejamento | `product-lead` | `03`, `04` | Sim — fronteira MVP definida (D20) | **CONFORME** ✔ | — | CEO | **B1 ✔ resolvido** (CEO, 2026-07-19). Backlog `04` Fase 0.6 atualizado; carimbar gate 10. |
| 11 | Desenvolvimento | `eng-lead` | `backend/src/**` (auth, authz, dictionary, contributions, components, projects, rag stub) | **Sim** — funcionalidade implementada, testes de unidade do autor passando (29/29), sem segredos hardcoded | **CONFORME** ✔ | **QA APROVOU** (reconfirmado após fix) + **Segurança APROVOU COM RESSALVA** | `eng-lead` + QA + Seg | **Gate 11 carimbado** (§5): 2026-07-19. 2 achados ALTA do QA corrigidos (RN-06/10; listPending). Ressalvas M1/M2/M3 (Seg) e transação atômica (QA) para antes de produção. |
| 12 | Testes | `qa-lead` | `backend/src/**/*.test.ts` (99 testes, 10 arquivos) | **Sim** — critérios de aceite exercitados (caminho feliz/erro, RBAC sistemático, máquina de estados de moderação), regressão sem falha nova | **CONFORME** ✔ | **É o gate de QA (§4)** — auto-aprovado pelo `qa-lead` | `qa-lead` | **Gate 12 carimbado** (§5): 2026-07-19. Ressalva: RN-08 (revisor≠autor) em aberto — decisão de produto, não bug. |
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

### Etapa 9 — Banco de Dados · CONFORME ✔ (2026-07-19)
DoD (`14` L124): schema **versionado** (`db/migrations`), índices, `pgvector`,
validado. **Cumprida de verdade:** `db/migrations/0001-0007` (extensões,
users/role_permissions, terms, RAG/chat + `pgvector` `hnsw`, contributions/
content_revisions/audit_log, components, projects) + `seeds/*` genéricos.
**QA validou aplicando migrações e seeds do zero contra Postgres 16 + pgvector
real** (FKs, embeddings, casos de erro, idempotência) — **APROVAR COM RESSALVA**
(sem bloqueador; item médio: falta runner/tabela de controle de migração, a
resolver no bootstrap do backend). **Segurança APROVOU COM RESSALVA** — S6 (sem
tabela de pessoas) e S9 (seeds fictícios, sem sobreposição com nomes reais do
protótipo) confirmados; RBAC (D12/D13) e auditoria (D16) conformes. Ressalvas de
acompanhamento (não bloqueiam este gate): **F1** — cobrir RN-04 (coordinator não
promove a admin; ninguém muda o próprio cargo) com teste automatizado antes de
fechar a etapa de serviço (10/11); **F2** — hardening de `audit_log` (permissão
de banco append-only real) no backlog de Etapa 11/DevOps.

### Etapa 10 — Planejamento · CONFORME
DoD (`14` L132): tarefas pequenas priorizadas com critério de aceite; bloqueios
explícitos. **Verificado:** backlog `04` cumpre a forma; **fronteira MVP definida**
(D20, PDR `03`) — Fase 0.6 atualizada com `[x]`/"Fora do MVP" por item. **B1 ✔
resolvido.** Falta apenas o carimbo formal do `product-lead`/CEO (cerimônia).

### Etapa 11 — Desenvolvimento · CONFORME ✔ (2026-07-19)
DoD (`14` L142): funcionalidade implementada conforme SPEC/contrato; testes de
unidade do autor passando; sem segredos hardcoded. **Cumprida de verdade:**
`backend/` real (Express/TS) com `auth` (JWT access+refresh, bcrypt),
`core/authz` (`can()` central, RBAC via `role_permissions`), `dictionary`/
`components`/`projects` (CRUD direto + propõe-e-aprova via `contributions`),
`core/audit` (append-only), `rag` (port `LlmProvider` + stub). **QA rodou a
suíte de verdade** (29/29, `tsc --noEmit`, `build` limpos) e achou 2 problemas
de severidade ALTA (RN-06/10 sem `content_revisions`/`audit_log` na edição
direta; `listPending` vazando a fila de moderação) — **bloqueou o gate**,
`eng-lead` corrigiu ambos, **QA reconfirmou de forma independente e aprovou**.
**Segurança aprovou com ressalva** (RBAC/RN-04/auditoria/SQL parametrizado/zod
conformes; M1 rate limiting, M2 argon2, M3 CORS/helmet ficam como pendência
antes de produção, não bloqueiam o MVP em ambiente controlado).

### Etapa 12 — Testes · CONFORME ✔ (2026-07-19)
DoD (`14` L151): todos os critérios de aceite verificados exercitando o
comportamento; defeitos abertos triados; regressão sem falha nova. **Cumprida de
verdade:** plano formal do `qa-lead` além da verificação de unidade da Etapa 11 —
70 testes novos (auth/`refresh`, middleware HTTP de autenticação, `components`/
`projects` que não tinham nenhum teste, matriz sistemática de RBAC em
`contributions`: 3 cargos × 3 `target_types` × propose/approve/listPending) +
transições inválidas da máquina de estados de moderação (RN-07). Suíte total
**99/99**, `tsc`/`build` limpos, **nenhum defeito de comportamento encontrado**.
Única ressalva: **RN-08** (revisor ≠ autor) segue **não implementada** — o
próprio doc `28` §9.2 já marca essa regra como decisão de produto em aberto, não
é um bug contra critério aprovado; documentada em teste próprio, não bloqueia.

### Etapas 13–14 — Homologação / Correções · BLOQUEADO
DoD (`14` L159/L167) exigem UAT conduzido com CEO/`sicky` sobre o código já
testado. Gate **QA+Segurança** obrigatório. Pendência a resolver antes/durante:
decisão do `product-lead`/CEO sobre RN-08 (§9.2, doc `28`).

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
| ~~B1~~ | ~~Escopo MVP das 7 famílias novas~~ — **RESOLVIDO (CEO, 2026-07-19): núcleo + Componentes + Projetos** (D20). | 10, 9 | ~~CEO~~ ✔ resolvido | PDR `03` D20; `04` Fase 0.6 |
| ~~B2~~ | ~~LGPD: seed fictício × real~~ — **RESOLVIDO (CEO, 2026-07-19): fictício.** | 9 | ~~CEO~~ ✔ resolvido | `24` §1/§2 (atualizado) |
| ~~B3~~ | ~~Aprovar protótipo (`T05`)~~ — **RESOLVIDO (CEO, 2026-07-19): aprovado.** Gate 7 carimbado. | 7 | ~~CEO~~ ✔ resolvido | `04` T05 `[x]`; `27` §5 |
| B5 | **`D6` (hospedagem)** — bloqueia 15–19 e ambiente de UAT. **Em avaliação (CEO, 2026-07-19): Cloudflare** (Pages/Workers + Postgres externo tipo Neon/Supabase); compatível com a arquitetura já aprovada, **não bloqueia a Etapa 11**. Ainda não é decisão final. | 15–19, 13 | **CEO** (com `devops-lead`) | PDR `03` D6; `17` |

### 4.2 Atenção — carimbos formais e itens menores (não bloqueiam)

| A# | Item | Etapa | Setor / dono | Situação |
|---|---|---|---|---|
| A1 | RF órfãos de CU | 5 | `requirements-analyst` | **FECHADO** ✔ (CU-16..21; 0 órfãos exceto RF-070 justificado) |
| A2 | Regras de negócio consolidadas | 4 | `requirements-analyst` | **FECHADO** ✔ (doc `28` RN-01..26) |
| A5 | `assets/CREDITS.md` | 6/9 | Doc Lead | **FECHADO** ✔ (arquivo criado) |
| A3 | Aprovar/sair de "rascunho" `21`/`22` (carimbo Etapa 3) | 3 | Produto Lead | **CONCLUÍDO** ✔ (2026-07-17, §5) |
| A4 | Carimbar gate 2 (doc `26`) e gate 4 (doc `28`) | 2, 4 | Produto Lead | Gate 2 **CARIMBADO** ✔ e gate 4 **CARIMBADO** ✔ (2026-07-17, §5) |
| A6 | `D5` (provedor de LLM) — isolado por `LlmProvider` | 8/11 | CEO (com `eng-lead`) | Não bloqueia; registrar |
| A7 | WCAG-alvo (acessibilidade básica do gate 7) | 7 | Design Lead | Pendente (dívida assumida) |

---

## 5. Registro de gates aprovados (carimbos)

> Formato: `Gate N — <etapa> — <verificação QA> ; <aprovação do dono/aprovador>`.
> **Só se carimba com aprovação real registrável.**

**Aprovados / verificados:**
- **Gate 1 — Ideia — aprovado por CEO em 2026-07-13** (rodapé do PDR `03`);
  **re-aprovado por CEO em 2026-07-17** para o **briefing ampliado a partir do
  protótipo** (doc `01` §2/§3.1/§5/§8). QA/Produto verificaram a DoD (`14` L61):
  problema (§1), valor (§2/§3), público (§4) e escopo macro MVP vs. futuro (§5)
  cobertos; as perguntas em aberto (§8) são **decisões do CEO**, não lacunas de
  descrição. Este carimbo soma-se (não substitui) ao de 2026-07-13.
- **Gate 2 — Pesquisa — aprovado por `product-lead` em 2026-07-17** (QA verificou a
  DoD `14` L69: doc `26` §1 contexto, §4 restrições, §6 referências, §5 riscos
  R1–R10). Itens "a validar com fontes" (doc `26` §7 Q6–Q8: benchmark quantitativo
  sem acesso a web) são **pendência aceitável**, não bloqueio da DoD.
- **Gate 3 — Requisitos — APROVADO pelo `product-lead` em 2026-07-17** (DoD "conflitos
  resolvidos" satisfeita: taxonomia canônica fixada, doc `21` RF-002/RF-006, doc `26`
  R10 RESOLVIDO; verificado por QA). Docs `21`/`22` saíram de "rascunho". Carimbo
  aplicado pelo Agente Geral com base na revisão de conformidade do `product-lead`
  (agente indisponível por limite de sessão).
- **Gate 4 — Regras de Negócio — APROVADO pelo `product-lead` em 2026-07-17** (DoD
  "gatilho, condição e efeito claros; ligada aos requisitos" satisfeita: doc `28`
  RN-01..26 + matriz §8; verificado por QA). Doc `28` saiu de "rascunho". Carimbo
  aplicado pelo Agente Geral com base na verificação de conformidade (agente
  `product-lead` indisponível por limite de sessão).
- **Gate 5 — Casos de Uso — APROVADO pelo `product-lead` em 2026-07-17** (DoD "todo
  RF com ≥1 CU rastreável" satisfeita: matriz doc `21` §10 fechada, CU-16..21 cobrem
  os RF antes órfãos, exceção RF-070 justificada — infra/dados, não iniciada por
  ator; verificado por QA e reconfirmado pelo `product-lead`). Doc `15` saiu de
  "rascunho".

**Recomendados / prontos para carimbo:**
- **Gate 8 — Arquitetura — APROVADO em 2026-07-17.** Recomendado por `eng-lead`
  (doc `25` §10) + verificado por QA + **aval oficial da Segurança: APROVAR COM
  RESSALVA** (não-bloqueante). S1–S9 do doc `25` §8 traduzem fielmente o parecer
  `24` (CRÍTICO cobertos por S3/S6; ALTO por S9). **Ressalva registrada:** R6
  (licença/proveniência de logos e imagens de terceiros) fica fora de S1–S9 por
  design — governança de assets, tratada em `CREDITS.md`. **Pré-condições que o
  gate carrega para a Etapa 9** (de-acordo de Segurança obrigatório, `14` L126):
  decidir **B2** (LGPD, seed fictício recomendado) antes de materializar `directory`;
  aplicar **S6** (pessoas atrás de `auth`, sem seed real) e **S9** (generalizar
  códigos/fornecedores/domínios nos `seeds/`). Carimbo aplicado pelo Agente Geral
  (aprovador nominal `eng-lead`, com o aval de Segurança que faltava).

- **Gate 7 — Protótipo UI/UX — APROVADO pelo CEO em 2026-07-19** ("Vamos avançar, o
  protótipo está bom por enquanto"). Executa o `T05` (backlog `04`, marcado `[x]`).
  Aprova o escopo/UX consolidado nos docs `20`/`21`/`22`/`15` e o protótipo em
  `prototypes/portal-spa/`. **B3 resolvido.**

**Pendentes (não carimbar — bloqueio por decisão do CEO ou gate anterior):**
- Gate 6 (base OK; ressalva de escopo), Gates 11–14 (cadeia sequencial — aguardam
  execução real da Etapa 9/11), Gates 15–19 (N/A-futuro — B5).
- Gates 9 e 10: **desbloqueados** (B1 e B2 resolvidos); prontos para iniciar
  execução real / carimbo cerimonial.

---

## 6. Parecer consolidado (2ª rodada)

**Recontagem por status (19 etapas):**
- **CONFORME: 12** — Etapas **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12** (várias com
  ressalvas de acompanhamento, não bloqueantes). **Gate 12 carimbado em
  2026-07-19 — 99 testes (70 novos), regressão sem falha nova.**
- **LACUNA: 0** — **nenhuma lacuna de execução em aberto.**
- **BLOQUEADO: 2** — Etapas **13, 14** — dependem da **cadeia sequencial** (UAT
  com o CEO sobre o código já testado), não de decisão nova do CEO no sentido dos
  bloqueantes B1-B5.
- **N/A-futuro: 5** — Etapas **15–19** (execução bloqueada por `D6`/B5; gate de
  Segurança já as cobre por definição).

**Conclusão.** Os gates **1–12 estão todos carimbados/conformes**. Etapa 12
(Testes) fechada pelo `qa-lead` com plano formal além da unidade da Etapa 11 —
70 testes novos, 99/99 no total, nenhum defeito de comportamento. Única ressalva:
**RN-08** (revisor ≠ autor, doc `28` §9.2) segue como decisão de produto em
aberto, não bug — recomendo ao `product-lead`/CEO decidir antes/durante a Etapa
13 (UAT). **Todas as decisões do CEO no eixo de requisitos/planejamento/dados/
desenvolvimento/testes estão fechadas** (B1, B2, B3). O avanço do ciclo agora
depende de **conduzir a Etapa 13 (Homologação/UAT com o CEO)** e, para as etapas
15–19, de **B5** (`D6`, hospedagem — em avaliação, Cloudflare cogitado).

**Ações por setor (para o Agente Geral despachar):**
- **CEO:** decidir **RN-08** (revisor ≠ autor, opcional antes do UAT) e **B5**
  (`D6`, hospedagem) para as etapas 15–19 — ainda em avaliação (Cloudflare). A6
  (`D5`, provedor LLM) segue em aberto, isolado por port/adapter, não bloqueia.
- **Produto Lead:** gates 2–5, 10 **carimbados/conformes** ✔. Pendência: decidir
  RN-08 (doc `28` §9.2) antes da Etapa 13.
- **Segurança Lead:** Gates 8, 9, 11 carimbados; B2 fechado. Cobrar antes de
  produção: rate limiting (M1), `argon2` (M2), CORS/`helmet` (M3), aplicar
  `db/hardening/audit-log-grants.sql` no ambiente real quando D6 fechar.
- **`eng-lead` → `backend-engineer`:** Etapas 11–12 **concluídas**. Follow-up não
  bloqueante: transação atômica entre update/delete + `content_revisions` +
  `audit_log`; implementar trava de RN-08 quando o Produto decidir.
- **`qa-lead`:** Etapa 12 **concluída**. Próximo: apoiar a Etapa 13 (UAT) com
  `sicky`/CEO.
- **Design Lead:** A7 (WCAG-alvo) segue pendente; `T05` **concluído**.
- **DevOps Lead:** manter etapas 15–19 documentais até `D6` (B5); runner de
  migração (achado médio do QA na Etapa 9) ainda pendente.

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
2. ~~Escopo MVP das 7 famílias (B1)~~ — **RESOLVIDA (CEO, 2026-07-19):** núcleo +
   Componentes + Projetos (D20, PDR `03`). Etapas 9–10 desbloqueadas.
3. ~~LGPD: seed fictício × real (B2)~~ — **RESOLVIDA (CEO, 2026-07-19): fictícios.**
   Ver `24` §1/§2/§4.
4. ~~Aprovação do protótipo `T05` (B3)~~ — **RESOLVIDA (CEO, 2026-07-19): aprovado.**
   Gate 7 carimbado (§5).
5. **`D5`/`D6` (A6/B5)** — provedor de LLM e hospedagem seguem em aberto no PDR `03`;
   `D6` bloqueia 15–19. *— ainda em aberto.*
6. **Assinatura formal do aceite** (protótipo `T05` e futuros UAT) — como o CEO
   registra (citação ao pé, como nos PDRs)? *— herda `16` §6.3; aguardando decisão.*
7. **Paralelismo permitido entre gates** (`14` §8 Q4) — formalizar quais gates
   admitem sobreposição controlada. *— aguardando decisão.*
