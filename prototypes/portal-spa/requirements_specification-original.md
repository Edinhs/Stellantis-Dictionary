# Especificação de Requisitos: Stellantis Dictionary

Este documento descreve detalhadamente a arquitetura, requisitos funcionais e não-funcionais, tecnologias e a estrutura operacional do protótipo **Stellantis Dictionary**. Ele foi elaborado para fornecer o contexto técnico completo e permitir revisões e ampliações por agentes externos de inteligência artificial.

---

## 💻 1. Arquitetura e Tecnologias

O protótipo é estruturado no modelo de **Single Page Application (SPA)** local, executado diretamente no navegador do usuário, garantindo alta velocidade de navegação, carregamento assíncrono e persistência de dados.

*   **Estrutura (HTML5)**: Marcação semântica limpa contendo as seções de abas principais e modais flutuantes de cadastro/detalhes acoplados dinamicamente.
*   **Estilo e Design (CSS3)**: CSS Vanilla com variáveis customizadas para tokens de design. Design fundamentado em **Glassmorphism** (fundos escuros translúcidos, bordas finas com opacidade e desfoques com `backdrop-filter: blur()`), gradientes dinâmicos de contraste ciano/azul escuro, micro-animações no hover de elementos interativos e responsividade nativa via Flexbox e CSS Grid.
*   **Lógica e Comportamento (JS ES6+)**: Vanilla JavaScript responsável pelo controle do estado da SPA (função `switchSection`), renderização reativa das grades de dados (CRUDs), gerenciamento de busca em tempo real, filtros dinâmicos múltiplos, interações de gamificação e salvamento local.
*   **Interface 3D (WebGL / Three.js)**: Utilização da biblioteca Three.js para inicialização procedural de uma cena tridimensional contendo um veículo translúcido interativo com suporte a órbita de câmera (OrbitControls), iluminação difusa/direcional e hotspots mecânicos programados com prejuízo vetorial.
*   **Iconografia**: Biblioteca CDN Lucide Icons.
*   **Persistência**: `LocalStorage` do navegador, permitindo salvar o progresso de cursos, insígnias, XP, novos termos técnicos, componentes, projetos, automações e a timeline de histórico sem necessidade de backend ativo em ambiente de homologação.

---

## ⚙️ 2. Requisitos Funcionais (RF)

### RF01 - Dicionário de Termos Técnicos
*   **Busca em tempo real**: Filtragem instantânea de termos à medida que o colaborador digita.
*   **Filtro por Categorias**: Botões que segmentam os termos em categorias (Tecnologia, Engenharia, Negócios, Gestão).
*   **Modal de Detalhes**: Exibe definição estendida, categoria, autor e disponibiliza atalhos integrados:
    *   *Perguntar ao StellantisGPT*: Redireciona o colaborador para o Chat IA e inicia uma pesquisa contextualizada sobre o termo.
    *   *Criar Flashcard*: Transfere os dados do termo automaticamente para o modal de criação de flashcard na aba de Treinamento.

### RF02 - Cadastro e Cocriação de Termos (CRUD)
*   **Adição Dinâmica**: Modal para que o usuário insira novos termos técnicos (Título, Definição, Categoria e Autor).
*   **Persistência**: Persistência imediata no `LocalStorage` e regeneração reativa do grid de termos.

### RF03 - Visualizador Veicular 3D Interativo
*   **Pontos de Interesse (Hotspots)**: Elementos visuais clicáveis posicionados sobre a imagem e o modelo 3D do veículo. O clique nos hotspots abre um modal contextual contendo a sigla e sua definição correspondente no dicionário.
*   **Controle e Modos 3D**: Interface Three.js permitindo rotação do veículo com o mouse, controle de zoom e alternância em tempo real entre os modos de renderização Sólido e Wireframe Digital.

### RF04 - Central de Chat IA (StellantisGPT)
*   **Layout Conversacional**: Mensagens dispostas em formato de balões com avatares distintos para o Usuário e a IA.
*   **Input Inteligente**: Barra de entrada no formato pílula translúcida que inicia centralizada no chat vazio e desloca-se para a base de forma fixa assim que o diálogo é iniciado.
*   **Barra Lateral de Histórico**: Sidebar recolhível/expansível contendo opções para criar novas conversas, busca rápida e lista de diálogos recentes.

### RF05 - Módulo de Notebook de Engenharia
*   **Split-Screen Workspace**: Tela dividida contendo o bloco de notas de engenharia na esquerda e o Chat IA assistivo na direita.
*   **Auto-save Dinâmico**: Salvamento automático dinâmico das notas em tempo de digitação utilizando técnica de debounce de 1.2 segundos no LocalStorage.
*   **Ações Assistidas por IA**: Botões integrados na nota (**Resumir**, **Melhorar escrita** e **Extrair Siglas**) que processam o texto na esquerda e trazem insights instantâneos no chat da direita.

### RF06 - Centro de Treinamento e Integração
*   **Kit Colaborador Dinâmico**: Grid instrutivo onde os engenheiros podem cocriar cartões contendo instruções de integração e anexar até dois **Links Rápidos** (título + URL) de acesso externo rápido de forma simples.
*   **Flashcards 3D (Memorização)**:
    *   Cartões de estudo que giram fisicamente 180° com efeitos de transição CSS 3D ao clicar para mostrar a resposta técnica.
    *   Formulário de cadastro integrado com o Dicionário, permitindo preencher instantaneamente a frente/verso do flashcard através da busca de siglas.
*   **Canais Oficiais de Aprendizado**: Grid dinâmico com links e descrições detalhadas para portais como Stellantis Academy, Cornerstone LXP e portais de documentação técnica (CRUD funcional).
*   **Cursos de Módulos Técnicos**: Listagem de lições sobre Bio-Hybrid, ADAS e Motores MultiAir com controle de conclusão, bonificação de XP e liberação de insígnias.

### RF07 - Central de Informações de Engenharia
*   **Corpo de Especialistas**: Listagem de engenheiros seniores do time contendo biografia curta, especialidade, e botão **"Contatar Especialista"** que migra para o Chat IA e pré-digita a dúvida técnica direcionada para o engenheiro escolhido.
*   **Projetos da Marca**: Grid de projetos veiculares contendo códigos internos (ex: *J3U*), status de produção (Conceito, Homologação, Produção), ficha técnica e persistência de novos cadastros comunitários.
*   **Componentes de Infotainment**:
    *   Grid de peças contendo nome, descrição técnica e imagem do componente em alta resolução.
    *   **Filtro Cruzado Múltiplo via Dropdowns**: Seleção múltipla por Categoria do Módulo e Fornecedor Tier-1 (*Aptiv*, *Bosch*, *Harman*, *Marelli*) com checkboxes dinâmicos.
    *   CRUD completo com URL da imagem para cadastro de novos componentes veiculares.
*   **Árvore Organizacional Drill-down (Liderança)**:
    *   Visualização gráfica interativa da estrutura de líderes em formato hierárquico com breadcrumbs funcionais.
    *   **Módulo Administrativo (CRUD Hierárquico)**: Modo de edição que exibe ações rápidas nos nós permitindo editar nomes/cargos, cadastrar subordinados sob líderes específicos ou excluir filiais da árvore organizacional com persistência.
*   **Diretrizes Globais**: Espaço institucional exibindo os pilares do plano **FaSTLAne 2030**, metas ESG **Net Zero Carbon 2038** e valores corporativos (Customer First, Global Teamwork, We Are Agile e Winning Attitude).
*   **Marcos & Timeline**: Timeline histórica de evolução da marca e lançamentos futuros.

### RF08 - Grade de Automações & IA
*   **Soluções Inteligentes**: Grade dinâmica contendo robôs de automação de engenharia e ferramentas computacionais ativas da Stellantis.
*   **Ajuda Dinâmica**: Botões integrados nos cards de IA que redirecionam o colaborador para o Chat IA com perguntas operacionais automatizadas sobre aquela ferramenta.

### RF09 - Sistema de Perfil e Gamificação de XP
*   **Concessão de Experiência (XP)**:
    *   *+50 XP* para qualquer ação de cocriação e colaboração ativa (adicionar termo, canal, kit, projeto, automação, componente ou especialista).
    *   *+350 XP* para a conclusão de cursos técnicos.
*   **Mecanismo de Level Up**: Ao preencher a barra de progresso de nível, o sistema ativa uma notificação com efeitos de confete, altera o nível do colaborador, promove o cargo (ex: de Júnior para Pleno/Sênior) e atualiza a insígnia metálica de patente.
*   **Insígnias Dinâmicas**:
    *   *Insígnias de Setor*: Ativadas automaticamente ao selecionar o time corporativo de atuação no perfil, renderizando ícones e cores específicas de acordo com o setor.
    *   *Insígnias Técnicas*: Desbloqueadas dinamicamente com a conclusão dos módulos técnicos.
*   **Timeline de Histórico**: Log persistido que registra cada contribuição efetuada pelo colaborador e exibe de forma temporal em seu Perfil.

---

## 👁️ 3. Requisitos Não-Funcionais (RNF)

*   **RNF01 - Estética Visual de Alto Nível (WOW Effect)**: O visual do protótipo deve parecer de última geração e premium. Uso obrigatório de sombras gerais (glow) em ciano e azul sobre elementos em hover, fontes modernas da Google Fonts (Outfit, Inter), fundo com gradientes cósmicos e desfoque acentuado nos modais.
*   **RNF02 - Responsividade Fluida (Menu de 3 Níveis Inteligente)**:
    *   Em resoluções menores (tablet e celular), o cabeçalho `.main-header` se reorganiza em formato de coluna: Logotipo no topo, menu de abas principais com quebra natural de linha no centro e o perfil do usuário posicionado absolutamente no **canto superior direito**.
    *   O recuo superior do conteúdo principal (`.content-wrapper`) se adapta de forma dinâmica para afastar a área de visualização e evitar qualquer sobreposição.
*   **RNF03 - Cabeçalho Inteligente (Hide on Scroll)**: O menu superior `.main-header` oculta-se deslizando para cima ao rolar a página para baixo (scroll down) e reexibe-se suavemente ao rolar para cima (scroll up) ou ao alcançar o topo da tela, economizando área útil de visualização móvel.
*   **RNF04 - Menus Suspensos Responsivos (Dropdowns Inline)**: Submenus e o card de perfil se comportam como dropdowns suspensos clássicos no toque, flutuando dinamicamente logo abaixo dos botões do menu ou perfil sem quebras abruptas de tela.
*   **RNF05 - Ausência de Placeholders e Carregamento Rápido**: O protótipo carrega avatares 3D e logotipos de marcas a partir da estrutura de arquivos local (pasta `assets/avatars/` e `assets/logos/`), acelerando o tempo de resposta inicial.

---

## 📁 4. Estrutura Operacional de Arquivos

```
📂 Stellantis-Prototipo/
├── 📄 index.html                # Estrutura HTML5, templates e modais SPA
├── 📄 style.css                  # Folha de estilo premium e media queries responsivas
├── 📄 app.js                     # Core do SPA, CRUDs, Chat, Notebook e Gamificação
├── 📄 car-interactivity.js       # Mecanismo procedural do visualizador veicular 3D (Three.js)
├── 📄 requirements_specification.md # Este documento de especificações técnicas
└── 📂 assets/
    ├── 📂 logos/                 # Logotipos transparentes das 14 marcas Stellantis
    └── 📂 avatars/               # Imagens de avatares 3D claymorphic locais (1 a 8)
```
