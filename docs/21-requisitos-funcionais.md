# Requisitos Funcionais — Stellantis-Dictionary (derivados do protótipo)

> Status: **rascunho para revisão do Produto Lead / CEO**.
> Última atualização: 2026-07-17.
> Autoria: Analista de Requisitos (`requirements-analyst`), reporta ao Produto Lead.
> Cobre a **etapa 3 (Requisitos)** do ciclo de vida `14-ciclo-de-vida-engenharia.md`.
>
> **Fonte da verdade de escopo/UX:** o protótipo funcional em
> `prototypes/portal-spa/` (`index.html`, `style.css`, `app.js`,
> `car-interactivity.js`) e seus documentos originais
> `PROTOTIPO-ORIGINAL-README.md` e `requirements_specification-original.md`
> (referenciados adiante como **spec-original RF01–RF09 / RNF01–RNF05**).
> A referência de tela/módulo do protótipo é catalogada no doc `20`
> (referência do protótipo) — este documento aponta para lá por módulo.
> As decisões de produto vivem no PDR `03`; a arquitetura-alvo no doc `13`.

## 0. Como ler este documento

- Cada requisito tem **ID `RF-NNN`**, descrição, **critério de aceite verificável**
  e **rastreabilidade** ao módulo/tela do doc `20` e à spec-original.
- Requisitos marcados **[PROTÓTIPO]** já estão implementados/demonstráveis no
  protótipo (fonte da verdade).
- Requisitos marcados **[FUTURO]** fazem parte da visão-alvo (PDR `03`, SPECs
  `02`/`08`/`09`/`11`) mas **estão ausentes do protótipo** — ver §11.
- Nomes de código/campos em crase: `slug`, `term_slug`, `localStorage`.
- Nesta fase o protótipo persiste tudo em `localStorage` do navegador, **sem
  backend, sem autenticação e sem controle de acesso** — isto condiciona vários
  critérios de aceite abaixo e é reconciliado com a arquitetura-alvo no §11.

---

## 1. Módulo Dicionário de Termos Técnicos
> Doc `20` (Dicionário) • spec-original RF01/RF02 • `app.js` (grid de termos, busca,
> filtros, modal de detalhe, CRUD).

### RF-001 — Busca de termos em tempo real [PROTÓTIPO]
- **Descrição:** O usuário filtra a lista de termos digitando no campo de busca; a
  filtragem é instantânea (a cada tecla), sem recarregar a tela.
- **Critério de aceite:** Ao digitar um trecho (título ou definição), o grid passa a
  exibir **apenas** os termos que contêm o trecho (case-insensitive); ao limpar o
  campo, todos os termos reaparecem. Sem botão "buscar" e sem recarga de página.

### RF-002 — Filtro por categoria [PROTÓTIPO]
- **Descrição:** Botões de categoria segmentam o grid; combinável com a busca
  (RF-001). A **taxonomia canônica de categorias de termo** é a do protótipo
  (fonte da verdade — diretriz "o protótipo manda", CEO 2026-07-17):
  **`motorizacao`, `tecnologia`, `componentes`, `plataformas`** (doc `20` §4,
  `stellantis_terms.category`; cada categoria tem cor própria no modal de detalhe —
  doc `20` §5). A lista {Tecnologia, Engenharia, Negócios, Gestão} da spec-original
  **fica descartada** para o produto (ver §12, pergunta 7 resolvida; nota ao PDR `03`).
- **Critério de aceite:** Os botões de categoria são exatamente `motorizacao`,
  `tecnologia`, `componentes`, `plataformas` (mais "Todos"). Selecionar uma
  categoria exibe só os termos daquela categoria; "Todos" remove o filtro; o filtro
  ativo tem destaque visual. Busca + categoria aplicadas simultaneamente devolvem a
  interseção.

### RF-003 — Modal de detalhe do termo [PROTÓTIPO]
- **Descrição:** Clicar em um termo abre um modal com definição estendida, categoria
  e autor.
- **Critério de aceite:** O modal exibe título, definição completa, categoria e
  autor do termo selecionado, além das duas ações RF-004 e RF-005; fecha por botão
  ou clique fora.

### RF-004 — Atalho "Perguntar ao StellantisGPT" a partir do termo [PROTÓTIPO]
- **Descrição:** No modal de detalhe, ação que leva o usuário ao Chat IA já com uma
  pergunta contextualizada sobre o termo.
- **Critério de aceite:** Ao acionar, a SPA navega para a seção Chat IA e o campo de
  entrada vem **pré-preenchido** com uma pergunta contendo o título do termo (ver
  `app.js` ~L391–394). Cobre CU (doc `15`) "buscar termo → Perguntar ao GPT".

### RF-005 — Atalho "Criar Flashcard" a partir do termo [PROTÓTIPO]
- **Descrição:** No modal de detalhe, ação que transfere os dados do termo para o
  formulário de criação de flashcard na aba Treinamento.
- **Critério de aceite:** Ao acionar, a SPA navega para Treinamento e o formulário de
  flashcard vem pré-preenchido com frente/verso derivados do termo (título/definição).

### RF-006 — Cadastro/cocriação de termo (Create) [PROTÓTIPO]
- **Descrição:** Modal para inserir novo termo (título, definição, categoria, autor).
  O campo **categoria** aceita apenas os valores da taxonomia canônica de RF-002
  (`motorizacao`/`tecnologia`/`componentes`/`plataformas`).
- **Critério de aceite:** Ao salvar um termo válido, ele aparece imediatamente no
  grid, é persistido em `localStorage` (`stellantis_terms`) e concede **+50 XP**
  (ver RF-058). Campos obrigatórios validados antes de salvar.

### RF-007 — Edição e remoção de termo (Update/Delete) [PROTÓTIPO]
- **Descrição:** CRUD completo sobre termos cadastrados localmente.
- **Critério de aceite:** É possível editar um termo existente (mudanças refletidas
  no grid e persistidas) e removê-lo (some do grid e do `localStorage`).
- **Observação:** No protótipo **qualquer** usuário edita/remove qualquer termo (sem
  moderação nem autoria protegida). A visão-alvo restringe isso — ver RF-063/RF-064.

---

## 2. Módulo Explorador 3D (Cockpit / Veículo)
> Doc `20` (Explorador 3D) • spec-original RF03 • `car-interactivity.js` (Three.js,
> `OrbitControls`, `.glb`, fallback procedural, wireframe) • doc `05` (referência do
> cockpit) • PDR `03` D7/D8/D9.

### RF-010 — Renderização 3D do veículo [PROTÓTIPO]
- **Descrição:** Cena Three.js que carrega o modelo `.glb` do veículo
  (`Carro 3D/2021_jeep_grand_commander_k8.glb`) com iluminação.
- **Critério de aceite:** Ao abrir a seção, o modelo 3D é exibido; enquanto carrega,
  não trava a navegação da SPA.

### RF-011 — Órbita e zoom da câmera [PROTÓTIPO]
- **Descrição:** Controle de câmera via `OrbitControls` (arrastar para girar, roda
  para zoom).
- **Critério de aceite:** Arrastar com o mouse gira o veículo; a roda/gesto de pinça
  aproxima/afasta a câmera de forma suave.

### RF-012 — Alternância Sólido ↔ Wireframe [PROTÓTIPO]
- **Descrição:** Botão que alterna a renderização entre modo Sólido (realista) e
  Wireframe (malha digital), aplicando a alteração à(s) cena(s) ativa(s).
- **Critério de aceite:** Acionar o botão troca o material de todos os nós do modelo
  entre sólido e wireframe e atualiza o rótulo do botão (ver
  `car-interactivity.js` ~L516–549). Estado inicial = Sólido.

### RF-013 — Hotspots → verbete do dicionário [PROTÓTIPO]
- **Descrição:** Pontos de interesse clicáveis sobre o veículo abrem um modal
  contextual com a sigla e sua definição, com ligação ao verbete do dicionário.
- **Critério de aceite:** Clicar em um hotspot abre um modal com sigla + definição
  correspondente; há caminho para navegar até o verbete no Dicionário. Cobre CU
  (doc `15`) "hotspot 3D → verbete".

### RF-014 — Inspeção de componente e registro de insight [PROTÓTIPO]
- **Descrição:** A partir do hotspot, o Explorador 3D oferece duas ações distintas
  sobre o componente selecionado: (a) **inspecionar** (painel de detalhe + foco de
  câmera) e (b) **anotar uma ideia** (Painel de Ideias).
- **Critério de aceite (a — inspecionar):** Ao acionar a inspeção, o painel
  `inspectedInfo` exibe o **nome** do componente (`data.title`) e sua **descrição
  técnica** (`data.desc`), e a câmera do Explorador reposiciona-se para enquadrar a
  parte clicada (`car-interactivity.js` ~L577–594).
- **Critério de aceite (b — anotar ideia):** O botão "Anotar Ideia sobre esta parte"
  abre o modal de ideias já vinculado ao nome do componente
  (`openIdeaModal(data.title)`, ~L581); a ideia salva persiste em `localStorage` e
  fica disponível para reconsulta.

### RF-015 — Fallback sem WebGL / falha de carga do modelo [PROTÓTIPO]
- **Descrição:** Se o `GLTFLoader` não estiver disponível, ou o `.glb` falhar
  (erro/CORS), a cena constrói um veículo procedural de fallback.
- **Critério de aceite:** Sem WebGL ou com falha no `.glb`, a seção **não fica em
  branco**: exibe o carro procedural (`buildFallbackCar`, `car-interactivity.js`
  ~L382–394/L449) mantendo órbita e wireframe. Ver também RNF de compatibilidade
  (doc `22`, RNF-021).

---

## 3. Módulo Chat "StellantisGPT" (simulado)
> Doc `20` (Chat IA) • spec-original RF04 • `app.js` (respostas simuladas por
> palavras-chave, sidebar de histórico).

### RF-020 — Conversa em balões com IA simulada [PROTÓTIPO]
- **Descrição:** Interface conversacional com balões de usuário e IA e avatares
  distintos; as respostas são **simuladas** (regras por palavra-chave), sem LLM real.
- **Critério de aceite:** Enviar uma mensagem adiciona o balão do usuário e, após
  breve atraso, um balão da IA com resposta plausível baseada em palavras-chave (ver
  `app.js` respostas por `q.includes(...)`). **Não** há chamada a modelo/serviço
  externo nesta fase.

### RF-021 — Campo de entrada "pílula" reposicionável [PROTÓTIPO]
- **Descrição:** Barra de entrada translúcida que inicia centralizada no chat vazio e
  fixa-se na base ao iniciar o diálogo.
- **Critério de aceite:** Com histórico vazio, o input aparece centralizado; após a
  primeira mensagem, fixa-se na base da tela.

### RF-022 — Sidebar de histórico de conversas (local) [PROTÓTIPO]
- **Descrição:** Barra lateral recolhível com "nova conversa", busca e lista de
  diálogos recentes.
- **Critério de aceite:** É possível recolher/expandir a sidebar, iniciar nova
  conversa e ver diálogos recentes; o estado persiste na sessão local.

### RF-023 — Entrada de contexto vinda de outros módulos [PROTÓTIPO]
- **Descrição:** O chat aceita pré-preenchimento vindo do Dicionário (RF-004), de
  Especialistas (RF-041), de Automações (RF-046) e do Notebook (RF-032/33/34).
- **Critério de aceite:** Ao chegar por qualquer desses atalhos, o campo de entrada
  já contém a pergunta pré-formatada correspondente.

---

## 4. Módulo Notebook de Engenharia
> Doc `20` (Notebook) • spec-original RF05 • `app.js` (`stellantis_notebooks`,
> debounce 1200ms, ações de IA simuladas).

### RF-030 — Workspace dividido (nota + chat assistivo) [PROTÓTIPO]
- **Descrição:** Split-screen: editor de notas à esquerda e chat assistivo à direita.
- **Critério de aceite:** As duas áreas coexistem na mesma tela; escrever à esquerda e
  interagir à direita funcionam de forma independente.

### RF-031 — Autosave com debounce [PROTÓTIPO]
- **Descrição:** As notas salvam automaticamente durante a digitação, com debounce.
- **Critério de aceite:** Após ~**1200 ms** sem digitar, a nota é persistida em
  `localStorage` (`stellantis_notebooks`, `app.js` ~L769–794); reabrir a tela
  recupera o último conteúdo. Ver RNF de desempenho (doc `22`, RNF-002).

### RF-032 — Ação IA "Resumir" [PROTÓTIPO]
- **Critério de aceite:** Acionar "Resumir" processa o texto da nota e devolve um
  resumo simulado no chat à direita, sem apagar a nota.

### RF-033 — Ação IA "Melhorar escrita" [PROTÓTIPO]
- **Critério de aceite:** Acionar "Melhorar" devolve, no chat, uma versão aprimorada
  simulada do texto da nota.

### RF-034 — Ação IA "Extrair Siglas" [PROTÓTIPO]
- **Critério de aceite:** Acionar "Extrair Siglas" identifica siglas conhecidas no
  texto (ex.: ACC, AEB) e as lista com o significado no chat (`app.js` ~L967–974).

---

## 5. Módulo Treinamento
> Doc `20` (Treinamento) • spec-original RF06 • `app.js` (flashcards, cursos, canais,
> kit colaborador).

### RF-035 — Flashcards 3D (flip frente/verso) [PROTÓTIPO]
- **Descrição:** Cartões que giram 180° (CSS 3D) para revelar a resposta.
- **Critério de aceite:** Clicar no cartão executa a rotação frente↔verso; frente e
  verso exibem os textos cadastrados.

### RF-036 — Criação de flashcard com autocomplete do dicionário [PROTÓTIPO]
- **Descrição:** Formulário de criação de flashcard integrado à busca de termos do
  Dicionário para autopreencher frente/verso.
- **Critério de aceite:** Ao buscar uma sigla no formulário, o sistema sugere o termo
  e preenche frente (título) e verso (definição); o cartão criado persiste em
  `localStorage` (`stellantis_custom_flashcards`) e concede **+50 XP** (RF-058).

### RF-037 — Cursos/trilhas técnicas com conclusão [PROTÓTIPO]
- **Descrição:** Lições (ex.: Bio-Hybrid, ADAS, Motores MultiAir) com marcação de
  conclusão.
- **Critério de aceite:** Marcar um curso como concluído dispara RF-038 (XP + badge +
  possível level-up) e o estado de conclusão persiste.

### RF-038 — Recompensa de conclusão de curso (XP + badge + level-up) [PROTÓTIPO]
- **Descrição:** Concluir um curso concede **+350 XP**, ativa a insígnia técnica
  correspondente e pode elevar o nível.
- **Critério de aceite:** Ao concluir um curso ainda não concluído, `userXp += 350`,
  a insígnia (`biohybrid`/`adas`/`motores`) fica ativa, e se `userXp` atingir o teto
  do nível ocorre level-up com notificação (ver `app.js` `addXpOnCompletion`
  ~L1736). Concluir o mesmo curso de novo **não** concede XP repetido. Cobre CU
  (doc `15`) "concluir curso → XP/badge/level-up".

### RF-039 — Canais Oficiais de aprendizado (CRUD) [PROTÓTIPO]
- **Descrição:** Grid de portais externos (Stellantis Academy, Cornerstone LXP, etc.)
  com título, descrição e link, editável.
- **Critério de aceite:** É possível criar/editar/remover um canal; novos canais
  persistem e a criação concede **+50 XP** (RF-058); o link abre o portal externo.

### RF-040 — Kit Colaborador com links rápidos [PROTÓTIPO]
- **Descrição:** Cards de instruções de integração com até **dois** links rápidos
  (título + URL) cada.
- **Critério de aceite:** É possível cocriar um card com instruções e até 2 links;
  persiste em `localStorage`; a criação concede **+50 XP** (RF-058).

---

## 6. Módulo Informações de Engenharia
> Doc `20` (Informações) • spec-original RF07 • `app.js` (subabas: Especialistas,
> Componentes, Projetos, Organograma, Diretrizes, Timeline, Veículos).

### RF-041 — Corpo de especialistas + "Contatar" [PROTÓTIPO]
- **Descrição:** Lista de especialistas (bio curta, especialidade) com botão
  "Contatar Especialista" que leva ao Chat IA pré-digitando a dúvida direcionada.
- **Critério de aceite:** "Contatar" navega ao Chat IA com o campo pré-preenchido
  citando o nome/departamento do especialista (`app.js` ~L1416–1428). Cobre CU
  (doc `15`) "contatar especialista".

### RF-042 — Componentes de Infotainment com filtro Tier-1 [PROTÓTIPO]
- **Descrição:** Grid de componentes (nome, descrição, imagem) com filtro cruzado
  múltiplo por Categoria do Módulo e Fornecedor Tier-1 (Aptiv, Bosch, Harman,
  Marelli) via checkboxes.
- **Critério de aceite:** Selecionar um ou mais fornecedores/categorias restringe o
  grid à interseção; CRUD completo (com URL da imagem) persiste os componentes;
  criação concede **+50 XP** (RF-058).

### RF-043 — Projetos da marca + versões [PROTÓTIPO]
- **Descrição:** Grid de projetos veiculares com código interno, status (Conceito,
  Homologação, Produção), ficha técnica e versões.
- **Critério de aceite:** É possível consultar as versões/ficha de um projeto e
  cadastrar novos projetos (persistidos); criação concede **+50 XP** (RF-058).

### RF-044 — Organograma: árvore drill-down [PROTÓTIPO]
- **Descrição:** Árvore hierárquica de liderança com navegação por drill-down e
  breadcrumbs.
- **Critério de aceite:** Clicar em um nó aprofunda na hierarquia; breadcrumbs
  permitem voltar; nós podem ser ocultados/reexibidos.

### RF-045 — Organograma: modo gestão (CRUD hierárquico) [PROTÓTIPO]
- **Descrição:** Modo de edição que permite editar nome/cargo de um nó, cadastrar
  subordinados sob um líder específico e excluir ramos.
- **Critério de aceite:** No modo gestão, criar/editar/excluir nós reflete na árvore e
  persiste em `localStorage`. Cobre CU (doc `15`) "navegar/editar organograma".
- **Observação:** No protótipo o modo gestão é livre (sem RBAC) — a visão-alvo o
  restringe a `coordinator`/`admin` (RF-063).

### RF-045b — Organograma: mapa global de polos [PROTÓTIPO]
- **Critério de aceite:** O mapa mundial destaca os polos de engenharia; interações
  (hover/clique) nos pontos respondem visualmente.

### RF-047 — Diretrizes globais (FaSTLAne 2030 / Net Zero 2038 / valores) [PROTÓTIPO]
- **Critério de aceite:** A subaba institucional exibe os pilares do FaSTLAne 2030, a
  meta Net Zero Carbon 2038 e os valores corporativos (Customer First, Global
  Teamwork, We Are Agile, Winning Attitude).

### RF-048 — Marcos & Timeline [PROTÓTIPO]
- **Critério de aceite:** A timeline exibe, em ordem temporal, marcos históricos e
  lançamentos futuros da marca.

### RF-049 — Veículos [PROTÓTIPO]
- **Critério de aceite:** A subaba de veículos lista os modelos com destaques/ficha
  (ex.: versões e highlights do Commander) de forma consultável.

---

## 7. Módulo Automações & IA
> Doc `20` (Automações) • spec-original RF08 • `app.js` (grid de automações + ajuda no
> chat).

### RF-046 — Vitrine de automações/robôs de IA [PROTÓTIPO]
- **Descrição:** Grid de soluções de automação de engenharia com modal informativo e
  links de ferramenta.
- **Critério de aceite:** Cada card abre detalhes; há link para a ferramenta e/ou para
  contatar responsáveis; novos itens podem ser cadastrados (persistidos) concedendo
  **+50 XP** (RF-058).

### RF-046b — Ajuda dinâmica das automações via Chat [PROTÓTIPO]
- **Critério de aceite:** Botão no card leva ao Chat IA com pergunta operacional
  pré-preenchida sobre aquela ferramenta.

---

## 8. Módulo Perfil e Gamificação
> Doc `20` (Perfil) • spec-original RF09 • `app.js` (`stellantis_user_xp`,
> `_user_level`, `_user_badges`, timeline).

### RF-055 — Perfil do colaborador editável [PROTÓTIPO]
- **Descrição:** Perfil com nome, cargo, setor e avatar (seleção/upload), sincronizado
  no header e no dropdown.
- **Critério de aceite:** Editar nome/cargo/setor/avatar atualiza header, dropdown e
  seção de perfil, e persiste em `localStorage`.

### RF-056 — Barra de XP e níveis 1–4 [PROTÓTIPO]
- **Descrição:** Exibição de XP atual/teto e nível (1 Novato, 2 Júnior, 3 Pleno,
  4 Sênior).
- **Critério de aceite:** A barra reflete `userXp / maxXp` (teto 1500; 2500 no nível
  4) e o rótulo do nível corresponde ao `userLevel` (`app.js` ~L1531–1543).

### RF-057 — Mecanismo de level-up [PROTÓTIPO]
- **Descrição:** Ao atingir o teto do nível, promove o colaborador (cargo/insígnia de
  patente) com notificação/efeito.
- **Critério de aceite:** Quando `userXp >= maxXp`, `userLevel` incrementa, o
  excedente transita para o próximo nível e é exibida a notificação de promoção
  (`app.js` ~L1757–1766).

### RF-058 — Concessão de +50 XP por cocriação [PROTÓTIPO]
- **Descrição:** Toda ação de cocriação (termo, canal, kit, projeto, automação,
  componente, especialista) concede +50 XP.
- **Critério de aceite:** Concluir qualquer cocriação listada soma +50 a `userXp`,
  persiste e pode disparar level-up (RF-057). Cobre CU (doc `15`) "contribuir termo
  (+50 XP)".

### RF-059 — Insígnias de setor [PROTÓTIPO]
- **Descrição:** Selecionar o time corporativo no perfil ativa a insígnia de setor
  (ícone/cor específicos).
- **Critério de aceite:** Escolher um setor válido renderiza a insígnia
  correspondente no perfil e no dropdown.

### RF-060 — Insígnias técnicas por curso [PROTÓTIPO]
- **Descrição:** Concluir módulos técnicos desbloqueia insígnias (Bio-Hybrid, ADAS,
  MultiAir).
- **Critério de aceite:** A insígnia técnica fica "ativa" após concluir o curso
  correspondente (RF-038) e "pendente" antes disso.

### RF-061 — Timeline de histórico de contribuições [PROTÓTIPO]
- **Descrição:** Log persistido que registra cada contribuição e a exibe
  temporalmente no perfil.
- **Critério de aceite:** Cada cocriação/conclusão gera uma entrada datada na timeline
  do perfil, persistida e reexibida ao reabrir.

---

## 9. Requisitos transversais do protótipo
> Doc `20` (Transversais/Shell da SPA) • README do protótipo • `app.js`
> (`switchSection`, chaves `stellantis_*` no `localStorage`).

### RF-065 — Navegação SPA por abas [PROTÓTIPO]
- **Descrição:** Troca de seções sem recarregar a página (`switchSection`).
- **Critério de aceite:** Selecionar uma aba troca a seção visível instantaneamente,
  preservando o estado das demais.

### RF-066 — Persistência local de todo o estado [PROTÓTIPO]
- **Descrição:** Termos, flashcards, notas, canais, XP, insígnias, timeline etc. são
  persistidos em `localStorage`.
- **Critério de aceite:** Fechar e reabrir o navegador (mesmo dispositivo/origem)
  preserva os dados criados/progresso. Ver limites em RNF de portabilidade/segurança
  (doc `22`).

---

## 10. Matriz de cobertura RF ↔ Casos de uso (doc `15`)

> **Fechada na Etapa 5 (2026-07-17):** DoD exige que **todo RF** tenha ≥1 CU
> rastreável. Os CU-16..CU-21 foram acrescentados ao doc `15` §3.2 para cobrir os RF
> antes órfãos (Notebook, catálogos, institucionais, perfil, navegação, inspeção 3D).
> **0 RF órfãos** — a única exceção justificada é RF-070 (migração de infraestrutura,
> ver nota ao pé).

| RF | Caso(s) de uso (doc `15`) |
|---|---|
| RF-001, RF-002, RF-003 | CU-02 (buscar termo), CU-09 (buscar → GPT) |
| RF-004, RF-020, RF-021, RF-022, RF-023 | CU-03 (perguntar no chat), CU-09, CU-13 |
| RF-005, RF-035, RF-036 | CU-11 (termo → criar flashcard) |
| RF-006, RF-058, RF-061 | CU-05 (contribuir conteúdo), CU-10 (contribuir termo), CU-18 |
| RF-007 | CU-05 (contribuir/editar), CU-06 (moderar — visão-alvo) |
| RF-010, RF-011, RF-012 | CU-04 (cockpit 3D), CU-15 (hotspot → verbete) |
| RF-013, RF-015 | CU-15, CU-17 (inspecionar componente 3D) |
| RF-014 | CU-17 (inspecionar componente + anotar ideia) |
| RF-030, RF-031, RF-032, RF-033, RF-034 | CU-16 (Notebook com IA assistiva) |
| RF-037, RF-038, RF-057, RF-060 | CU-12 (concluir curso → XP/badge/level-up) |
| RF-039, RF-040, RF-042, RF-043, RF-046, RF-046b | CU-18 (cocriar catálogos dos módulos) |
| RF-041 | CU-13 (contatar especialista), CU-08 |
| RF-044, RF-045, RF-045b | CU-14 (navegar/editar organograma) |
| RF-047, RF-048, RF-049 | CU-19 (páginas institucionais: Diretrizes/Timeline/Veículos) |
| RF-055, RF-056, RF-059 | CU-20 (perfil + insígnia de setor), CU-12 |
| RF-065, RF-066 | CU-21 (navegação SPA); RF-066 transversal a CU-10/11/14/15/16/18 |
| RF-062 [FUTURO] | CU-01 (cadastro/login) |
| RF-063 [FUTURO] | CU-05, CU-06, CU-14 (RBAC governa estas ações) |
| RF-064 [FUTURO] | CU-06 (moderar contribuições) |
| RF-067 [FUTURO] | CU-07 (Comunidade Q&A) |
| RF-068 [FUTURO] | CU-03 (chat na versão RAG real com fontes) |
| RF-069 [FUTURO] | CU-08 (diretório), CU-13 (contatar especialista, dados reais) |
| RF-070 [FUTURO] | — (ver justificativa abaixo) |

> Os casos CU-09..CU-21 são detalhados no doc `15` §3.2. As regras de negócio
> associadas estão no doc `28` (Etapa 4).
>
> **Justificativa de RF sem CU:** **RF-070** (migração da persistência
> `localStorage` → backend) é um requisito **de infraestrutura/dados transversal**,
> sem fluxo de usuário próprio — ele **habilita** todos os CU quando o backend
> entra, mas não é iniciado por um ator. Sua verificação é por critério técnico
> (dados residem em Postgres via API autenticada), não por caso de uso. Portanto
> **não** requer CU dedicado (não é um RF órfão por omissão, e sim por natureza).

---

## 11. Requisitos FUTUROS — visão-alvo, ausentes do protótipo

> Presentes no PDR `03` e nas SPECs `02`/`08`/`09`/`11`, mas **não** implementados no
> protótipo (que roda sem backend/auth). Entram no backlog `04` como fases futuras.

### RF-062 — Autenticação e sessão reais (login/cadastro) [FUTURO]
- **Rastreabilidade:** PDR `03` D1; SPEC `02` §3.1; doc `13`.
- **Critério de aceite:** Cadastro com e-mail/senha (hash argon2), login com JWT
  (access + refresh em cookie httpOnly), sessão persistida server-side. Hoje o
  protótipo **não tem** login (perfil é apenas local).

### RF-063 — Controle de acesso por papéis (RBAC `user`/`coordinator`/`admin`) [FUTURO]
- **Rastreabilidade:** PDR `03` D12/D13; SPEC `09` §2.
- **Critério de aceite:** Ações de escrita/moderação/gestão (ex.: RF-007, RF-045)
  autorizadas por `can(user, permission)`; `user` não edita direto conteúdo alheio.
  Substitui o "tudo liberado" do protótipo.

### RF-064 — Moderação/aprovação de contribuições [FUTURO]
- **Rastreabilidade:** PDR `03` D14/D16; SPEC `09` §4/§6.
- **Critério de aceite:** `user` **propõe-e-aprova** (fila `pending → approved/
  rejected/withdrawn`); `coordinator`/`admin` editam direto; revisões versionadas
  (`content_revisions`) e `audit_log`. No protótipo a cocriação entra sem revisão.

### RF-067 — Comunidade / Q&A [FUTURO]
- **Rastreabilidade:** PDR `03` D17; SPECs `10`/`11`.
- **Critério de aceite:** Perguntar, responder, comentar, votar e aceitar resposta;
  tags ligadas a `term_slug`; moderação leve. Ausente no protótipo.

### RF-068 — Chat RAG real com citação de fontes [FUTURO]
- **Rastreabilidade:** PDR `03` D2/D4/D5; SPEC `02` §3.3/§3.4; doc `13`.
- **Critério de aceite:** Resposta gerada por LLM restrita ao contexto recuperado por
  similaridade (pgvector), **citando as fontes** (termos/documentos). Substitui o
  StellantisGPT simulado (RF-020).

### RF-069 — Diretório "Quem procurar" ligado por `term_slug` (dados reais) [FUTURO]
- **Rastreabilidade:** PDR `03` D10; docs `07`/`08`.
- **Critério de aceite:** Especialistas/responsáveis por componente resolvidos por
  `term_slug`, expostos no verbete e no hotspot 3D, só a autenticados. O protótipo
  tem lista estática sem essa ligação de dados.

### RF-070 — Migração da persistência `localStorage` → backend [FUTURO]
- **Rastreabilidade:** doc `13`; PDR `03` D1.
- **Critério de aceite:** Todos os dados hoje em `localStorage` (RF-066) passam a
  residir em Postgres via API, com autenticação; o estado deixa de ser por
  dispositivo/navegador.

---

## 12. Perguntas em aberto

1. **Autoria e edição de termos** — o protótipo permite editar/remover termo de
   qualquer autor sem restrição (RF-007). Na visão-alvo isso deve exigir RBAC
   (RF-063) e/ou moderação (RF-064). Confirmar a regra para o MVP real. *— ainda em
   aberto (nota ao PDR `03`).*
2. **Gamificação no produto real** — XP/insígnias/level-up (RF-056–RF-061) fazem
   parte do MVP com backend ou ficam como Fase posterior? O PDR `03` (roadmap §3)
   não menciona gamificação — possível novo `Dn`. *— ainda em aberto (nota ao PDR).*
3. **StellantisGPT simulado vs. RAG real** — em que fase o chat simulado (RF-020) é
   substituído pelo RAG (RF-068)? Coexistem em transição? *— ainda em aberto.*
4. **Escopo do organograma** — manter CRUD hierárquico livre (RF-045) ou restringir a
   `coordinator`/`admin` desde o MVP? *— ainda em aberto.*
5. **Módulos "extras" do protótipo** (Automações, Diretrizes, Timeline, Veículos,
   Kit Colaborador) — todos entram no MVP real ou parte vira Fase 3+? O backlog `04`
   ainda não os previa. *— ainda em aberto (ver reconciliação no `04`).*
6. **Modelo 3D oficial vs. placeholder** — o protótipo usa um `.glb` do Grand
   Commander (~19 MB). PDR `03` D9 prevê placeholder de licença livre. Confirmar o
   asset para produção e o alvo de peso/compressão Draco. *— ainda em aberto.*
7. ~~**Taxonomia de categorias de termo** — o protótipo usa {`motorizacao`,
   `tecnologia`, `componentes`, `plataformas`} e a spec-original citava {Tecnologia,
   Engenharia, Negócios, Gestão} (doc `20` §8 Q4; doc `26` R10). Qual vale para o
   produto?~~ — **RESOLVIDO (2026-07-17):** adotada a **taxonomia do protótipo**
   `{motorizacao, tecnologia, componentes, plataformas}` como **canônica**, por
   força da diretriz do CEO **"o protótipo manda"** (fonte da verdade de escopo). A
   lista da spec-original fica descartada. Refletido em **RF-002/RF-006**; nota de
   fechamento no doc `26` R10. **Nota ao PDR `03`:** registrar como nova linha `Dn`
   (próximo número livre, ~`D20`): *"Taxonomia canônica de categorias de termo =
   `{motorizacao, tecnologia, componentes, plataformas}` (protótipo manda) — ver
   `21` RF-002"*.
