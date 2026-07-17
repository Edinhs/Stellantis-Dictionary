# Protótipo de Referência — Inventário Fiel da SPA

Status: **rascunho**.
> Última atualização: 2026-07-17.
> Autoria: Documentação Lead.
> Este documento **consolida o protótipo funcional enviado pelo CEO** (SPA
> "Stellantis Dictionary & Training Portal"), integrado ao repositório em
> `prototypes/portal-spa/`. É a **fonte de referência** para os documentos de
> requisitos (`21`/`22`), de design (`23`) e de casos de uso (`15`) — esses docs
> devem apontar para as seções deste inventário em vez de reinterpretar o código.
> Deriva da leitura direta de `app.js`, `index.html`, `style.css`,
> `car-interactivity.js`, `PROTOTIPO-ORIGINAL-README.md` e
> `requirements_specification-original.md`.
> Referência de arquitetura-alvo: SPEC `02-spec.md`, doc `13-arquitetura-modular.md`.

> **Princípio de leitura (decisão do CEO):** o protótipo é a **fonte de escopo
> funcional e de UX**; a **arquitetura-alvo permanece a dos docs `13`** (monólito
> modular Node/TS + Postgres/pgvector + RAG + RBAC). Onde protótipo e visão-alvo
> divergem, vale a §6.

---

## 1. O que é o protótipo

Uma **Single Page Application (SPA) 100% cliente**, aberta por duplo-clique em
`index.html`, sem build e sem backend. Todo o estado do usuário (termos criados,
notebooks, XP, ideias etc.) vive no `localStorage` do navegador. Serve como
demonstração navegável do produto — não como implementação de referência da
arquitetura.

Estrutura de arquivos (em `prototypes/portal-spa/`):

| Arquivo | Papel |
|---|---|
| `index.html` (2527 linhas) | Marcação semântica, todas as `section` da SPA e todos os modais |
| `style.css` (6284 linhas) | Design system, glassmorphism, tema escuro, responsividade |
| `app.js` (5432 linhas) | Núcleo da SPA: navegação, CRUDs, chat simulado, notebook, gamificação |
| `car-interactivity.js` | Hotspots 2D da Home e renderizador 3D (three.js) do Explorador |
| `assets/logos/` | Logotipos das 14 marcas Stellantis (terceiros — ver §7) |
| `assets/avatars/` | Avatares claymorphic locais (1 a 8; ver §8) |
| `Carro 3D/2021_jeep_grand_commander_k8.glb` | Modelo 3D carregado pelo `GLTFLoader` |
| `PROTOTIPO-ORIGINAL-README.md` | README original do CEO |
| `requirements_specification-original.md` | Especificação original que acompanhou o protótipo |

---

## 2. Stack e arquitetura do protótipo

- **Vanilla JS puro, sem framework.** Toda a lógica de `app.js` roda dentro de um
  único `document.addEventListener('DOMContentLoaded', …)`; não há módulos ES, não
  há bundler. `car-interactivity.js` tem seu próprio `DOMContentLoaded`.
- **Bibliotecas via CDN** (declaradas em `index.html`):
  - **Lucide Icons** (`unpkg.com/lucide@latest`), inicializado com
    `lucide.createIcons()` e reinvocado a cada renderização de ícone.
  - **three.js r128** (`cdnjs .../three.js/r128/three.min.js`) +
    **OrbitControls** e **GLTFLoader** (`cdn.jsdelivr.net/npm/three@0.128.0/...`).
- **Estado**: variáveis de *closure* dentro do `DOMContentLoaded` (ex.: `terms`,
  `activeNotebookId`, `userXp`) + **`localStorage`** com o prefixo `stellantis_`
  para persistência entre sessões. Não há sessão de servidor nem sincronização.
- **Roteamento SPA por troca de classe**: a função `switchSection(targetId)`
  (`app.js`) remove `.active` de todas as `.app-section` e a aplica em
  `#sec-<targetId>`, além de marcar o `.nav-link` correspondente. **Não é um hash
  router** — não usa `location.hash` nem History API; recarregar a página sempre
  volta para a Home.
- **Views por *template string* + `innerHTML`**: as grades (termos, especialistas,
  componentes, projetos, automações, canais, kit, flashcards) são reconstruídas por
  funções `renderX()` que montam HTML em string e o injetam em um contêiner.
- **Modais** abrem/fecham alternando a classe `.open`; fecham ao clicar no
  *backdrop* (`e.target === modal`).
- **Sem etapa de rede real**: o "Chat IA" e o "Assistente de Notas" são
  simulações por `setTimeout` + correspondência de palavras-chave (ver §3).

---

## 3. Inventário de módulos e telas

Navegação principal (`index.html`, `.nav-link[data-target]`): `home`,
`dicionario`, `explorador` (BETA), `chat-ia`, `treinamento` (dropdown),
`informacoes` (dropdown), `automacoes`, `sobre`; além do `perfil` (via card de
perfil). O `data-sub` nos dropdowns apenas rola até a subseção dentro da mesma
`section`.

| Módulo / tela | `id` da seção | Função(ões) principal(is) em `app.js` | O que faz (fiel ao código) |
|---|---|---|---|
| **Home / Hero 3D** | `#sec-home` | hotspots em `car-interactivity.js` | Hero com hotspots 2D clicáveis sobre imagem do Jeep; cada hotspot abre um card contextual com botões "Ver no Dicionário" (pré-filtra a busca) e "Registrar Ideia". CTA `#btn-explore-dict` leva ao Dicionário. |
| **Dicionário** | `#sec-dicionario` | `renderTerms()`, `openTermDetailsModal()`, modal `modalAddTerm` | Busca em tempo real (título+definição), filtro por categoria (`.filter-btn`), CRUD de termo (criar via `modalAddTerm`; persiste em `stellantis_terms`), modal de detalhe com atalhos "Perguntar ao StellantisGPT" (vai ao chat com prompt pronto) e "Criar Flashcard" (leva ao Treinamento com campos preenchidos). |
| **Chat "StellantisGPT"** | `#sec-chat-ia` | `processGptInput()`, `appendGptMessage()` | Chat **simulado**: `processGptInput()` responde por `if/else` de palavras-chave (`adas`, `bio-hybrid`, `t270`, `plataforma`, `especialista`…) com texto fixo após `setTimeout(850ms)`. Sidebar recolhível de histórico (itens mock), cartões de sugestão, input em pílula que migra do centro para a base. **Não há LLM nem citação de fontes.** |
| **Notebook de Engenharia** | `#sec-chat-ia` (layout dividido) | `getNotebooks()`, `saveNotebooks()`, `triggerAutoSave()`, `processNotebookChat()` | Workspace *split-screen*: editor à esquerda + chat assistivo à direita. **Auto-save com debounce de 1200 ms** (`triggerAutoSave`) em `stellantis_notebooks`. Ações "Resumir", "Melhorar escrita" e "Extrair Siglas" processam o texto da nota e devolvem resposta simulada por palavra-chave no chat. |
| **Treinamento** | `#sec-treinamento` | `renderCustomFlashcards()`, `renderKitItems()`, `renderChannels()`, lógica de cursos/XP | Subseções (`data-sub`): **Kit Colaborador** (cards com até 2 links rápidos; `stellantis_kit_items`), **Flashcards 3D** (giro CSS 180°, criação integrada à busca do dicionário; `stellantis_custom_flashcards`), **Conteúdo Técnico** (cursos Bio-Hybrid/ADAS/MultiAir com conclusão → XP e badges), **Canais Oficiais** (CRUD de links; `stellantis_channels`). |
| **Informações** | `#sec-informacoes` | `renderSpecialists()`, `renderInfotainment()`+`updateDropdownFilters()`, árvore `renderTree()`/`renderBreadcrumbs()`, `renderProjects()`, `showLocationDetails()` | Subseções: **Especialistas** ("quem procurar"; botão contata via chat), **Infotainment** (grid de componentes com **filtro cruzado por Categoria e Fornecedor Tier-1** — Aptiv/Bosch/Harman/Marelli — via checkboxes), **Estrutura & Equipe** (organograma em **árvore drill-down** com breadcrumbs e CRUD de nós + **mapa global por país** com `showLocationDetails()`), **Diretrizes Globais** (FaSTLAne 2030, Net Zero 2038, valores), **Marcos & Timeline**, **Lançamento de Veículos**. |
| **Projetos veiculares** | `#sec-informacoes` (sub `projetos`) | `renderProjects()`, `openProjectDetailsModal()`, `openAddProjectModal()` | Grid de projetos com código interno, status (Conceito/Homologação/Produção), ficha técnica e versões; CRUD em `stellantis_projects`. |
| **Automações & IA** | `#sec-automacoes` | `renderAutomations()`, `openAutomationModal()`, `openAddAutomationModal()` | Vitrine de ferramentas/robôs de automação com modal informativo e atalho "perguntar ao chat"; CRUD em `stellantis_automations`. |
| **Sobre** | `#sec-sobre` | — | Página institucional "Sobre o Protótipo". |
| **Perfil** | `#sec-perfil` | `updateProfileUI()`, `loadProfileTimelineAndStats()`, modal de avatar | Edição de nome/cargo/setor/avatar; **gamificação** (barra de XP, nível, insígnias de setor e técnicas); **timeline** de contribuições persistida em `stellantis_ideas`. |
| **Explorador 3D** | `#sec-explorador` | renderizador em `car-interactivity.js` | Cena three.js com `OrbitControls`; carrega `2021_jeep_grand_commander_k8.glb` via `GLTFLoader`; alterna **wireframe/sólido** (`btn-3d-wireframe`), hotspots que saltam para o verbete, inspeção de componentes e **fallback procedural** (chassi/rodas/grade + partículas) se o `.glb` falhar por CORS ou o loader não existir. |

**Gamificação (regras observadas em `app.js`):** ações de cocriação concedem
**+50 XP**; conclusão de curso técnico concede **+350 XP** e ativa a insígnia
correspondente (`Bio-H`, `ADAS`, `MultiAir`). O *level up* usa um limiar
`maxXp` (1500 quando `userLevel === 3`, senão 2500); ao atingi-lo, promove o
cargo (ex.: "Engenheiro de Produto Sênior — Nível 4") com alerta/confete e
transfere o XP excedente.

---

## 4. Modelo de dados implícito (`localStorage`, prefixo `stellantis_`)

Não há esquema formal: cada chave guarda um JSON serializado. Entidades e campos
observados no código:

| Chave | Estrutura | Campos principais |
|---|---|---|
| `stellantis_terms` | Array de termos | `id`, `title`, `def`, `category` ∈ {`motorizacao`, `tecnologia`, `componentes`, `plataformas`}, `author` |
| `stellantis_notebooks` | Objeto `{id: nota}` | por nota: `title`, `content` |
| `stellantis_custom_flashcards` | Array | frente/verso do cartão (texto) |
| `stellantis_user_name` | String | nome exibido |
| `stellantis_user_role` | String | cargo do usuário |
| `stellantis_user_avatar_url` | String | caminho/URL do avatar |
| `stellantis_user_sector` | String | setor (define insígnia de setor) |
| `stellantis_user_xp` | Número | XP acumulado |
| `stellantis_user_level` | Número | nível atual |
| `stellantis_user_badges` | Objeto de flags | `biohybrid`, `adas`, `motores` (bool) |
| `stellantis_hierarchy` | Árvore recursiva | nó: nome/cargo + `children[]` (organograma) |
| `stellantis_ideas` | Array | log de contribuições/ideias → alimenta a timeline do perfil |
| `stellantis_kit_items` | Array | itens do Kit Colaborador (título, instrução, até 2 links) |
| `stellantis_channels` | Array | canais oficiais (título, descrição, URL) |
| `stellantis_specialists` | Array | especialistas (nome, especialidade, bio, contato) |
| `stellantis_infotainment` | Array | componentes (nome, descrição, categoria, fornecedor Tier-1, imagem) |
| `stellantis_projects` | Array | projetos (código interno, status, ficha, versões) |
| `stellantis_automations` | Array | automações/ferramentas de IA (nome, descrição, links) |

> Observação: os dados iniciais (`defaultTerms` e demais *seeds*) ficam
> *hardcoded* em `app.js` e só são gravados no `localStorage` na primeira carga.

---

## 5. Design system (resumo — detalhe aprofundado no doc `23`)

O `style.css` define tokens em `:root`. Resumo para ancorar o doc de design
(`23`, do Design Lead); o detalhamento completo (componentes, estados, grid,
media queries) é responsabilidade daquele documento.

- **Cores/tokens**: `--bg-dark: #050a18`, `--bg-deep: #02050c`,
  `--primary: #2563eb`, `--secondary: #06b6d4`, `--accent: #3b82f6`,
  `--accent-red: #ef4444`, `--text-main: #f8fafc`, `--text-muted: #94a3b8`,
  `--glass-bg: rgba(15,23,42,0.45)`, `--glass-border: rgba(255,255,255,0.08)`,
  `--shadow-premium: 0 20px 40px -15px rgba(0,0,0,0.7)`.
- **Fontes**: `--font-heading` Outfit, `--font-body` Inter, `--font-serif`
  Playfair Display.
- **Estilo visual**: glassmorphism (fundo translúcido + `backdrop-filter: blur`),
  tema escuro, gradientes ciano/azul, *glow* em hover.
- **Paleta por categoria de termo** (no `openTermDetailsModal`): motorização roxo
  `#a855f7`, tecnologia azul `--accent`, componentes âmbar `#f59e0b`, plataformas
  verde `#10b981`.
- **Padrões de interação**: modal por classe `.open`; **header hide-on-scroll**
  (`.main-header` ganha `.scrolled` após 45px e `.header-hidden` ao rolar para
  baixo depois de 120px); menu que se contrai em pílula.

---

## 6. Divergências protótipo × visão-alvo documentada

O protótipo demonstra o **escopo funcional/UX**, mas não implementa a arquitetura
prevista nos docs. Decisão do CEO: **o protótipo é a fonte de escopo; a
arquitetura-alvo permanece a dos docs `13`.**

| Item | No protótipo | Na visão-alvo (doc) | Tratamento sugerido |
|---|---|---|---|
| Persistência | `localStorage` no navegador | Postgres + `pgvector` (SPEC `02` §2; doc `13`) | UX e entidades viram tabelas/migrações; `localStorage` descartado |
| Backend | Nenhum (SPA cliente) | Node.js/TypeScript, monólito modular (doc `13`) | Reimplementar CRUDs como `rota → serviço → repositório` |
| Login / sessão | Inexistente (usuário local fixo) | JWT access+refresh, hash de senha (SPEC `02` §2) | Requisito novo; especificar em `21`/`22` |
| Autorização (RBAC) | Inexistente | `user`/`coordinator`/`admin` + `can()` (SPEC `09`) | Mapear cada ação de CRUD a uma permissão nomeada |
| Moderação / aprovação | Inexistente (tudo publica direto) | Fluxo de aprovação/moderação (SPEC `09`/`11`) | Introduzir estados de publicação para conteúdo cocriado |
| Comunidade / Q&A | **Ausente** no protótipo | Aba Comunidade/Q&A (PDR `10`, SPEC `11`) | Novo módulo; não há UX de referência no protótipo |
| Chat IA | Simulado por palavras-chave (`setTimeout`) | RAG real com **citação de fontes** e guardrails (SPEC `02`, doc `13`) | Preservar a UX conversacional; trocar o motor por RAG |
| Notebook (IA) | Ações simuladas por palavra-chave | Chamada de LLM via adapter (`LlmProvider`) | Manter UX; ligar ao provedor real |
| 3D | `.glb` local + fallback procedural | glTF com hotspots ligados a `term_slug` (doc `05`/`13`) | Reaproveitar UX; ligar hotspots ao dicionário via `slug` |
| Identidade de dados | IDs `custom-<Date.now()>` | Chaves/`slug` estáveis e `metadata jsonb` (SPEC `08`) | Redesenhar identificadores e elos por `slug` |

---

## 7. Proveniência e conteúdo de terceiros

Registro para o parecer de segurança/LGPD (Security Lead):

- **Logotipos das 14 marcas Stellantis** (`assets/logos/`) — marcas registradas de
  terceiros, uso apenas em protótipo interno.
- **Avatares / imagens** — arte claymorphic local e imagens estilo Unsplash;
  verificar licença antes de qualquer uso público.
- **Links externos** — mocks apontam para domínios `*.stellantis.com`
  (Academy, LXP Cornerstone, portais de documentação) e outras ferramentas.
- **Nomes de pessoas** — o organograma (`stellantis_hierarchy`) e a lista de
  especialistas (`stellantis_specialists`) exibem **nomes aparentemente reais**.
  Atenção **LGPD**: confirmar se são dados reais ou fictícios antes de qualquer
  publicação — a ser tratado em parecer do Security Lead.

---

## 8. Perguntas em aberto

1. **Prioridade de MVP entre módulos** — qual subconjunto (Dicionário, Chat/RAG,
   3D, Treinamento, Informações, Comunidade) entra no primeiro corte? Decisão de
   produto — *ainda em aberto* (Product Lead).
2. **Dados de pessoas: reais ou fictícios?** — os nomes no organograma e em
   especialistas precisam ser confirmados/anonimizados antes de publicar (LGPD).
   *Ainda em aberto* — depende de parecer do Security Lead.
3. **`avatar_2.png` truncado** — o arquivo veio truncado no upload do protótipo;
   pendente reenvio pelo CEO. *Ainda em aberto*.
4. **Categorias de termo** — o protótipo usa {`motorizacao`, `tecnologia`,
   `componentes`, `plataformas`}, mas a especificação original cita "Tecnologia,
   Engenharia, Negócios, Gestão". Qual taxonomia vale para o produto? *Ainda em
   aberto* (a resolver em `21`).
</content>
</invoke>
