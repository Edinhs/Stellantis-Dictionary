# 32 — Relatório de Homologação / UAT (Etapa 13) — escopo atual

> Status: **conduzido pelo QA Lead; aguarda aceite formal do CEO**.
> Última atualização: 2026-07-24.
> Autoria: QA Lead (`qa-lead`, skill `qa-checklist`), a mando do CEO (Agente Geral orquestrando).
> Cobre a **Etapa 13 (Homologação/UAT)** do ciclo `14-ciclo-de-vida-engenharia.md`.
> Deriva de: plano `16-homologacao-uat.md`, skill `qa-checklist`, SPECs `02`
> (dicionário), `09` (cargos/permissões), `11` (comunidade/Q&A), backlog
> `04-tasks.md`, regras `28-regras-de-negocio.md`, gate log `27-conformidade-gates.md`.
> **Não é homologação de produção.** Ver §1 (o que está e o que NÃO está no escopo).

---

## 1. O que está sendo homologado nesta etapa (honestidade de escopo)

A Etapa 13 homologa **o que existe hoje como artefato verificável**, que são **dois
artefatos separados que não se falam**:

| Artefato | O que é | Como foi homologado | O que NÃO é |
|---|---|---|---|
| **Protótipo estático** (`prototypes/portal-spa/`, no ar em GitHub Pages) | SPA de demonstração: login local, dicionário, chat RAG **simulado**, admin parcial, Explorador 3D, editar verbete | **Inspeção de código/DOM** dos fluxos (o agente `sicky` de navegador ao vivo é **dormente** e só sob pedido explícito do CEO — não foi acionado) | Não fala com o backend; sem RBAC real; dados em `localStorage`; RAG hardcoded |
| **Backend real** (`backend/`, Express/TS) | Auth JWT, RBAC via `can()`, CRUD de dicionário/componentes/projetos, contribuições/moderação, `audit_log`; migrações 0001–0008 | **Suíte de testes (112) + inspeção de serviço**; critérios de aceite das SPECs exercitados no nível de serviço | **Nunca rodou integrado**; sem banco vivo nesta sessão; nunca serviu uma requisição HTTP num ambiente publicado |

**O que NÃO está sendo homologado (não existe para homologar):**

- **Sistema integrado em produção** — não há SPA de produção (`frontend/src` vazio),
  não há backend implantado, não há banco vivo. O protótipo **não** consome a API.
- **Fluxo ponta-a-ponta real** (usuário logando no backend, RBAC barrando no
  servidor, dados persistidos em Postgres) — **impossível de exercitar agora**;
  depende da infra `D6` (Cloudflare + Supabase, recém-decidida, ainda não
  provisionada — doc `31`) e da SPA de produção (ainda não construída).
- **As 682/749 siglas reais** — estão em **rascunho** no repo (`data/`), **não
  carregadas** em banco nem no produto. Trabalho editorial do CEO pendente
  (tradução PT + classificação de categoria).

> **Regra de ouro do QA (skill §0):** onde não deu para executar o comportamento, o
> veredito é **BLOQUEADO / não verificado**, com o motivo — nunca "aprovado" por
> leitura de código. Isso está aplicado abaixo.

---

## 2. Ambiente de verificação (evidência de como foi exercitado)

- **Suíte de backend:** `cd backend && npm test` → **112 testes, 11 arquivos, todos
  PASS** (4.56 s). `npm run lint` (`tsc --noEmit`) e `npm run build` **limpos**.
- **Nível dos testes:** são testes de **serviço/unidade com fakes/mocks** de
  repositório e `Db` (não há Postgres nesta sessão — `psql` ao `DATABASE_URL`
  retorna *connection refused*; docker daemon indisponível). Logo as **máquinas de
  estado e a matriz RBAC estão verificadas no nível de serviço**, não contra um
  banco vivo. Ver ressalva R1 (§5).
- **Protótipo:** inspeção de `prototypes/portal-spa/app.js` (6099 linhas) e
  `index.html` — busca por chamadas de rede, simulação e sanitização.

---

## 3. Critérios de aceite e resultado (roteiros de homologação)

Legenda: **PASS** (comportamento exercitado, evidência) · **FAIL** (defeito) ·
**BLOQUEADO** (não executável agora; motivo explícito).

### 3.1 Frente A — Backend (suíte + inspeção de serviço)

| ID | Critério (SPEC/RN) | Como exercitado | Esperado | Status |
|---|---|---|---|---|
| A1 | Cadastro nasce `role='user'`; login emite JWT; `refresh` funciona (SPEC 09 §2; T08) | `auth.service.test.ts` (10) | default `user`; token emitido | **PASS** |
| A2 | Rota protegida sem token → 401; token inválido → 401 (qa-checklist §2) | `auth-middleware.test.ts` (8) | 401 sem vazar existência | **PASS** |
| A3 | Autorização **sempre** por `can()`; sem `if role==='admin'` (SPEC 09 §2.1) | Inspeção `core/authz/can.ts` + `permissions.ts` + seed `role_permissions.json` | matriz é dado, não código | **PASS** |
| A4 | Dicionário CRUD + `slug` único; **gate de categoria** rascunho↔publicado (mig 0008; RN) | `dictionary.service.test.ts` (11) | publicar sem categoria → rejeitado; rascunho aceita `category=NULL` | **PASS** (ver R1) |
| A5 | Moderação `pending→approved\|rejected\|withdrawn`; approve gera `content_revisions`; reject exige `review_note`; withdraw só do autor (SPEC 09 §4; RN-07) | `contributions.service.test.ts` (6) + `contributions.rbac-matrix.qa.test.ts` (35) | transições válidas/ inválidas corretas; efeitos colaterais | **PASS** |
| A6 | Matriz RBAC completa: 3 cargos × 3 `target_types` × propose/approve/listPending (qa-checklist §3.1) | `contributions.rbac-matrix.qa.test.ts` (35) | quem pode 2xx+efeito, quem não pode 403+sem efeito | **PASS** |
| A7 | **Anti-escalonamento RN-04** (5 regras skill §3.2) + `audit_log` de cada mudança de cargo | `users.service.test.ts` (7) | `user`→403; coordinator não cria/edita admin; ninguém muda o próprio cargo; admin OK; audita | **PASS** (crítico) |
| A8 | Regressão dos 2 achados ALTA da Etapa 11: edição direta grava `content_revisions`+`audit_log` (RN-06/10); `listPending` sem `targetType` não vaza fila | `dictionary.rn06-audit-gap.qa.test.ts` (2) + `contributions.listpending-gap.qa.test.ts` (2) | fechados | **PASS** |
| A9 | Importador de siglas: dedup normalizado, deny-by-default, fail-fast de `NODE_ENV` | `import-siglas.qa.test.ts` (10) | seguro por padrão | **PASS** |
| A10 | Componentes e Projetos: CRUD + RBAC por `component.*`/`project.*` | `components.service.test.ts` (11) + `projects.service.test.ts` (10) | mesma disciplina do dicionário | **PASS** |

### 3.2 Frente B — Protótipo (inspeção de código/DOM)

| ID | Critério | Evidência | Status |
|---|---|---|---|
| B1 | Dicionário renderiza cards com título/definição/categoria e filtros | `app.js` L221–268 (render a partir de `localStorage`/`defaultTerms`) | **PASS** (como protótipo) |
| B2 | Chat RAG é **claramente simulado**, não induz a crer em IA real integrada | `app.js` L632 `// 5. CHAT IA SIMULADO`; L737 `// Simulação de resposta do Gemini`; respostas hardcoded | **PASS** como protótipo · **BLOQUEADO** como recurso real |
| B3 | Sanitização XSS ao re-renderizar texto livre persistido (skill §2) | `escapeHtml()` L205 aplicado em título/def/categoria/autor/id (L254–268) | **PASS** |
| B4 | Login local funcional para a demo | `btnLogin` L1902 alterna estado de UI; **sem auth real** | **PASS** como protótipo |
| B5 | Botão "editar verbete" existe e é condicionado | Gated por flag `stellantis_can_edit_dictionary` no `localStorage` (L221) — **cosmético, não RBAC** | **PASS** como protótipo |
| B6 | Explorador 3D presente (glTF/hotspots) | Assets `Carro 3D/*.glb`, `cockpit_hotspots.json`, libs Three.js presentes | **PASS** (presença; render ao vivo não exercitado — sem navegador) |

### 3.3 Permissões/cargos ponta-a-ponta no artefato navegável

| ID | Critério | Status |
|---|---|---|
| C1 | RBAC (`user`/`coordinator`/`admin`) **efetivo no que o usuário toca** | **BLOQUEADO** — o único artefato navegável é o protótipo, que **não tem RBAC real** (login e "cargo" são cosméticos/`localStorage`); o RBAC real vive só no backend, que **não está no ar**. A homologação de permissão ponta-a-ponta **não pôde ser feita**. |

---

## 4. Defeitos encontrados

- **Nenhum defeito de comportamento novo** na suíte de backend (112/112 verdes,
  `tsc`/`build` limpos). Os 2 achados ALTA da Etapa 11 (RN-06/10; `listPending`)
  seguem **fechados** (A8).
- **Não é defeito, é estado de projeto (registrar, não corrigir agora):** o
  protótipo não exerce RBAC nem fala com o backend (C1) — esperado para um
  protótipo, mas **impede homologar segurança/permissão de forma ponta-a-ponta**.

---

## 5. Ressalvas e o que NÃO pôde ser homologado (com o porquê)

| # | Item não homologado | Por quê | Destrava quando |
|---|---|---|---|
| R1 | **CHECK de banco `terms_published_requires_category` (mig 0008), FKs, `pgvector`** | Sem Postgres vivo nesta sessão (`connection refused`; docker off). O gate de categoria está verificado **no serviço** (A4), **não** no CHECK da migração ao vivo. | Ambiente integrado (Supabase provisionado) |
| R2 | **Integração protótipo ↔ backend (ponta-a-ponta)** | O protótipo consome `localStorage`/dados hardcoded; **zero** chamadas à API (nenhum `fetch` para o backend). Não há SPA de produção. | SPA de produção + backend implantado |
| R3 | **RAG real (embeddings, citação de fontes, guardrail anti-alucinação — SPEC 02 §3.4)** | Backend tem apenas o **stub** `LlmProvider`; o chat do protótipo é **simulado**. Nada de IA real para homologar. | `D5` (provedor LLM) + pipeline de embeddings |
| R4 | **Rate-limit em auth/chat/criar/votar (skill §2; M1 da Segurança)** | Não implementado no MVP (pendência conhecida da Segurança). | Hardening pré-produção |
| R5 | **Comunidade/Q&A (SPEC 11): permissões `qa.*`, moderação reativa, votos** | Módulo `community-qa` **não está montado** em `app.ts` (fora do MVP D20 = núcleo + Componentes + Projetos). Idem `directory`, `workflows`, `cockpit-3d` backend. | Fase futura (fora do MVP) |
| R6 | **Diretório/`people` sob auth + moderação LGPD (skill §3.1)** | Módulo `directory` não montado; sem tabela de pessoas (S6). | Fase futura + decisão LGPD |
| R7 | **682/749 siglas reais no produto** | Em rascunho no repo; classificação/tradução editorial do CEO pendente; não carregadas em banco. | Trabalho editorial + import em ambiente real |
| R8 | **Teste E2E no navegador ao vivo** (fluxos reais clicados) | Agente `sicky` é **dormente**; só sob pedido explícito do CEO. Feito por inspeção. | Pedido do CEO por sessão `sicky` |
| R9 | **Aceite formal do CEO** | UAT termina com o **CEO** decidindo aprovado/reprovado (doc `16` §2). | Carimbo do CEO |

---

## 6. Veredito

**Cobertura:** 17 critérios exercitados/inspecionados → **16 PASS · 0 FAIL · 1
BLOQUEADO (C1)**; **9 itens não homologáveis agora** (R1–R9), todos com dependência
de infra/SPA/decisão, **nenhum por falha de execução dos setores**.

**Veredito da Etapa 13, para o escopo atual:**

> **APROVADO COM RESSALVAS — parcial e condicionado.**
> - O **backend MVP** (auth, RBAC/`can()`, dicionário/componentes/projetos,
>   moderação, `audit_log`, anti-escalonamento RN-04) **passa a homologação no nível
>   de serviço**: 112/112 testes, critérios das SPECs `02`/`09` exercitados, sem
>   defeito novo. **Homologado como componente**, não como sistema no ar.
> - O **protótipo** cumpre seu papel de demonstração navegável (dicionário, chat
>   simulado rotulado como tal, XSS tratado, 3D presente). **Homologado como
>   protótipo**, não como produto.
> - **A homologação de sistema integrado NÃO PODE ser concluída** (C1, R1–R3): não há
>   ambiente integrado, o protótipo não fala com o backend, não há RBAC no artefato
>   que o usuário toca, e não há RAG/dados reais. Esse fecho **fica pendente até
>   existir SPA de produção + backend implantado + banco (Supabase/D6)**.

**Consequência para o gate (regra sequencial do `14` §1):** o Gate 13 é
**carimbado PARCIALMENTE** para o escopo protótipo+backend-como-componente e
**registra abertos** os itens de sistema integrado, que retornam à homologação
(re-verificação por QA) **após o Deploy (Etapas 15–16)**. Não há defeitos para a
Etapa 14 (Correções). **O aceite formal (R9) é do CEO.**

---

## 7. Perguntas em aberto

1. **Aceite formal do CEO (R9)** — o CEO aceita o fecho parcial da Etapa 13 (backend
   como componente + protótipo), com o fecho integrado pendente de deploy? *— aguardando.*
2. **Sessão `sicky` ao vivo (R8)** — o CEO quer uma passada de navegador real no
   protótipo antes do carimbo? *— aguardando pedido explícito.*
3. **Re-homologação pós-deploy** — confirmar que os itens R1–R3/R5–R7 voltam à
   Etapa 13 quando o ambiente `D6` existir (é o entendimento deste relatório). *— a confirmar.*
</content>
</invoke>
