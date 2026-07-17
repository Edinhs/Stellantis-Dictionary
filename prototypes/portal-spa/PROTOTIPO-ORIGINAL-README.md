# Stellantis Dictionary & Training Portal

Um protótipo de portal interativo premium desenvolvido para o ecossistema Stellantis, unindo engenharia de produto, tecnologia de infotretenimento, inteligência artificial e treinamento gamificado em uma experiência visual avançada.

## 🚀 Funcionalidades Principais

*   **Explorador Automotivo Interativo**: Navegação visual em 3D simulado sobre o Jeep Commander. Clique nos hotspots dinâmicos para ver detalhes e pular direto para verbetes do Dicionário ou registrar insights no Painel de Ideias.
*   **Dicionário de Engenharia Stellantis**: Glossário de siglas técnicas (ADAS, Bio-Hybrid, T270, eTCU, etc.) com busca inteligente, filtros por categoria de tecnologia e pop-ups de informações detalhadas.
*   **Integração IA StellantisGPT**: Chat de assistência inteligente automotiva (simulador de IA) para esclarecer dúvidas técnicas de peças e diretrizes do grupo.
*   **Centro de Treinamento Gamificado**:
    *   **Flashcards 3D**: Cartões de memorização tridimensionais (frente e verso) com suporte a criação de cartões personalizados e busca dinâmica integrada no Dicionário para auto-preenchimento rápido.
    *   **Trilhas Técnicas**: Leitura de cursos técnicos e sistema de gamificação com **Pontuação de XP** e ativação dinâmica de insígnias de certificação (*ADAS*, *Bio-Hybrid*, *MultiAir*), além de aumento de cargo corporativo automático no perfil do usuário.
    *   **Canais Oficiais**: Acesso rápido com animações premium a portais corporativos reais, como *Stellantis Academy*, *LXP Cornerstone*, *Android IVI Documentation* e *Developer Portal*.
*   **Automações & IA**: Vitrine dos projetos inovadores em andamento no setor com modais informativos, links para ferramentas e integração para contatar líderes e engenheiros responsáveis.
*   **Árvore Organizacional Drill-down**: Visualizador interativo de cargos, equipes e hierarquias com botão de visibilidade dinâmica (ocultação de nós) e mapa mundial de distribuição de polos de engenharia.
*   **Design Futurista (Stellantis Identity)**: Menu flutuante que se contrai em formato de pílula ao dar scroll, e constelação de partículas na logo da Stellantis que se expande e rotaciona ao passar o mouse.

---

## 🛠️ Tecnologias Utilizadas

*   **Estrutura**: HTML5 semântico
*   **Estilização**: Vanilla CSS (Efeitos Glassmorphism, Gradientes, Máscaras de Opacidade e Animações 3D nativas)
*   **Comportamento**: Vanilla JavaScript (Manipulação de DOM, LocalStorage para persistência de dados locais, Lucide Icons para vetores de ícones e lógica SPA)

---

## 🌍 Como visualizar e usar o protótipo

Existem duas formas principais de usar este protótipo:

### 1. Localmente em sua máquina
1. Baixe os arquivos do repositório.
2. Dê um clique duplo sobre o arquivo `index.html` para abri-lo diretamente em qualquer navegador moderno.
3. *Opcional:* Se preferir rodar em modo servidor, utilize extensões como o **Live Server** (no VS Code) ou rode `npx serve .` no terminal.

### 2. Publicando e usando de forma online via GitHub Pages
Para que outras pessoas da Stellantis ou parceiros externos vejam e interajam com o protótipo online de forma gratuita:
1. Acesse este repositório no seu GitHub.
2. Vá na aba **Settings** (Configurações) no menu superior.
3. No menu lateral esquerdo, clique em **Pages** (dentro da seção *Code and automation*).
4. Sob **Build and deployment**, selecione a branch `main` como a fonte (*Source*) e a pasta `/` (root) como o diretório.
5. Clique em **Save**.
6. Aguarde cerca de 1 a 2 minutos. O GitHub gerará um link público parecido com:  
   `https://edinhs.github.io/Stellantis-Prototipo/`
7. Compartilhe este link com quem você desejar! Todo o progresso de XP, flashcards criados e ideias salvas do visitante serão armazenados localmente e de forma segura no navegador dele.
