# 23 — Design System do Protótipo (Stellantis Dictionary & Training Portal)

Status: **rascunho**.
> Última atualização: 2026-07-17.
> Deriva do protótipo funcional entregue pelo CEO em `prototypes/portal-spa/`
> (`index.html`, `style.css` com 6284 linhas, `app.js`, `car-interactivity.js`).
> Complementa o doc `20` (referência funcional do protótipo, produzido em paralelo);
> este documento registra o **design tal como existe no protótipo**, para servir de
> **guia de fidelidade visual** à Engenharia/Frontend. O CEO enfatizou **"seguir o
> design"** — este é o contrato visual a respeitar.

Coexistência de skills: a skill `ui-design-system` é o **design system de
implementação** (tokens/componentes que o Frontend codifica). Este doc `23` é a
**fonte de verdade descritiva** do protótipo aprovado — quando houver divergência, o
Frontend adapta a implementação a este registro, não o contrário, salvo decisão do
CEO. Escopo de UX/protótipo é da skill `ux-research-prototyping` (etapa 7 do ciclo,
ver doc `14`).

---

## 1. Tokens de design

### 1.1 Cores — variáveis `:root` (fonte: `style.css` §`:root`, linhas 6–25)

| Token | Valor | Uso no protótipo |
|---|---|---|
| `--bg-dark` | `#050a18` | Cor de fundo base do `body`; ponto final do gradiente radial |
| `--bg-deep` | `#02050c` | Fundos mais profundos (scrollbar track, canvas 3D, `flashcard-back`) |
| `--primary` | `#2563eb` | Azul de ação — `.btn-primary`, filtros ativos, CTAs |
| `--primary-glow` | `rgba(37,99,235,0.45)` | Sombra/brilho dos botões primários |
| `--secondary` | `#06b6d4` | Ciano de destaque — progress bars, roles, pins, ícones de acento |
| `--accent` | `#3b82f6` | Azul de foco/borda ativa (inputs, cards ativos, chevrons) |
| `--accent-red` | `#ef4444` | Alertas, hotspots, logout, contador de ideias, badge de deletar |
| `--accent-red-glow` | `rgba(239,68,68,0.6)` | Brilho do vermelho de acento |
| `--text-main` | `#f8fafc` | Texto principal (quase branco) |
| `--text-muted` | `#94a3b8` | Texto secundário/legendas |
| `--text-dark` | `#475569` | Texto terciário/desabilitado (labels, disclaimers) |
| `--glass-bg` | `rgba(15,23,42,0.45)` | Fundo translúcido dos cards (glassmorphism) |
| `--glass-border` | `rgba(255,255,255,0.08)` | Borda sutil dos elementos vidro |
| `--glass-highlight` | `rgba(255,255,255,0.03)` | Realce interno de vidro |
| `--shadow-premium` | `0 20px 40px -15px rgba(0,0,0,0.7)` | Sombra padrão de elevação de cards/modais |
| `--font-heading` | `'Outfit', sans-serif` | Títulos, números, headings de card |
| `--font-body` | `'Inter', sans-serif` | Corpo de texto (padrão em `*`) |
| `--font-serif` | `'Playfair Display', serif` | Itálico de destaque no hero (`.italic-highlight`) |

> Observação: o CSS referencia `var(--shadow-sm)` (`.timeline-card`) e
> `var(--font-main)` (`.stellantis-gpt-style-layout`) **que não estão definidos em
> `:root`** — são tokens ausentes (fallback do navegador). Ver §7.

### 1.2 Tipografia

- **Importação Google Fonts** (`index.html` linha 10): `Inter` (300–700),
  `Outfit` (300–800), `Playfair Display` (600/700, itálico).
- **Escala observada** (px): hero title `68` / big-word `88` (desktop) → `40` (≤768px);
  section-title `32`; card headings `15–20`; corpo `13–18`; legendas `9–13`.
- **Pesos**: Outfit vai a `800` (números, `hero-title`, watermarks); corpo em `400/500`;
  labels/badges em `700/800` com `text-transform: uppercase` e `letter-spacing`.
- `-webkit-font-smoothing: antialiased` global; `letter-spacing` negativo em títulos
  grandes (`-1.5px` no hero) para o visual "premium".

### 1.3 Paleta semântica codificada em JS (não é token CSS)

**Categorias do Dicionário** (`app.js` ~linha 339, aplicado inline ao badge de
categoria e ao modal de detalhes):

| Categoria (`data-category`) | Cor | Fundo/borda |
|---|---|---|
| `tecnologia` | `--accent` `#3b82f6` (azul) | `rgba(59,130,246,0.1)` / `.2` |
| `motorizacao` | `#a855f7` (roxo) | `rgba(168,85,247,0.1)` / `.2` |
| `componentes` | `#f59e0b` (âmbar) | `rgba(245,158,11,0.1)` / `.2` |
| `plataformas` | `#10b981` (verde) | `rgba(16,185,129,0.1)` / `.2` |

> Atenção: os botões de filtro do dicionário são `Todos / Tecnologia / Motorização /
> Componentes / Plataformas` (`index.html` 357–361), mas o código-fonte
> `requirements_specification-original.md` cita outra taxonomia (Tecnologia,
> Engenharia, Negócios, Gestão). Prevalece a do protótipo vivo. Ver §7.

**Níveis de curso** (`.course-badge`, `style.css` 1691–1704):

| Nível | Classe | Cor do texto | Fundo |
|---|---|---|---|
| Iniciante | `.iniciante` | `#34d399` (verde) | `rgba(16,185,129,0.1)` |
| Intermediário | `.intermediario` | `#fbbf24` (âmbar) | `rgba(245,158,11,0.1)` |
| Avançado | `.avancado` | `#fca5a5` (vermelho claro) | `rgba(239,68,68,0.1)` |

**Ranks de gamificação** (`.rank-badge.level-1..4`, 5443–5498): Bronze `#cd7f32`,
Prata `#c0c0c0`, Ouro `#facc15`, Diamante `--secondary` (com `rankElitePulse`).
**Setores de insígnia** (`.sector-*`, 5500–5562): audio azul, core laranja,
requirements verde, displays ciano, compliance âmbar, hardware vermelho, china roxo.
**Paletas utilitárias** de timeline (`.num-01..12`, `.tag-*`, `.bg-gradient-*`,
4072–4254): 12 gradientes/cores nomeadas por matiz para marcos e lançamentos.

---

## 2. Fundamentos visuais

- **Tema escuro** único (não há modo claro). Fundo `--bg-dark` + camada fixa
  `body::before` com `radial-gradient(circle at 60% 30%, #0f2454, --bg-dark 70%)`
  (`z-index:-2`), e `.bg-particles` (canvas Three.js, `z-index:-1`, `opacity:0.5`)
  para partículas.
- **Glassmorphism**: cards e overlays usam `--glass-bg` + `--glass-border` +
  `backdrop-filter: blur(...)` (10–24px). Header: `blur(16px)`; menu rolado
  `blur(24px)`; dropdowns/modais `blur(20px)`.
- **Glows ciano/azul no hover**: cards elevam (`translateY(-2..-5px)`) e ganham
  `box-shadow` colorido (`rgba(59,130,246,·)` azul ou `rgba(6,182,212,·)` ciano) +
  borda tingida. Padrão recorrente em `.term-card`, `.specialist-card`,
  `.project-card`, `.kit-card`, `.channel-card`, `.automation-card`.
- **Gradientes de marca**: `.gradient-text` e botões usam
  `linear-gradient(135deg, azul→ciano)`; título do hero mistura `#60a5fa → --secondary`.
- **Cantos** arredondados generosos: cards `16–24px`, pílulas `20–32px`, chips `4–8px`.
- **Scrollbars customizadas** (webkit + firefox): trilho `--bg-deep`, polegar
  `rgba(37,99,235,0.35)` → ciano no hover.

### 2.1 Animações (keyframes)

| Animação | Onde | Efeito |
|---|---|---|
| `pulseGlow` | badge-dot, hotspot, bulb-icon | pulso de escala+opacidade (2s) |
| `float` | car-image, idea-card, modal-card | flutuação vertical suave (6–10s) |
| `starPulse` | `.stellantis-star` (logo constelação) | estrelas pulsam com `nth-child` delays escalonados |
| `rotateDiamond` | (definido; losango do hero) | rotação 45°→405° |
| `pinPulseEffect` | `.pin-glow` (mapa) | onda expansiva dos pins |
| `tickerLoop` | carrossel de marcas | rolagem infinita 38s |
| `cpuPulseGlow` / `aiPulse` | ícones StellantisGPT/Notebook | pulso de IA |
| `rankElitePulse` | rank nível 4 | brilho ciano pulsante |
| **flip 3D** | `.flashcard` | `rotateY(180deg)` com `transform-style: preserve-3d` + `perspective:1000px`, `backface-visibility:hidden` |

Logo (`.stellantis-logo-svg`) no hover: constelação rotaciona 180° e escala 1.3;
estrelas acendem em `--accent` com `drop-shadow`.

---

## 3. Catálogo de componentes

### 3.1 Header e navegação
- `.main-header`: fixo, glass `blur(16px)`, `padding 24px 6%`, transição
  `cubic-bezier(0.4,0,0.2,1)`.
- **Estado `.scrolled`**: padding reduz; fundo/blur/borda somem; `.logo-container` e
  `.auth-container` colapsam (`max-width:0`, `opacity:0`, deslizam ±30px) restando só
  a `.main-nav` centralizada como **pílula flutuante** (fundo `rgba(8,14,32,0.85)`,
  `blur(24px)`, sombra azul).
- **`.header-hidden`**: hide-on-scroll (`translateY(-100%)`).
- `.nav-link`: pílula transparente, texto muted → main; `.active` com fundo azul
  translúcido, borda + `text-shadow` azul.
- `.btn-login`: pílula branca sólida sobre fundo escuro (alto contraste).
- **Dropdowns** (`.nav-item-dropdown`/`.dropdown-menu`): abrem no hover **ou** classe
  `.open`; chevron gira 180°; menu glass ancorado central com transição de opacidade+
  translateY. Dois menus: "Treinamento & Integração" e "Informações".

### 3.2 Botões
`.btn-primary` (gradiente azul + glow, ícone desliza no hover), `.btn-login` (branco),
`.btn-card-action` (+`.secondary`), `.btn-canvas-ui`, `.comp-3d-btn`,
`.btn-start-course`, `.btn-contact-specialist`, `.btn-modal-action` (`.primary`/
`.secondary`), `.btn-logout` (vermelho outline), `.btn-send-gpt` / `.btn-stellantis-
gpt-send` (círculo claro/ciano). Padrão de hover: elevar + intensificar sombra/cor.

### 3.3 Cards (glassmorphism)
`.term-card` (barra lateral azul no hover via `::before`), `.flashcard` (front vidro /
back gradiente escuro, flip 3D, watermark 96px opacidade 0.025), `.course-card`
(badges de nível + progress bar), `.specialist-card` (avatar gradiente
azul/ciano/verde + status dot), `.infotainment-card` (ícone colorido blue/green/cian),
`.project-card` (imagem + `project-code-badge` ciano + tabela de specs),
`.automation-card` / `.channel-card` / `.kit-card` (hover ciano `scale(1.01)` +
ícone gira 5°), `.suggestion-card` (chat, grid 2×2), `.timeline-card`
(barra ciano no hover), `.idea-card` (painel lateral, tags coloridas).

### 3.4 Busca e filtros
`.search-box-wrapper` (input glass com ícone à esquerda, foco borda `--accent` +
glow), `.filter-btn` / `.infotainment-filter-btn` (chips; `.active` = `--primary`
sólido), `.btn-filter-dropdown` (dropdown de checkbox no infotainment).

### 3.5 Chat (estilo ChatGPT)
Dois layouts coexistem: o base (`.chat-gpt-layout`) e o premium
(`.stellantis-gpt-style-layout` com Notebook). Estrutura: **sidebar** (250–260px:
nova conversa, nav, notebooks, histórico) + **área principal** (topbar com model-
selector/upgrade/avatar; corpo com `.chat-empty-state` centralizado e sugestões 2×2;
`.chat-messages-scroll` com mensagens `.message.user`/assistant e `.msg-avatar`) +
**input pílula** (`.chat-input-wrapper-gpt` / `-stellantis-gpt`, foco borda ciano/
azul, botões anexar/voz/enviar, disclaimer). Estados `.has-messages` /
`:not(.has-messages)` alternam input centralizado ↔ fixo no rodapé (transição de
layout idêntica ao ChatGPT). **Notebook**: split-screen editor + chat (`.notebook-
layout`).

### 3.6 Explorador 3D
`.explorador-3d-layout` (grid canvas 1.3fr + painel 0.7fr). `.canvas-3d-container`
(fundo `--bg-deep`, sombra interna), `.canvas-instructions` (dica de controles),
`.canvas-overlay-ui` + `.btn-canvas-ui`, painel `.card-details-3d` com lista
`.comp-3d-btn` (ativa em azul) e `.inspected-info`. Fonte: Three.js r128 +
OrbitControls + GLTFLoader (`index.html` 14–16). Ver docs `05`/`06`.

### 3.7 Organograma e mapa
`.tree-node` (`.clickable`/`.leader-node`/`.parent-node` tracejado; hover ciano),
`.tree-connector` (linha gradiente), `.node-avatar` (blue/gray), breadcrumbs
`.org-breadcrumbs-container`, modo gerenciar `.node-actions-bar` (editar/adicionar/
excluir). Mapa: `.map-world-container` (imagem + `.map-grid-overlay`), pins
`.map-pin-pulse` (`.pin-dot` + `.pin-glow` animado + `.pin-badge` + `.pin-tooltip`;
cores por país), `.map-detail-panel` com stats e time.

### 3.8 Hotspots e info-card (hero)
`.hotspot` (`.hotspot-pulse` vermelho + `.hotspot-core` branco), `.hotspot-info-card`
(`.active` fade/slide, ações + `.btn-close-card`). Visualizador do carro
(`.car-view-box`, `.car-image` com `float`), `.rotation-indicator`,
`.visualizer-toggle-btn` (ativa 3D real).

### 3.9 Modais
Padrão `.modal-overlay` (fixo, `blur(8px)`, `.open` = flex+opacity) + `.modal-card`
(glass, `animation: float`, `.modal-large` para versões de projeto). Fechamento no
backdrop (JS). Cabeçalho + corpo + footer de ações.

### 3.10 Progresso, XP e insígnias
`.progress-bar-container`/`-fill` (ciano), `.xp-bar-fill` (gradiente azul→ciano),
`.profile-xp-section`, `.badge-icon` (topo, `.active` acende), `.badge-detail-item`
(perfil, opacidade 0.55 → 1 quando ativa), `.rank-badge.level-1..4`.

### 3.11 Utilitários e outros
`.badge-interactive`/`.badge-dot`, `.beta-badge`, `.stellantis-brands-ticker`
(carrossel com máscara de gradiente), `.prototype-ideas-panel` (drawer lateral
direito, `.open` = `right:0`, `.panel-toggle` flutuante com contador vermelho),
`.timeline-container` (marcos), `.profile-view-container` (Meu Perfil: editar,
insígnias, stats, timeline de atividades tipada term/idea/flashcard).

---

## 4. Responsividade

Breakpoints (mobile-last, `max-width`): **1200px** (grid de timeline 3→2 colunas),
**1024px** (tablet), **768px** (celular). Há dois blocos de media queries: um inicial
(3865–3911) e um "premium completo" no fim do arquivo (5876–6284) que sobrescreve com
`!important`.

### 4.1 Tablet (≤1024px)
- **Header vira coluna centralizada** (`flex-direction:column`), fundo opaco
  `rgba(5,10,24,0.96)` + `blur(20px)`; logo e nav voltam a aparecer mesmo em
  `.scrolled` (o colapso em pílula é desativado no toque).
- `.main-nav > ul` com `flex-wrap` e quebra centralizada; `.auth-container`
  reposicionado absoluto no canto superior direito.
- **Recuo dinâmico** do `.content-wrapper`: `margin-top` sobe para `165px` (compensa o
  header mais alto).
- Grids (kit, canais, especialistas, projetos, automações, infotainment) → 2 colunas.
- Hero → 1 coluna; explorador 3D → empilhado, canvas `350–400px`; perfil → 1 coluna;
  chat/notebook/explorer empilham.

### 4.2 Celular (≤768px)
- Header `padding` mínimo; `.nav-link` reduz para `11px`/`6px`; logo menor;
  `.content-wrapper` `margin-top:155px`.
- Todos os grids → **1 coluna**; `.profile-stats-grid`/insígnias → 2 colunas.
- **Dropdowns inline no toque**: `.filter-dropdown-menu` vira `position:relative`,
  largura total, sem sombra (empurra o conteúdo em vez de flutuar).
- `.chat-sidebar` vira **drawer off-canvas** (`translateX(-100%)` → `.open`).
- Modais `95%` largura, footer em coluna, botões `100%`.
- Dropdown de perfil (`#profileDropdownCard`) recentralizado (`translateX(-50%)`),
  `92%` largura; nome do usuário oculto.

---

## 5. Acessibilidade (observações e lacunas)

O visual não deve mudar; as recomendações abaixo são aditivas.

1. **Contraste (tema escuro)**: `--text-main` sobre `--bg-dark` é excelente. Porém
   `--text-dark` `#475569` em legendas/disclaimers **provavelmente reprova AA** (<4.5:1)
   para texto pequeno. `--text-muted` em fontes ≤11px é limítrofe. *Recomendação*:
   reservar `--text-dark` para texto ≥14px/decorativo; validar cada par com verificador.
2. **Foco visível**: inputs têm `:focus`/`:focus-within` com glow, mas **botões,
   `.nav-link`, cards clicáveis e ícones não têm `:focus-visible`**; vários usam
   `outline:none`. *Recomendação*: adicionar anel de foco (`outline`/`box-shadow`)
   consistente em todos os interativos, sem alterar o estado de repouso.
3. **Dependência de cor**: categorias, níveis de curso, status de especialista, ranks
   e pins comunicam significado **só por cor**. *Recomendação*: manter cor e adicionar
   rótulo/ícone/textura redundante (já há texto nos badges de nível — replicar no status
   dot e nos pins de mapa).
4. **Ícones Lucide sem texto alternativo**: botões só-ícone (`.btn-close-card`,
   `.btn-input-*`, `.btn-node-*`, chevrons, send) não expõem nome acessível. Alguns têm
   `title=` (ex.: badges), mas não é confiável para leitores de tela. *Recomendação*:
   `aria-label` em todo botão só-ícone e `aria-hidden="true"` no `<i>` decorativo.
5. **Motion**: muitas animações infinitas (`float`, `pulseGlow`, `starPulse`, ticker,
   pins, ranks). *Recomendação*: envolver em `@media (prefers-reduced-motion: reduce)`
   para pausar/reduzir, preservando o layout.
6. **Semântica/estrutura**: navegação por abas usa `<button data-target>` com
   `.active` — falta `role="tab"`/`aria-selected` e gestão de `aria-current`. Modais
   sem `role="dialog"`/`aria-modal`/foco preso. Drawers sem `aria-expanded` no toggle.
   *Recomendação*: adicionar padrões ARIA de tabs/dialog/disclosure e navegação por
   teclado (Esc fecha modal/drawer, setas nas tabs).
7. **Tokens ausentes** (`--shadow-sm`, `--font-main`) não afetam a11y mas devem ser
   definidos para consistência (ver §7).

---

## 6. Inventário de telas (seção → identidade visual)

Navegação principal (`index.html` 114–144) → seções `#sec-*` (`.app-section`,
transição fade/slide de 0.4s; só uma `.active`).

| Aba (`data-target`) | Seção | Identidade visual dominante |
|---|---|---|
| `home` (Início) | `#sec-home` | Hero grid 2 col: título 68/88px + gradiente azul→ciano, itálico serif; visualizador de carro com `float` + hotspots vermelhos; stats; ticker de marcas |
| `dicionario` | `#sec-dicionario` | Busca glass + filtros por categoria (paleta semântica §1.3); `terms-grid` de `.term-card` com barra azul no hover; modais de termo |
| `explorador` (BETA) | `#sec-explorador` | Split canvas 3D escuro + painel de componentes ciano; instruções de controle |
| `chat-ia` | `#sec-chat-ia` | Layout ChatGPT (sidebar + área + input pílula) e StellantisGPT/Notebook; empty-state com sugestões 2×2 |
| `treinamento` | `#sec-treinamento` | Sub-nav (Kit Colaborador, Flashcards, Conteúdo Técnico, Canais); flashcards flip 3D; course-cards com níveis e progresso |
| `informacoes` | `#sec-informacoes` | Sub-nav ampla (Especialistas, Projetos, Infotainment, Estrutura & Equipe, Diretrizes, Marcos, Lançamento de Veículos); grids de card + organograma + mapa global |
| `automacoes` | `#sec-automacoes` | Grids de `.automation-card`/`.channel-card` com hover ciano |
| `sobre` | `#sec-sobre` | `.about-card` glass centralizado, lead-text azul, tech-tags |
| — (via perfil) | `#sec-perfil` | Meu Perfil: editar dados, insígnias detalhadas, stats de impacto, timeline de atividades tipada |

Elementos globais persistentes: header/nav, dropdown de perfil (XP + insígnias +
logout), painel lateral de ideias do protótipo, modais.

---

## 7. Perguntas em aberto

1. **Tokens ausentes** — `--shadow-sm` (`.timeline-card`) e `--font-main`
   (`.stellantis-gpt-style-layout`) são referenciados mas não definidos em `:root`.
   Devem ser adicionados na implementação? Com quais valores? — ainda em aberto.
2. **Taxonomia de categorias do Dicionário** — o protótipo vivo usa
   `Tecnologia / Motorização / Componentes / Plataformas`, mas
   `requirements_specification-original.md` cita `Tecnologia / Engenharia / Negócios /
   Gestão`. Qual é a canônica para a Fase 1? — ainda em aberto (prevalece a do
   protótipo até decisão do CEO).
3. **Escopo de fidelidade** — a implementação deve reproduzir 100% do protótipo
   (incluindo painel de ideias, ticker de marcas, Notebook) ou há telas que são apenas
   demonstrativas e ficam fora do MVP? — ainda em aberto (definir com Produto, doc `20`).
4. **Correções de a11y** — as recomendações da §5 (foco, `aria-*`, reduced-motion)
   podem ser aplicadas sem passar pelo gate visual do CEO, por serem aditivas e
   invisíveis? — ainda em aberto.
5. **Dois layouts de Chat** — o protótipo mantém `.chat-gpt-layout` **e**
   `.stellantis-gpt-style-layout`. Qual é o oficial para implementar? — ainda em aberto.
6. **Consolidação de media queries** — há blocos duplicados/`!important` sobrepostos
   (768px em dois lugares). Consolidar na implementação sem alterar o comportamento
   final está autorizado? — ainda em aberto.
