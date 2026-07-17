# Requisitos Não-Funcionais — Stellantis-Dictionary (derivados do protótipo)

> Status: **rascunho para revisão do Produto Lead / CEO**.
> Última atualização: 2026-07-17.
> Autoria: Analista de Requisitos (`requirements-analyst`), reporta ao Produto Lead.
> Cobre a **etapa 3 (Requisitos)** do ciclo de vida `14-ciclo-de-vida-engenharia.md`.
>
> **Fonte:** protótipo em `prototypes/portal-spa/` e seus docs originais
> (`PROTOTIPO-ORIGINAL-README.md`, `requirements_specification-original.md` —
> spec-original RNF01–RNF05). Requisitos funcionais no doc `21`. Referência de
> tela/módulo no doc `20`. Arquitetura-alvo no doc `13`. Decisões no PDR `03`.

## 0. Como ler

- Cada RNF tem **ID `RNF-NNN`**, atributo de qualidade, descrição, **critério de
  aceite verificável** e rastreabilidade.
- **[PROTÓTIPO]** = comportamento hoje observável; **[ALVO]** = requisito da versão
  de produção (doc `13`), ainda não atendido pelo protótipo.

---

## 1. Desempenho e eficiência

### RNF-001 — Renderização e navegação client-side instantânea [PROTÓTIPO]
- **Descrição:** SPA que troca de seção sem recarregar (`switchSection`) e renderiza
  grids de forma reativa a partir do `localStorage`.
- **Critério de aceite:** A troca entre abas e a filtragem/busca (doc `21`, RF-001)
  respondem sem recarga de página e sem congelar a UI perceptivelmente em um dataset
  de porte do protótipo.

### RNF-002 — Autosave com debounce de 1200 ms [PROTÓTIPO]
- **Descrição:** O Notebook (doc `21`, RF-031) só persiste após pausa na digitação,
  evitando escrita a cada tecla.
- **Critério de aceite:** A gravação em `localStorage` ocorre ~**1200 ms** após a
  última tecla (`app.js` ~L769–794); digitação contínua não dispara múltiplas
  gravações.

### RNF-003 — Carga do modelo 3D `.glb` sem bloquear a SPA [PROTÓTIPO/ALVO]
- **Descrição:** O `.glb` do veículo (`Carro 3D/...k8.glb`, ~19 MB no protótipo) é
  carregado de forma assíncrona.
- **Critério de aceite (protótipo):** A navegação nas outras abas permanece usável
  enquanto o modelo carrega; falha de carga cai no fallback (doc `21`, RF-015).
- **Critério de aceite (alvo):** No produto, o asset é otimizado (compressão Draco,
  meta de tamanho a definir) — PDR `03` D9; backlog `04` T11a. *Peso/tempo-alvo em
  aberto (§9).*

---

## 2. Usabilidade e experiência (UX)

### RNF-010 — Estética premium ("WOW effect") [PROTÓTIPO]
- **Descrição:** Visual de última geração: glassmorphism, gradientes cósmicos, glow
  ciano/azul no hover, fontes Google (Outfit, Inter), desfoque nos modais.
- **Critério de aceite:** As telas exibem os efeitos acima de forma consistente; o
  hover de elementos interativos produz o glow especificado. (spec-original RNF01.)

### RNF-011 — Header "hide on scroll" [PROTÓTIPO]
- **Critério de aceite:** Rolar para baixo oculta o `.main-header` deslizando para
  cima; rolar para cima ou chegar ao topo o reexibe suavemente. (spec-original RNF03.)

### RNF-012 — Responsividade fluida (mobile/tablet) [PROTÓTIPO]
- **Descrição:** Layout reorganiza-se em coluna em telas menores (logo no topo, abas
  com quebra natural, perfil no canto superior direito); recuo do conteúdo se adapta.
- **Critério de aceite:** Em larguras de tablet/celular o cabeçalho reorganiza sem
  sobreposição de conteúdo; dropdowns de menu/perfil aparecem inline abaixo do
  gatilho. (spec-original RNF02/RNF04.)

### RNF-013 — Micro-interações e feedback visual [PROTÓTIPO]
- **Critério de aceite:** Ações relevantes (level-up, hover da logo com partículas,
  flip do flashcard, pulso de hotspot) têm feedback animado perceptível.

---

## 3. Acessibilidade (a11y)

### RNF-014 — Acessibilidade mínima [ALVO]
- **Descrição:** O protótipo prioriza estética; acessibilidade **não** é garantida
  hoje (uso intenso de estilo inline, contraste sobre gradientes, ícones sem rótulo,
  interações dependentes de mouse/hover como órbita 3D e flip).
- **Critério de aceite (alvo):** Navegação por teclado nas ações principais, foco
  visível, textos alternativos em ícones/imagens informativos, contraste conforme
  WCAG 2.1 AA nos textos, e alternativa não-hover para conteúdo essencial dos
  hotspots (reuso do fallback, doc `21` RF-015).
- **Rastreabilidade:** doc `13`; skill `ui-design-system`. *Nível-alvo (AA/AAA) e
  escopo em aberto (§9).*

---

## 4. Internacionalização (i18n)

### RNF-015 — Idioma pt-BR hardcoded [PROTÓTIPO] / i18n [ALVO]
- **Descrição:** Todos os textos do protótipo estão em **pt-BR fixos no
  HTML/JS/CSS**, sem camada de tradução.
- **Critério de aceite (protótipo):** Interface 100% em pt-BR, coerente.
- **Critério de aceite (alvo):** Se multi-idioma entrar em escopo, os textos passam a
  chaves externalizáveis (i18n) sem reescrever a lógica. *Necessidade de i18n em
  aberto (§9) — o CEO ainda não pediu multi-idioma.*

---

## 5. Compatibilidade e portabilidade

### RNF-020 — Navegadores modernos [PROTÓTIPO]
- **Critério de aceite:** Funciona em navegadores modernos (Chrome/Edge/Firefox
  atuais) que suportam ES6+, `backdrop-filter` e WebGL.

### RNF-021 — WebGL com fallback [PROTÓTIPO]
- **Descrição:** O Explorador 3D exige WebGL; na ausência de WebGL/`GLTFLoader` ou
  falha do `.glb`, há fallback procedural (doc `21`, RF-015).
- **Critério de aceite:** Sem WebGL a seção 3D não quebra a aplicação — degrada para o
  carro procedural mantendo interações básicas. *No alvo, prever também fallback em
  imagem clicável/image-map — backlog `04` T11d.*

### RNF-022 — Portabilidade: `file://` ou servidor estático [PROTÓTIPO]
- **Descrição:** O protótipo abre por duplo-clique no `index.html` (`file://`) ou via
  servidor estático (`npx serve`, Live Server, GitHub Pages).
- **Critério de aceite:** As funcionalidades locais operam em ambos os modos; o
  carregamento do `.glb` pode exigir servidor estático por CORS (cai no fallback em
  `file://` se bloqueado).

### RNF-023 — Assets locais, sem placeholders lentos [PROTÓTIPO]
- **Critério de aceite:** Avatares e logos carregam da estrutura local
  (`assets/avatars/`, `assets/logos/`), sem esperar rede. (spec-original RNF05.)

---

## 6. Segurança e privacidade

### RNF-030 — Sem autenticação na fase de protótipo [PROTÓTIPO]
- **Descrição:** Não há login, sessão nem controle de acesso; qualquer visitante usa
  e edita tudo localmente.
- **Critério de aceite:** Compreendido e documentado como **limitação intencional do
  protótipo**; nenhum dado confidencial real deve ser inserido nele. (PDR `03`,
  perguntas §6.3.)

### RNF-031 — LGPD / dados de pessoas [ALVO]
- **Descrição:** Módulos de Especialistas e Organograma (doc `21`, RF-041/RF-044)
  exibem nomes, cargos e hierarquia de pessoas reais.
- **Critério de aceite (alvo):** No produto, dados pessoais só a usuários
  autenticados, com base legal/minimização (LGPD), sem exposição pública; escrita
  protegida por RBAC. **No protótipo esses dados ficam expostos no cliente** — não
  usar pessoas reais até a migração. Rastreabilidade: SPEC `09`; backlog `04` T19;
  skill `security-checklist`.

### RNF-032 — Migração `localStorage` → backend seguro [ALVO]
- **Descrição:** Toda persistência local (doc `21`, RF-066/RF-070) deve migrar para
  API + Postgres com autenticação (JWT), TLS em trânsito e segredos via `.env`.
- **Critério de aceite (alvo):** Dados deixam de residir no navegador; acesso
  mediado por API autenticada/autorizada; sem segredos no cliente. Rastreabilidade:
  doc `13`; PDR `03` D1/D3; backlog `04` T06–T09/T18.

### RNF-033 — Sem segredos no cliente [PROTÓTIPO/ALVO]
- **Critério de aceite:** O bundle client-side não contém chaves/segredos (o chat é
  simulado, sem chave de LLM). Manter esta propriedade quando o RAG real
  (doc `21`, RF-068) for integrado — a chamada ao LLM ocorre no backend.

---

## 7. Manutenibilidade

### RNF-040 — Redução do monólito `app.js` [ALVO]
- **Descrição:** O protótipo concentra a lógica em um único `app.js` (~5.4k linhas),
  o que dificulta manutenção.
- **Critério de aceite (alvo):** No produto, código modularizado por
  domínio/componentes, conforme arquitetura do doc `13`. Considerado dívida técnica
  aceita no protótipo (grandfathering — backlog `04`).

### RNF-041 — Estilo: reduzir inline, consolidar tokens CSS [ALVO]
- **Descrição:** Há muito estilo inline no HTML, embora o `style.css` já use
  variáveis (tokens) de design.
- **Critério de aceite (alvo):** Estilos migram para o CSS/tokens; a paleta e os
  componentes seguem a skill `ui-design-system`.

### RNF-042 — Persistência com chaves versionáveis [PROTÓTIPO]
- **Critério de aceite:** As chaves de `localStorage` são nomeadas com prefixo
  `stellantis_*` (ex.: `stellantis_terms`, `stellantis_user_xp`), facilitando
  migração/limpeza controlada.

---

## 8. Rastreabilidade RNF ↔ spec-original / alvo

| RNF | spec-original | Alvo (doc) |
|---|---|---|
| RNF-002 | RF05 (debounce) | — |
| RNF-010 | RNF01 | `ui-design-system` |
| RNF-011 | RNF03 | — |
| RNF-012 | RNF02/RNF04 | — |
| RNF-021 | RF03 | `04` T11d, `3d-cockpit` |
| RNF-023 | RNF05 | — |
| RNF-031/032/033 | — | `09`, `13`, `security-checklist` |
| RNF-040/041 | — | `13`, `ui-design-system` |

---

## 9. Perguntas em aberto

1. **Acessibilidade (RNF-014)** — qual nível WCAG é meta para o produto (A / AA /
   AAA) e a partir de que fase? *— ainda em aberto.*
2. **Internacionalização (RNF-015)** — multi-idioma entra em escopo ou pt-BR
   permanece fixo? *— ainda em aberto (CEO não solicitou).*
3. **Meta de desempenho do 3D (RNF-003)** — tamanho/tempo-alvo do `.glb` (Draco) e
   nível de hardware mínimo suportado? *— ainda em aberto (relacionado ao PDR `03`
   D9 e ao risco de 3D pesar no MVP).*
4. **Exposição de dados pessoais (RNF-031)** — o protótipo pode ir a GitHub Pages com
   nomes reais no Organograma/Especialistas? Recomendação de produto: **não** usar
   pessoas reais até a migração segura. *— decisão do CEO em aberto (nota ao PDR
   `03`).*
5. **Suporte a `file://` no produto (RNF-022)** — o produto final é servido só por
   servidor (com auth) ou também precisa abrir offline por arquivo? *— ainda em
   aberto.*
6. **Prioridade da refatoração (RNF-040/041)** — o frontend real reaproveita o
   `app.js`/CSS do protótipo ou é reescrito modular desde o início (backlog `04`
   Fase 1d)? *— ainda em aberto.*
