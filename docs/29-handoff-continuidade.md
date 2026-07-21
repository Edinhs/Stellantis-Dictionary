# 29 — Handoff de Continuidade (para outra IA continuar o projeto)

> Status: **vivo**.
> Última atualização: 2026-07-19.
> Autoria: Agente Geral (orquestrador).
> **Propósito:** permitir que **outra IA** (ou outra sessão) assuma o papel de
> **Agente Geral** e continue o projeto sem perder contexto quando o limite de
> tokens/sessão acabar. Leia este documento primeiro; ele referencia os demais por
> número. Fonte da verdade dos gates: doc `27`; do ciclo: doc `14`.

---

## 0. Estado atual (leitura rápida)

| Item | Situação |
|---|---|
| **Repositório** | `Edinhs/Stellantis-Dictionary` (**público**). Default: `main`. |
| **Branch de trabalho** | **`claude/ai-agent-tool-planning-xi33sh`** — TODO o trabalho vai aqui. |
| **Protótipo** | `prototypes/portal-spa/` (SPA vanilla + `localStorage`; 3D three.js local). |
| **Deploy ao vivo** | GitHub Pages: **https://edinhs.github.io/Stellantis-Dictionary/** (auto no push). |
| **Fase do ciclo** | Fase 0.5 → protótipo em refinamento visual com o CEO; eixo de requisitos (gates 1–6, 8) fechado. |
| **Gates carimbados** | 1, 2, 3, 4, 5, 6, 8 ✔ (doc `27`). |
| **Bloqueado por decisão do CEO** | Gate 7 (T05), 9, 10 (B1/B2), 15–19 (B5/D6). |
| **Dados do organograma** | CEO declarou **fictícios** (registro formal em `24`/`27` ainda pendente = B2). |

---

## 1. Como operar (governança da "empresa")

- O **Agente Geral orquestra e delega TUDO** aos setores via a ferramenta de
  subagentes (há um hook que reforça isso a cada mensagem): **doc-lead**,
  **product-lead** (→ `requirements-analyst`), **eng-lead** (→ `backend-engineer`,
  `frontend-engineer`, `threed-engineer`, `rag-engineer`), **qa-lead**,
  **security-lead**, **devops-lead** (→ `release-engineer`, `sre-engineer`),
  **design-lead**.
- **Agentes produzem; o Agente Geral integra e commita.** Agentes NÃO commitam.
- **Exceções pragmáticas** que o Agente Geral faz direto (quando é mecânico ou o
  agente do setor está indisponível por limite): commits/push, deploy, carimbos no
  log de gates (`27`), e **micro-ajustes de valor único** (ex.: constantes de zoom).
- **Ciclo de vida = 19 gates rígidos** (doc `14`); o **log/carimbos** ficam no doc `27`.
- **Diretriz-chave: "o protótipo manda"** — o protótipo do CEO é a fonte da verdade
  de escopo/UX; onde divergir dos docs antigos, os docs novos (`20`–`28`) refletem o
  protótipo.
- **Idioma:** PT. **Padrões de docs:** ver `doc-standards` (numeração sequencial —
  próximo livre após este é `30`; referências cruzadas por número; termina em
  "Perguntas em aberto").

### Rotina a cada mudança no protótipo
1. Delegar ao setor certo (frontend/threed/design…). **Escopo cirúrgico** (não tocar
   outras telas).
2. Ao receber a entrega: `node --check` nos `.js`; conferir `git status` (só os
   arquivos previstos; **nunca** commitar PNGs de teste dentro de `portal-spa/`);
   `git diff --stat`.
3. **Commitar** (trailers obrigatórios `Co-Authored-By: Claude ...` e
   `Claude-Session: ...`) e **push** na branch. O push em `prototypes/portal-spa/**`
   **re-publica o Pages automaticamente**.
4. Avisar o CEO para dar **refresh forte** (o navegador cacheia `car-interactivity.js`
   / `app.js`).

---

## 2. Deploy e verificação (essencial)

- **GitHub Pages** via `.github/workflows/pages-prototipo.yml` — gatilhos:
  `push` em `prototypes/portal-spa/**` e `workflow_dispatch`. Publica a pasta
  `prototypes/portal-spa/` (há um `.nojekyll`). O CEO já habilitou **Settings →
  Pages → Source: GitHub Actions** e liberou a branch no ambiente `github-pages`.
  URL: **https://edinhs.github.io/Stellantis-Dictionary/**. Para re-disparar manual:
  workflow_dispatch na branch.
- **Preview alternativo** sem Pages: `raw.githack.com` apontando para um **commit SHA**
  (ex.: `https://raw.githack.com/Edinhs/Stellantis-Dictionary/<SHA>/prototypes/portal-spa/index.html`).
- **Servir localmente:** por HTTP (`python3 -m http.server` dentro de `portal-spa/`),
  **NUNCA `file://`** (o `.glb` quebra por CORS).
- **Verificação de UI por agentes:** Chromium/Playwright em `/opt/pw-browsers`
  (não rodar `playwright install`). No sandbox os **CDNs (Lucide/Google Fonts) são
  bloqueados** → stubar `window.lucide` só no teste; em produção (Pages) carregam.

---

## 3. Documentação existente (por número)

`01` briefing (ampliado) · `02` spec núcleo · `03` PDR · `04` backlog · `05`–`13`
(domínio/arquitetura/roster/ciclo) · `14` ciclo de vida (19 gates) · `15` casos de uso
(CU-01..21) · `16`–`19` (homologação/deploy/manutenção/monitoramento) · **`20`**
referência do protótipo · **`21`** RF · **`22`** RNF · **`23`** design system · **`24`**
parecer de segurança (LGPD/OWASP; invariantes S1–S9) · **`25`** arquitetura (revisão de
escopo) · **`26`** pesquisa/benchmark · **`27`** log de conformidade dos gates ·
**`28`** regras de negócio · **`29`** este handoff.

---

## 4. Estado dos gates e decisões pendentes do CEO

Do doc `27`: **Gates 1–6 e 8 CONFORME/carimbados; 0 lacunas de execução.** O que falta
depende **só de decisões do CEO** (não é trabalho de setor):

| ID | Decisão do CEO | Destrava |
|---|---|---|
| **B3** | Aprovar o protótipo (**T05**) | Fecha o **Gate 7** |
| **B1** | Fronteira do **MVP** dos módulos | Abre **Etapas 9/10** |
| **B2** | **LGPD** — CEO **declarou dados fictícios**; falta **registrar** em `24`/`27` | Pré-condição da **Etapa 9** |
| **B5** | **Hospedagem `D6`** | Destrava **15–19** |

**Ação sugerida ao retomar:** (1) registrar B2 = "dados do organograma são fictícios
(confirmado pelo CEO em conversa)" no `24` (pergunta aberta) e `27` (§5); (2) obter T05
do CEO e carimbar Gate 7; (3) obter B1 (MVP) e abrir Etapa 9 com `backend-engineer` +
**gate de Segurança** (S6/S9 do `25`: sem seed de pessoas reais, generalizar
códigos/fornecedores).

---

## 5. Protótipo — o que já existe (para não refazer)

**Motor 3D** (`prototypes/portal-spa/car-interactivity.js`, portado do T04b
`prototypes/main-3d-explorer.html`): three.js **local** (`lib/`) + Jeep real
`assets/models/jeep.draco.glb` (fallback `jeep.glb`); OrbitControls, auto-rotação com
toggle, barra de zoom, hotspots vermelhos ligados ao dicionário (`stellantisGetTerm`/
`stellantisNavigateToTerm`). Ajustes já aprovados pelo CEO:
- Enquadramento **por eixo** (fitW/fitH vs FOV) — carro preenche o palco sem cortar na
  rotação 360°.
- Zoom: `ZOOM_IN_FACTOR = 0.72`, `ZOOM_OUT_FACTOR = 1.5` (faixa conservadora).
- Vista **Interior** usa a **cabine real** do `.glb`; **toggle "Bancos: com/sem"** (só
  no Interior; padrão sem bancos); **transição animada** Ext↔Int (`easeInOutCubic`, ~1s).
- **Placeholder do hero** = blueprint limpo `assets/hero-schematic.png` (marca d'água do
  Gemini e frase "ESQUEMA TÉCNICO" removidas). Card/palco do hero ampliado.
- **Regra de ouro:** mudanças no 3D são **cirúrgicas** — não tocar em outras telas; o
  motor se readapta ao container via `resize()`.

**Outros módulos (app.js / index.html):**
- **Especialistas:** "Contatar Especialista" abre **chat do Teams** (deep link
  `teams.microsoft.com/l/chat/0/0?users=<email>`); cadastro tem campos **E-mail** e
  **Link do Chat** (prioridade: link colado → email → derivado do nome).
- **Projetos:** **Plataforma** e **Motorização** ocultos "por enquanto" (dados do seed
  preservados; só a exibição/coleta foi removida).
- **Componentes** (ex-"Infotainment", **renomeado**): categorias e fornecedores
  **dinâmicos** ("+ Categoria" / "+ Fornecedor"); listas em
  `localStorage` `stellantis_component_categories` / `stellantis_component_suppliers`.
- **Fornecedores** (novo submenu em Informações): grid de cards com imagem, 8
  fornecedores semeados (públicos/genéricos), **CRUD**, e **modal de detalhes**
  (História + Parceria). Fonte de fornecedores **unificada** com a dos Componentes.
- **Cards de Componentes e Fornecedores** têm **imagem no topo** (estilo Projetos, com
  `onerror`→placeholder; sem hotlink de logotipos de marca).

**Pedido do CEO para depois:** "melhorar a experiência 3D e **trocar o modelo**".

---

## 6. Convenções técnicas rápidas

- Chaves de `localStorage`: prefixo `stellantis_*` (termos, notebooks, flashcards,
  user_*, hierarchy, ideas, kit_items, channels, specialists, infotainment, projects,
  automations, component_categories, component_suppliers).
- Antes de commitar JS: `node --check`. Nunca deixar PNG de teste dentro de
  `portal-spa/` (usar o scratchpad da sessão).
- Deep link Teams e URLs de terceiros: os textos livres devem ser **escapados** antes de
  `innerHTML` (parte do módulo Fornecedores já faz; o resto usa `innerHTML` sem escape —
  dívida a sanear na migração com backend, ver `24` MED-2 / RN de segurança em `28`).

---

## 7. Perguntas em aberto

1. **B1** — fronteira do MVP entre os módulos do protótipo. *Decisão do CEO.*
2. **B2** — LGPD: registrar formalmente que os dados são fictícios (recomendação da
   Segurança: seed fictício até a migração). *Registro pendente em `24`/`27`.*
3. **B3** — aprovar o protótipo (T05) para carimbar o Gate 7. *Decisão do CEO.*
4. **B5 / `D6`** — onde hospedar (além do Pages de preview) para destravar 15–19.
5. **"Melhorar 3D + trocar o modelo"** — pedido do CEO para uma fase futura.
6. Consolidar este handoff pelo **doc-lead** quando o limite de sessão resetar (foi
   escrito pelo Agente Geral por indisponibilidade do setor).
