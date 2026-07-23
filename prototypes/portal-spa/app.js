/* ==========================================
   STELLANTIS DICTIONARY - INTERATIVIDADE & DADOS
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar Lucide Icons
    lucide.createIcons();

    // Lógica de Scroll do Header (Cápsula Flutuante + Ocultação Inteligente)
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.main-header');
        if (header) {
            const currentScrollY = window.scrollY;
            
            // Adicionar/remover classe scrolled
            if (currentScrollY > 45) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            // Ocultar ao rolar para baixo, mostrar ao rolar para cima
            if (currentScrollY > 120) {
                if (currentScrollY > lastScrollY) {
                    header.classList.add('header-hidden');
                } else {
                    header.classList.remove('header-hidden');
                }
            } else {
                header.classList.remove('header-hidden');
            }
            
            lastScrollY = currentScrollY;
        }
    });

    // 1. BANCO DE DADOS DE TERMOS INICIAIS
    const defaultTerms = [
        {
            id: 'adas',
            title: 'ADAS',
            def: 'Advanced Driver Assistance Systems. Sistemas avançados de assistência ao condutor que utilizam câmeras, radares e sensores para automação parcial e segurança (ex: frenagem autônoma, leitor de faixa).',
            category: 'tecnologia',
            author: 'Sistema'
        },
        {
            id: 'bio-hybrid',
            title: 'Bio-Hybrid',
            def: 'Nova tecnologia de propulsão híbrida flex da Stellantis que combina eletrificação com biocombustíveis (etanol), otimizando eficiência energética e reduzindo emissões no mercado sul-americano.',
            category: 'motorizacao',
            author: 'Sistema'
        },
        {
            id: 't270',
            title: 'T270 Turbo Flex',
            def: 'Motor 1.3 Litros Turbo Flex de alta eficiência da Stellantis. Produz 185 cv e 270 Nm de torque, equipando modelos Jeep (Compass, Commander, Renegade) e Fiat (Toro, Fastback).',
            category: 'motorizacao',
            author: 'Sistema'
        },
        {
            id: 'hurricane4',
            title: 'Hurricane 4',
            def: 'Motor 2.0 Litros Turbo a gasolina de 272 cv de potência e 400 Nm de torque. Projetado para alto desempenho em utilitários e picapes, equipando o Jeep Wrangler, Commander e a Ram Rampage.',
            category: 'motorizacao',
            author: 'Sistema'
        },
        {
            id: 'stla-medium',
            title: 'Plataforma STLA Medium',
            def: 'Plataforma global de veículos Stellantis projetada especificamente para veículos elétricos a bateria (BEV) de tamanho médio, com autonomia projetada de até 700 km.',
            category: 'plataformas',
            author: 'Sistema'
        },
        {
            id: 'grid-jeep',
            title: 'Grade Frontal Jeep (7 Fendas)',
            def: 'Assinatura visual histórica da marca Jeep. No protótipo do Stellantis Dictionary, representa a integração entre herança estilística clássica e dutos aerodinâmicos ativos.',
            category: 'componentes',
            author: 'Sistema'
        },
        {
            id: 'cluster-digital',
            title: 'Cluster Digital ADAS',
            def: 'Painel de instrumentos digital integrado Stellantis que centraliza dados do veículo, alertas de colisão e navegação 3D para maior segurança sem distração ocular.',
            category: 'componentes',
            author: 'Sistema'
        },
        {
            id: 'etcu',
            title: 'eTCU (Electric Transmission Control)',
            def: 'Unidade inteligente de controle eletrônico da transmissão projetada especificamente para coordenar a troca suave entre tração térmica e propulsão elétrica nos modelos híbridos.',
            category: 'tecnologia',
            author: 'Sistema'
        }
    ];

    // Carregar termos do LocalStorage ou usar padrões
    let terms = JSON.parse(localStorage.getItem('stellantis_terms')) || defaultTerms;
    if (!localStorage.getItem('stellantis_terms')) {
        localStorage.setItem('stellantis_terms', JSON.stringify(defaultTerms));
    }

    // 2. SISTEMA DE NAVEGAÇÃO SPA (SINGLE PAGE APPLICATION)
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.app-section');

    function switchSection(targetId) {
        sections.forEach(section => {
            section.classList.remove('active');
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        const targetSection = document.getElementById(`sec-${targetId}`);
        const targetLink = document.querySelector(`.nav-link[data-target="${targetId}"]`);
        
        if (targetSection) {
            targetSection.classList.add('active');
            if (targetLink) {
                targetLink.classList.add('active');
            }
            // Scroll suave até o topo
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.classList.contains('dropdown-toggle')) {
                e.preventDefault();
                e.stopPropagation();
                
                const parent = link.closest('.nav-item-dropdown');
                if (parent) {
                    const isOpen = parent.classList.contains('open');
                    // Fechar todos os outros dropdowns de abas
                    document.querySelectorAll('.nav-item-dropdown').forEach(item => {
                        item.classList.remove('open');
                    });
                    // Alternar o atual
                    if (!isOpen) {
                        parent.classList.add('open');
                    }
                }
                return;
            }
            const targetId = link.getAttribute('data-target');
            switchSection(targetId);
        });
    });

    // Fechar os dropdowns de abas ao clicar fora
    document.addEventListener('click', () => {
        document.querySelectorAll('.nav-item-dropdown').forEach(item => {
            item.classList.remove('open');
        });
    });

    // ---------------------------------------------------------------------
    // PONTE 3D -> DICIONÁRIO (fonte única da verdade)
    // O Explorador 3D da Início ancora hotspots por `term_slug` (= id do termo)
    // e NÃO duplica texto: o nome/definição vêm daqui, dos termos reais. Estas
    // funções são o "roteador" coerente com o SPA (switchSection) para levar do
    // hotspot ao verbete — equivalente à rota #/dicionario/{slug}.
    // ---------------------------------------------------------------------
    window.stellantisGetTerm = function (slug) {
        return terms.find(t => t.id === slug) || null;
    };
    window.stellantisNavigateToTerm = function (slug) {
        switchSection('dicionario');
        const term = terms.find(t => t.id === slug);
        if (term) {
            // pequeno atraso p/ o scroll suave da seção terminar antes do modal
            setTimeout(() => openTermDetailsModal(term), 260);
        } else if (searchInput) {
            // termo ainda não cadastrado: cai numa busca (nada fica inacessível)
            searchInput.value = slug;
            searchInput.dispatchEvent(new Event('input'));
        }
    };

    // Botão de chamada para ação na Home direciona para o Dicionário
    const btnExploreDict = document.getElementById('btn-explore-dict');
    if (btnExploreDict) {
        btnExploreDict.addEventListener('click', () => {
            switchSection('dicionario');
        });
    }


    // 3. LOGICA DO DICIONÁRIO DE TERMOS (Renderização e Filtros)
    const termsGrid = document.getElementById('termsGrid');
    const searchInput = document.getElementById('searchTerms');
    const filterButtons = document.querySelectorAll('.filter-btn');

    let currentCategory = 'all';
    let searchQuery = '';

    // Escapa texto vindo de dados (título, definição, categoria, autor, etc.)
    // antes de interpolar em innerHTML. Defesa contra XSS (DOM/armazenado): o
    // modal de "editar" persiste texto livre em localStorage que é re-renderizado
    // nos cards; sem escape, um verbete com `<img onerror=...>` executaria script.
    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Gate de permissão — espelha `can(user, 'dictionary.edit')` (SPEC 09/11).
    // No produto real, edição direta é de coordinator/admin; contribuidor comum
    // usa "propor" (contributions). Aqui, no protótipo (sem RBAC de verdade),
    // este é o ÚNICO ponto de decisão: a visibilidade REAL virá do cargo
    // informado pela API na integração. DENY-BY-DEFAULT: sem a flag explícita
    // (null), assume-se SEM permissão de edição — nunca liga sozinho.
    function canEditDictionary() {
        const flag = localStorage.getItem('stellantis_can_edit_dictionary');
        return flag === 'true';
    }

    function renderTerms() {
        if (!termsGrid) return;
        termsGrid.innerHTML = '';

        const filtered = terms.filter(term => {
            const matchesCategory = currentCategory === 'all' || term.category === currentCategory;
            const matchesSearch = term.title.toLowerCase().includes(searchInput.value.toLowerCase()) || 
                                 term.def.toLowerCase().includes(searchInput.value.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        if (filtered.length === 0) {
            termsGrid.innerHTML = `
                <div class="no-results-card" style="grid-column: 1/-1; text-align: center; padding: 40px; background: var(--glass-bg); border-radius: 16px; border: 1px solid var(--glass-border);">
                    <i data-lucide="info" style="width: 40px; height: 40px; color: var(--accent); margin-bottom: 12px;"></i>
                    <p style="color: var(--text-muted);">Nenhum termo encontrado para a busca ou filtro selecionado.</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        const showEdit = canEditDictionary();

        filtered.forEach(term => {
            const card = document.createElement('div');
            card.className = 'term-card';
            card.setAttribute('data-id', term.id);
            const editBtnHtml = showEdit
                ? `<button type="button" class="term-card-edit-btn" data-edit-id="${escapeHtml(term.id)}" aria-label="Editar verbete ${escapeHtml(term.title)}" title="Editar verbete"><i data-lucide="pencil"></i></button>`
                : '';
            card.innerHTML = `
                <div class="term-header">
                    <span class="term-badge">${escapeHtml(term.category || 'a classificar')}</span>
                    <div class="term-header-actions">
                        <i data-lucide="book-open" style="width: 16px; height: 16px; color: var(--accent);" aria-hidden="true"></i>
                        ${editBtnHtml}
                    </div>
                </div>
                <h3 class="term-title">${escapeHtml(term.title)}</h3>
                <p class="term-def">${escapeHtml(term.def)}</p>
                <div class="term-meta">
                    <i data-lucide="user" style="width: 10px; height: 10px;"></i>
                    <span>Cadastrado por: ${escapeHtml(term.author || 'Sistema')}</span>
                </div>
            `;
            card.addEventListener('click', () => {
                openTermDetailsModal(term);
            });
            const editBtn = card.querySelector('.term-card-edit-btn');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // não abrir o modal de detalhes ao editar
                    openEditTermModal(term);
                });
            }
            termsGrid.appendChild(card);
        });

        lucide.createIcons();
    }

    if (searchInput) {
        searchInput.addEventListener('input', renderTerms);
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-category');
            renderTerms();
        });
    });

    // LÓGICA DO MODAL DE ADICIONAR NOVO TERMO
    const modalAddTerm = document.getElementById('modalAddTerm');
    const btnOpenAddTermModal = document.getElementById('btnOpenAddTermModal');
    const btnCloseAddTermModal = document.getElementById('btnCloseAddTermModal');
    const btnCancelAddTermModal = document.getElementById('btnCancelAddTermModal');
    const btnSaveNewTerm = document.getElementById('btnSaveNewTerm');
    const formAddTerm = document.getElementById('formAddTerm');

    if (btnOpenAddTermModal && modalAddTerm) {
        btnOpenAddTermModal.addEventListener('click', () => {
            modalAddTerm.classList.add('open');
        });
    }

    function closeAddTermModal() {
        if (modalAddTerm) {
            modalAddTerm.classList.remove('open');
            if (formAddTerm) formAddTerm.reset();
        }
    }

    if (btnCloseAddTermModal) {
        btnCloseAddTermModal.addEventListener('click', closeAddTermModal);
    }
    if (btnCancelAddTermModal) {
        btnCancelAddTermModal.addEventListener('click', closeAddTermModal);
    }
    if (modalAddTerm) {
        modalAddTerm.addEventListener('click', (e) => {
            if (e.target === modalAddTerm) {
                closeAddTermModal();
            }
        });
    }

    if (btnSaveNewTerm) {
        btnSaveNewTerm.addEventListener('click', () => {
            const titleInput = document.getElementById('termTitle');
            const categorySelect = document.getElementById('termCategory');
            const defTextarea = document.getElementById('termDef');
            const authorInput = document.getElementById('termAuthor');

            if (!titleInput || !defTextarea) return;

            const title = titleInput.value.trim();
            const category = categorySelect.value;
            const def = defTextarea.value.trim();
            const author = authorInput.value.trim() || 'Usuário';

            if (title === '' || def === '') {
                alert('Por favor, preencha o título e a definição do termo.');
                return;
            }

            const newTerm = {
                id: 'custom-' + Date.now(),
                title: title,
                category: category,
                def: def,
                author: author
            };

            // Adiciona no início do array de termos para que apareça primeiro na lista
            terms.unshift(newTerm);
            localStorage.setItem('stellantis_terms', JSON.stringify(terms));
            
            // Re-renderizar lista
            renderTerms();
            
            // Fechar modal e resetar
            closeAddTermModal();
        });
    }

    // LÓGICA DO MODAL DE DETALHES DE TERMO (POP-UP)
    const modalTermDetails = document.getElementById('modalTermDetails');
    const termDetailsTitle = document.getElementById('termDetailsTitle');
    const termDetailsDef = document.getElementById('termDetailsDef');
    const termDetailsCategory = document.getElementById('termDetailsCategory');
    const termDetailsAuthor = document.getElementById('termDetailsAuthor');
    const btnCloseTermDetailsModal = document.getElementById('btnCloseTermDetailsModal');
    const btnCancelTermDetailsModal = document.getElementById('btnCancelTermDetailsModal');
    const btnAskGptAboutTerm = document.getElementById('btnAskGptAboutTerm');
    const btnCreateFlashcardFromTerm = document.getElementById('btnCreateFlashcardFromTerm');

    let activeDetailsTerm = null;

    function openTermDetailsModal(term) {
        if (!modalTermDetails || !term) return;
        activeDetailsTerm = term;

        if (termDetailsTitle) termDetailsTitle.textContent = term.title;
        if (termDetailsDef) termDetailsDef.textContent = term.def;
        if (termDetailsCategory) {
            termDetailsCategory.textContent = term.category;
            
            // Atribuir cores diferentes de acordo com a categoria
            let color = 'var(--secondary)';
            let bg = 'rgba(6, 182, 212, 0.1)';
            let border = 'rgba(6, 182, 212, 0.2)';
            
            if (term.category === 'motorizacao') {
                color = '#a855f7'; // Roxo
                bg = 'rgba(168, 85, 247, 0.1)';
                border = 'rgba(168, 85, 247, 0.2)';
            } else if (term.category === 'tecnologia') {
                color = 'var(--accent)'; // Azul
                bg = 'rgba(59, 130, 246, 0.1)';
                border = 'rgba(59, 130, 246, 0.2)';
            } else if (term.category === 'componentes') {
                color = '#f59e0b'; // Amarelo
                bg = 'rgba(245, 158, 11, 0.1)';
                border = 'rgba(245, 158, 11, 0.2)';
            } else if (term.category === 'plataformas') {
                color = '#10b981'; // Verde
                bg = 'rgba(16, 185, 129, 0.1)';
                border = 'rgba(16, 185, 129, 0.2)';
            }
            
            termDetailsCategory.style.color = color;
            termDetailsCategory.style.background = bg;
            termDetailsCategory.style.borderColor = border;
        }
        if (termDetailsAuthor) {
            termDetailsAuthor.innerHTML = `<i data-lucide="user" style="width: 14px; height: 14px; color: var(--secondary); display: inline-block; vertical-align: middle; margin-right: 4px;"></i> ${escapeHtml(term.author || 'Sistema')}`;
        }

        modalTermDetails.classList.add('open');
        lucide.createIcons();
    }

    function closeTermDetailsModal() {
        if (modalTermDetails) {
            modalTermDetails.classList.remove('open');
        }
    }

    if (btnCloseTermDetailsModal) btnCloseTermDetailsModal.addEventListener('click', closeTermDetailsModal);
    if (btnCancelTermDetailsModal) btnCancelTermDetailsModal.addEventListener('click', closeTermDetailsModal);
    if (modalTermDetails) {
        modalTermDetails.addEventListener('click', (e) => {
            if (e.target === modalTermDetails) {
                closeTermDetailsModal();
            }
        });
    }

    // Botão de interagir com o Chat IA
    if (btnAskGptAboutTerm) {
        btnAskGptAboutTerm.addEventListener('click', () => {
            if (!activeDetailsTerm) return;
            
            closeTermDetailsModal();
            switchSection('chat-ia');

            if (chatInputGpt) {
                chatInputGpt.value = `Olá! Poderia me explicar em detalhes e fornecer exemplos práticos de aplicação sobre o termo técnico "${activeDetailsTerm.title}" no contexto da Stellantis?`;
                chatInputGpt.focus();
            }
        });
    }

    // Botão de criar flashcard a partir do termo do dicionário
    if (btnCreateFlashcardFromTerm) {
        btnCreateFlashcardFromTerm.addEventListener('click', () => {
            if (!activeDetailsTerm) return;
            
            // 1. Fechar o modal de detalhes do termo
            closeTermDetailsModal();
            
            // 2. Preencher os inputs do modal de flashcards
            const watermarkInput = document.getElementById('cardWatermark');
            const titleInput = document.getElementById('cardTitle');
            const questionInput = document.getElementById('cardQuestion');
            const answerInput = document.getElementById('cardAnswer');

            if (watermarkInput) watermarkInput.value = activeDetailsTerm.title.charAt(0).toUpperCase();
            if (titleInput) titleInput.value = activeDetailsTerm.title;
            if (questionInput) questionInput.value = `O que é ${activeDetailsTerm.title}?`;
            if (answerInput) answerInput.value = activeDetailsTerm.def;

            // 3. Mudar para a seção principal de Treinamento
            switchSection('treinamento');
            
            // 4. Mudar para a subaba de Flashcards (cards)
            const subBtn = document.querySelector(`.sub-nav-btn[data-subtarget="cards"]`);
            if (subBtn) subBtn.click();
            
            // 5. Abrir o modal de novo flashcard
            const modalAddCard = document.getElementById('modalAddCard');
            if (modalAddCard) {
                modalAddCard.classList.add('open');
            }

            // 6. Feedback visual sutil (piscar leve nos inputs)
            [watermarkInput, titleInput, questionInput, answerInput].forEach(inp => {
                if (inp) {
                    inp.style.borderColor = 'var(--secondary)';
                    setTimeout(() => {
                        inp.style.borderColor = 'var(--glass-border)';
                    }, 800);
                }
            });
        });
    }

    // LÓGICA DO MODAL DE EDITAR VERBETE (completar tradução PT, categoria,
    // sinônimos e publicar). Aberto pelo botão-lápis do card. Espelha a regra do
    // backend (RN publish): não se PUBLICA sem categoria (migração 0008 /
    // dictionary.service).
    const modalEditTerm = document.getElementById('modalEditTerm');
    const editTermTitle = document.getElementById('editTermTitle');
    const editTermCategory = document.getElementById('editTermCategory');
    const editTermDef = document.getElementById('editTermDef');
    const editTermDefHint = document.getElementById('editTermDefHint');
    const editTermSynonyms = document.getElementById('editTermSynonyms');
    const editTermStatus = document.getElementById('editTermStatus');
    const editTermStatusError = document.getElementById('editTermStatusError');
    const btnCloseEditTermModal = document.getElementById('btnCloseEditTermModal');
    const btnCancelEditTermModal = document.getElementById('btnCancelEditTermModal');
    const btnSaveEditTerm = document.getElementById('btnSaveEditTerm');

    let editingTermId = null;
    let lastFocusedBeforeEdit = null;

    function openEditTermModal(term) {
        if (!modalEditTerm || !term || !canEditDictionary()) return;
        editingTermId = term.id;
        lastFocusedBeforeEdit = document.activeElement;

        if (editTermTitle) editTermTitle.value = term.title || '';
        if (editTermCategory) editTermCategory.value = term.category || '';
        if (editTermDef) editTermDef.value = term.def || '';
        if (editTermSynonyms) {
            editTermSynonyms.value = Array.isArray(term.synonyms) ? term.synonyms.join(', ') : (term.synonyms || '');
        }
        if (editTermStatus) {
            editTermStatus.value = term.status || (term.category ? 'published' : 'draft');
        }
        // Dica de tradução só quando a definição ainda está em inglês (1a leva).
        if (editTermDefHint) {
            const pendingEn = term.pending_translation === true ||
                (term.metadata && term.metadata.pending_translation === true) ||
                term.lang_definition === 'en';
            editTermDefHint.style.display = pendingEn ? 'block' : 'none';
        }
        if (editTermStatusError) editTermStatusError.style.display = 'none';

        modalEditTerm.classList.add('open');
        if (typeof lucide !== 'undefined') lucide.createIcons();
        if (editTermTitle) editTermTitle.focus();
    }

    function closeEditTermModal() {
        if (!modalEditTerm) return;
        modalEditTerm.classList.remove('open');
        editingTermId = null;
        if (lastFocusedBeforeEdit && typeof lastFocusedBeforeEdit.focus === 'function') {
            lastFocusedBeforeEdit.focus();
        }
    }

    if (btnCloseEditTermModal) btnCloseEditTermModal.addEventListener('click', closeEditTermModal);
    if (btnCancelEditTermModal) btnCancelEditTermModal.addEventListener('click', closeEditTermModal);
    if (modalEditTerm) {
        modalEditTerm.addEventListener('click', (e) => {
            if (e.target === modalEditTerm) closeEditTermModal();
        });
    }
    // ESC fecha o modal (acessibilidade de teclado).
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalEditTerm && modalEditTerm.classList.contains('open')) {
            closeEditTermModal();
        }
    });

    if (btnSaveEditTerm) {
        btnSaveEditTerm.addEventListener('click', () => {
            if (editingTermId === null) return;
            const idx = terms.findIndex(t => t.id === editingTermId);
            if (idx === -1) return;

            const title = (editTermTitle.value || '').trim();
            const category = editTermCategory.value; // '' = a classificar
            const def = (editTermDef.value || '').trim();
            const status = editTermStatus.value;
            const synonyms = (editTermSynonyms.value || '')
                .split(',').map(s => s.trim()).filter(Boolean);

            if (title === '' || def === '') {
                alert('Preencha o termo e a definição.');
                return;
            }
            // Regra de publicação: publicar exige categoria (espelha o backend).
            if (status === 'published' && !category) {
                if (editTermStatusError) editTermStatusError.style.display = 'block';
                if (editTermCategory) editTermCategory.focus();
                return;
            }

            const existing = terms[idx];
            terms[idx] = Object.assign({}, existing, {
                title: title,
                category: category,
                def: def,
                synonyms: synonyms,
                status: status,
                // completou a tradução: some com as pendências da 1a leva
                pending_translation: false,
                lang_definition: 'pt',
            });
            if (terms[idx].metadata) {
                terms[idx].metadata = Object.assign({}, terms[idx].metadata, {
                    pending_translation: false,
                    pending_category: !category,
                });
            }
            localStorage.setItem('stellantis_terms', JSON.stringify(terms));

            renderTerms();
            closeEditTermModal();
        });
    }

    // Inicializar renderização de termos
    renderTerms();


    // 4. PAINEL DE GESTÃO DE IDEIAS REMOVIDO



    // 5. CHAT IA SIMULADO (Avançado & Contextual Estilo ChatGPT)
    const chatMessagesScroll = document.getElementById('chatMessagesScroll');
    const chatInputGpt = document.getElementById('chatInputGpt');
    const btnSendGpt = document.getElementById('btnSendGpt');
    const chatEmptyState = document.getElementById('chatEmptyState');
    const btnNewChat = document.getElementById('btnNewChat');
    const suggestionCards = document.querySelectorAll('.suggestion-card');
    const historyItems = document.querySelectorAll('#recentChatHistory .history-item');
    const chatMainArea = document.getElementById('chatMainArea');
    const chatTraditionalView = document.getElementById('chatTraditionalView');
    const notebookLayout = document.getElementById('notebookLayout');
    const btnToggleChatSidebar = document.getElementById('btnToggleChatSidebar');
    const chatSidebar = document.querySelector('.chat-sidebar');
    
    // Elementos do Módulo Notebook
    const btnCreateNotebook = document.getElementById('btnCreateNotebook');
    const notebookHistoryList = document.getElementById('#notebookHistoryList') || document.getElementById('notebookHistoryList');
    const notebookNoteTitle = document.getElementById('notebookNoteTitle');
    const notebookNoteContent = document.getElementById('notebookNoteContent');
    const notebookStatusIndicator = document.getElementById('notebookStatusIndicator');
    const btnNotebookSave = document.getElementById('btnNotebookSave');
    
    const btnNotebookSummary = document.getElementById('btnNotebookSummary');
    const btnNotebookImprove = document.getElementById('btnNotebookImprove');
    const btnNotebookExtractAcronyms = document.getElementById('btnNotebookExtractAcronyms');
    
    const notebookChatBody = document.getElementById('notebookChatBody');
    const notebookChatEmptyState = document.getElementById('notebookChatEmptyState');
    const notebookChatMessages = document.getElementById('notebookChatMessages');
    const notebookChatInput = document.getElementById('notebookChatInput');
    const btnSendNotebookChat = document.getElementById('btnSendNotebookChat');

    // ==========================================
    // DATA MOCK & LOCAL STORAGE PARA NOTEBOOKS
    // ==========================================
    const defaultNotebooks = {
        "nb-1": {
            title: "Diretrizes Bio-Hybrid",
            content: "A plataforma Bio-Hybrid combina eletrificação avançada com motores flex a etanol de alta eficiência. O sistema é segmentado em três arquiteturas principais:\n1. Bio-Hybrid (MHEV 12V/48V): utiliza um dispositivo elétrico multifuncional que substitui o alternador e motor de partida tradicional, auxiliando nas acelerações e regenerando energia nas frenagens.\n2. Bio-Hybrid e-DCT (HEV): acopla um motor elétrico de tração diretamente ao câmbio e-DCT (transmissão de dupla embreagem eletrificada) permitindo rodagem em modo 100% elétrico em baixas velocidades.\n3. Bio-Hybrid Plug-in (PHEV): combina uma bateria de íons de lítio recarregável na tomada com motor elétrico traseiro e motor flex dianteiro T270 Turbo Flex, oferecendo tração integral eletrificada (e-AWD)."
        },
        "nb-2": {
            title: "Projeto Jeep Commander",
            content: "O Jeep Commander emprega a arquitetura eletrônica global Small Wide e incorpora sistemas avançados de assistência ao motorista (ADAS) nível 2. Principais componentes e fornecedores:\n- Radar frontal e câmera no para-brisa integrados fornecidos por fornecedores fictícios de exemplo (Alfa Eletrônica e Beta Sistemas Automotivos).\n- Controle de Cruzeiro Adaptativo (ACC) com função Stop & Go para tráfego pesado.\n- Frenagem Autônoma de Emergência (AEB) com detecção ativa de ciclistas e pedestres.\n- Assistente de Permanência e Centralização em Faixa (LKA/LFA) com correções de torque ativo na coluna de direção assistida eletricamente.\n- Central multimídia Uconnect de 10.1 polegadas baseada no sistema Android Automotive (IVI) com processador de um fornecedor fictício de exemplo (Gama Áudio)."
        },
        "nb-3": {
            title: "Diagnóstico ADAS Nível 2",
            content: "Procedimentos de calibração e teste dinâmico para ADAS Nível 2 no Jeep Commander:\n- Calibração estática do Radar Frontal (Beta Sistemas Automotivos (fictício) LRR4): exige posicionamento do espelho refletor metálico a exatamente 1.5 metros do centro do para-choque, alinhamento a laser no eixo geométrico de empuxo e temperatura controlada na oficina.\n- Calibração estática da Câmera Multifunção (Alfa Eletrônica (fictício) MFC): exige painel de alvos contrastantes (tabuleiro xadrez oficial Stellantis) iluminado homogeneamente a 2.1 metros do para-brisa.\n- Teste de validação dinâmico em pista de testes a velocidades acima de 40 km/h para detecção ativa de faixas de tráfego, leitura de placas e teste dinâmico de frenagem ativa."
        }
    };

    // Inicializar o banco de dados de notebooks no LocalStorage
    let activeNotebookId = null;
    let notebookSaveTimeout = null;

    function getNotebooks() {
        let stored = localStorage.getItem('stellantis_notebooks');
        if (!stored) {
            localStorage.setItem('stellantis_notebooks', JSON.stringify(defaultNotebooks));
            return defaultNotebooks;
        }
        return JSON.parse(stored);
    }

    function saveNotebooks(notebooks) {
        localStorage.setItem('stellantis_notebooks', JSON.stringify(notebooks));
    }

    // ==========================================
    // LÓGICA DO CHAT GEMINI TRADICIONAL
    // ==========================================
    function appendGptMessage(sender, text) {
        if (!chatMessagesScroll) return;

        // Ativar layout de mensagens ativas (move input para baixo)
        if (chatMainArea) chatMainArea.classList.add('has-messages');
        if (chatEmptyState) chatEmptyState.style.display = 'none';
        if (chatMessagesScroll) chatMessagesScroll.style.display = 'flex';

        const messageEl = document.createElement('div');
        messageEl.className = `message ${sender}`;
        
        const avatarHtml = sender === 'user' 
            ? '<div class="msg-avatar" style="background:#27272a;"><i data-lucide="user" style="color:#a1a1aa;"></i></div>' 
            : '<div class="msg-avatar" style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);"><i data-lucide="sparkles" style="color:#ffffff; fill:#ffffff;"></i></div>';

        messageEl.innerHTML = `
            ${avatarHtml}
            <div class="msg-content">
                <p>${text}</p>
            </div>
        `;

        chatMessagesScroll.appendChild(messageEl);
        chatMessagesScroll.scrollTop = chatMessagesScroll.scrollHeight;
        lucide.createIcons();
    }

    function processGptInput() {
        if (!chatInputGpt) return;
        const query = chatInputGpt.value.trim();
        if (query === '') return;

        appendGptMessage('user', query);
        chatInputGpt.value = '';

        // Simulação de resposta do Gemini
        setTimeout(() => {
            let responseText = "Desculpe, não entendi essa questão automotiva. Tente me perguntar sobre 'ADAS', 'Bio-Hybrid' ou 'motores Turbo Flex'.";
            const q = query.toLowerCase();

            if (q.includes('olá') || q.includes('oi')) {
                responseText = "Olá! Sou o assistente inteligente StellantisGPT. Como posso te auxiliar em seu trabalho de engenharia ou treinamento hoje?";
            } else if (q.includes('adas') || q.includes('automação')) {
                responseText = "Os sistemas **ADAS** (Advanced Driver Assistance Systems) no grupo Stellantis englobam assistentes avançados ativos como o ACC (Controle de Cruzeiro Adaptativo), AEB (Frenagem Autônoma de Emergência) e LKA (Assistente de Permanência em Faixa). No Jeep Commander, o sistema ADAS de nível 2 atua combinando radar e câmera para centralização de faixa e controle dinâmico longitudinal.";
            } else if (q.includes('bio-hybrid') || q.includes('hibrido') || q.includes('híbrido')) {
                responseText = "A arquitetura **Bio-Hybrid** da Stellantis engloba a eletrificação inteligente de motores flex a etanol. Ela se divide em:\n\n*   **Bio-Hybrid (MHEV)**: Sistema híbrido leve com bateria de 12V/48V.\n*   **Bio-Hybrid e-DCT (HEV)**: Híbrido convencional com motor elétrico acoplado no câmbio de dupla embreagem.\n*   **Bio-Hybrid Plug-in (PHEV)**: Híbrido plug-in recarregável com tração e-AWD e motor T270 Turbo Flex.";
            } else if (q.includes('t270') || q.includes('motor turbo') || q.includes('hurricane')) {
                responseText = "O motor **T270 Turbo Flex** (1.3L GSE) produz 185 cv com etanol e possui tecnologia de comando de válvulas **MultiAir III** para maior eficiência na admissão. Já o motor **Hurricane 4** é um 2.0L Turbo a gasolina de 272 cv que equipa veículos de alta performance como a Ram Rampage e o Jeep Wrangler.";
            } else if (q.includes('plataforma') || q.includes('stla')) {
                responseText = "A Stellantis adota quatro plataformas globais modulares para eletrificação:\n\n1.  **STLA Small**: Para veículos urbanos e compactos.\n2.  **STLA Medium**: Otimizada para veículos de médio porte (como o novo Compass elétrico).\n3.  **STLA Large**: Para utilitários e carros de performance premium.\n4.  **STLA Frame**: Arquitetura de chassis de travessa para pickups pesadas e SUVs grandes (ex: Ram 1500).";
            } else if (q.includes('dicionário') || q.includes('criar') || q.includes('flashcard')) {
                responseText = "Você pode usar o **Dicionário** no menu principal para pesquisar termos. Nos detalhes de qualquer termo, existe a opção 'Criar Flashcard' que te redireciona automaticamente para o modal de criação de flashcards na aba de Treinamento com os dados preenchidos!";
            } else if (q.includes('especialista') || q.includes('contatar')) {
                responseText = "Na aba de **Informações**, em 'Especialistas', você pode ver os líderes de cada área da Stellantis (como Motor, Transmissão, Conectividade, ADAS) e clicar em 'Contatar Especialista' para iniciar dúvidas contextuais.";
            }

            appendGptMessage('system', responseText);
        }, 850);
    }

    if (btnSendGpt) {
        btnSendGpt.addEventListener('click', processGptInput);
    }
    if (chatInputGpt) {
        chatInputGpt.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                processGptInput();
            }
        });
    }

    // Botão de Novo Chat (Gemini Style)
    if (btnNewChat) {
        btnNewChat.addEventListener('click', () => {
            // Sair do modo Notebook
            if (notebookLayout) notebookLayout.style.display = 'none';
            if (chatTraditionalView) chatTraditionalView.style.display = 'flex';
            
            // Limpar estados ativos
            const allItems = document.querySelectorAll('.chat-sidebar .history-item');
            allItems.forEach(item => item.classList.remove('active'));
            
            // Voltar input para o centro
            if (chatMainArea) chatMainArea.classList.remove('has-messages');
            if (chatMessagesScroll) {
                chatMessagesScroll.innerHTML = '';
                chatMessagesScroll.style.display = 'none';
            }
            if (chatEmptyState) {
                chatEmptyState.style.display = 'flex';
            }
            activeNotebookId = null;
        });
    }

    // Ações dos cartões de sugestão
    suggestionCards.forEach(card => {
        card.addEventListener('click', () => {
            const prompt = card.getAttribute('data-prompt');
            if (chatInputGpt) {
                chatInputGpt.value = prompt;
                processGptInput();
            }
        });
    });

    // Simulação do histórico lateral
    historyItems.forEach(item => {
        item.addEventListener('click', () => {
            // Garantir que estamos no chat tradicional
            if (notebookLayout) notebookLayout.style.display = 'none';
            if (chatTraditionalView) chatTraditionalView.style.display = 'flex';
            
            const allItems = document.querySelectorAll('.chat-sidebar .history-item');
            allItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            const title = item.querySelector('span') ? item.querySelector('span').textContent.trim() : item.textContent.trim();
            
            // Limpar mensagens atuais e simular carregamento
            if (chatMessagesScroll) chatMessagesScroll.innerHTML = '';
            
            appendGptMessage('user', `Carregar histórico da conversa: ${title}`);
            setTimeout(() => {
                let loadResponse = `Carregando discussões anteriores do StellantisGPT sobre **${title}**...`;
                if (title.includes('ADAS')) {
                    loadResponse += "\n\nAs diretrizes de segurança do sistema ADAS Stellantis exigem auditorias de software Tier-1 da Alfa Eletrônica (fictício) trimestralmente.";
                } else if (title.includes('Motores') || title.includes('Turbo')) {
                    loadResponse += "\n\nO cabeçote MultiAir III regula a abertura das válvulas de admissão de forma eletro-hidráulica em tempo real, maximizando o rendimento do motor T270 Turbo Flex.";
                } else {
                    loadResponse += "\n\nDiscussões focadas nos padrões estruturais e flexibilidade da plataforma STLA no polo de Betim.";
                }
                appendGptMessage('system', loadResponse);
            }, 400);
        });
    });

    // Botão recolher/expandir sidebar do Chat
    if (btnToggleChatSidebar && chatSidebar) {
        btnToggleChatSidebar.addEventListener('click', () => {
            chatSidebar.classList.toggle('collapsed');
            if (chatSidebar.classList.contains('collapsed')) {
                chatSidebar.style.width = '64px';
                // Ocultar spans de texto e marcas de cabeçalho
                document.querySelectorAll('.chat-sidebar span').forEach(el => el.style.display = 'none');
                document.querySelectorAll('.chat-sidebar .section-label').forEach(el => el.style.display = 'none');
                if (btnCreateNotebook) btnCreateNotebook.style.display = 'none';
            } else {
                chatSidebar.style.width = '260px';
                document.querySelectorAll('.chat-sidebar span').forEach(el => el.style.display = 'inline');
                document.querySelectorAll('.chat-sidebar .section-label').forEach(el => el.style.display = 'inline');
                if (btnCreateNotebook) btnCreateNotebook.style.display = 'flex';
            }
        });
    }

    // ==========================================
    // 📓 WORKSPACE DO NOTEBOOK INTERATIVO
    // ==========================================
    
    // Atualizar a lista de notebooks na barra lateral
    function renderNotebookSidebar() {
        const notebooks = getNotebooks();
        if (!notebookHistoryList) return;
        
        notebookHistoryList.innerHTML = '';
        
        Object.keys(notebooks).forEach(id => {
            const note = notebooks[id];
            const li = document.createElement('li');
            li.className = 'history-item notebook-item';
            if (activeNotebookId === id) li.classList.add('active');
            li.setAttribute('data-notebook-id', id);
            
            li.innerHTML = `
                <i data-lucide="file-text"></i>
                <span>📝 ${note.title || 'Sem título'}</span>
            `;
            
            li.addEventListener('click', () => {
                selectNotebook(id);
            });
            
            notebookHistoryList.appendChild(li);
        });
        lucide.createIcons();
    }

    // Selecionar e carregar uma anotação no Notebook
    function selectNotebook(id) {
        const notebooks = getNotebooks();
        const note = notebooks[id];
        if (!note) return;
        
        activeNotebookId = id;
        
        // Ativar classe ativa na sidebar
        document.querySelectorAll('.chat-sidebar .history-item').forEach(i => i.classList.remove('active'));
        const activeLi = document.querySelector(`.notebook-item[data-notebook-id="${id}"]`);
        if (activeLi) activeLi.classList.add('active');
        
        // Alternar visualizações da Main Area
        if (chatTraditionalView) chatTraditionalView.style.display = 'none';
        if (notebookLayout) notebookLayout.style.display = 'grid';
        
        // Carregar dados no editor
        if (notebookNoteTitle) notebookNoteTitle.value = note.title;
        if (notebookNoteContent) notebookNoteContent.value = note.content;
        
        // Resetar Chat do Notebook
        if (notebookChatEmptyState) notebookChatEmptyState.style.display = 'flex';
        if (notebookChatMessages) {
            notebookChatMessages.innerHTML = '';
            notebookChatMessages.style.display = 'none';
        }
        
        if (notebookStatusIndicator) {
            notebookStatusIndicator.innerHTML = '<i data-lucide="check-circle-2" style="color:#22c55e;"></i> Salvo localmente';
        }
        lucide.createIcons();
    }

    // Criar uma nova anotação / Notebook
    if (btnCreateNotebook) {
        btnCreateNotebook.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita clicks no pai
            
            const notebooks = getNotebooks();
            const newId = 'nb-' + Date.now();
            
            notebooks[newId] = {
                title: "Nova Anotação",
                content: "Escreva suas anotações técnicas aqui..."
            };
            
            saveNotebooks(notebooks);
            renderNotebookSidebar();
            selectNotebook(newId);
            
            // Focar no título para digitação
            if (notebookNoteTitle) {
                notebookNoteTitle.focus();
                notebookNoteTitle.select();
            }
        });
    }

    // Salvamento automático com Debounce ao digitar no editor do Notebook
    function triggerAutoSave() {
        if (!activeNotebookId) return;
        
        if (notebookStatusIndicator) {
            notebookStatusIndicator.innerHTML = '<i class="ai-pulse-icon" style="color:var(--text-dark); margin-right:4px;">⏳</i> Salvando anotação...';
        }
        
        clearTimeout(notebookSaveTimeout);
        notebookSaveTimeout = setTimeout(() => {
            const notebooks = getNotebooks();
            if (notebooks[activeNotebookId]) {
                notebooks[activeNotebookId].title = notebookNoteTitle.value || "Sem título";
                notebooks[activeNotebookId].content = notebookNoteContent.value;
                saveNotebooks(notebooks);
                
                // Atualizar título na barra lateral sem recarregar tudo
                const liSpan = document.querySelector(`.notebook-item[data-notebook-id="${activeNotebookId}"] span`);
                if (liSpan) liSpan.textContent = `📝 ${notebookNoteTitle.value || "Sem título"}`;
                
                if (notebookStatusIndicator) {
                    notebookStatusIndicator.innerHTML = '<i data-lucide="check-circle-2" style="color:#22c55e;"></i> Salvo automaticamente';
                    lucide.createIcons();
                }
            }
        }, 1200);
    }

    if (notebookNoteTitle) notebookNoteTitle.addEventListener('input', triggerAutoSave);
    if (notebookNoteContent) notebookNoteContent.addEventListener('input', triggerAutoSave);

    // Botão Salvar manual
    if (btnNotebookSave) {
        btnNotebookSave.addEventListener('click', () => {
            if (!activeNotebookId) return;
            const notebooks = getNotebooks();
            if (notebooks[activeNotebookId]) {
                notebooks[activeNotebookId].title = notebookNoteTitle.value || "Sem título";
                notebooks[activeNotebookId].content = notebookNoteContent.value;
                saveNotebooks(notebooks);
                renderNotebookSidebar();
                
                // Feedback visual de sucesso no botão
                const originalText = btnNotebookSave.innerHTML;
                btnNotebookSave.innerHTML = '<i data-lucide="check"></i> Salvo!';
                btnNotebookSave.style.background = '#22c55e';
                btnNotebookSave.style.color = '#ffffff';
                lucide.createIcons();
                
                setTimeout(() => {
                    btnNotebookSave.innerHTML = originalText;
                    btnNotebookSave.style.background = '';
                    btnNotebookSave.style.color = '';
                    lucide.createIcons();
                }, 1500);
            }
        });
    }

    // Lógica do Chat do Notebook (Direita)
    function appendNotebookChatMessage(sender, text) {
        if (!notebookChatMessages) return;
        
        if (notebookChatEmptyState) notebookChatEmptyState.style.display = 'none';
        notebookChatMessages.style.display = 'flex';
        
        const msgEl = document.createElement('div');
        msgEl.className = `notebook-msg ${sender}`;
        msgEl.style.padding = '10px 12px';
        msgEl.style.borderRadius = '10px';
        msgEl.style.marginBottom = '10px';
        msgEl.style.fontSize = '12px';
        msgEl.style.lineHeight = '1.5';
        
        if (sender === 'user') {
            msgEl.style.background = 'rgba(255, 255, 255, 0.05)';
            msgEl.style.color = 'var(--text-main)';
            msgEl.style.alignSelf = 'flex-end';
            msgEl.style.marginLeft = '20px';
            msgEl.innerHTML = `<strong>Você:</strong><br>${text}`;
        } else {
            msgEl.style.background = 'rgba(6, 182, 212, 0.06)';
            msgEl.style.border = '1px solid rgba(6, 182, 212, 0.15)';
            msgEl.style.color = 'var(--text-main)';
            msgEl.style.alignSelf = 'flex-start';
            msgEl.style.marginRight = '20px';
            msgEl.innerHTML = `<strong>Assistente de Notas:</strong><br>${text}`;
        }
        
        notebookChatMessages.appendChild(msgEl);
        notebookChatBody.scrollTop = notebookChatBody.scrollHeight;
    }

    function processNotebookChat() {
        if (!notebookChatInput) return;
        const query = notebookChatInput.value.trim();
        if (query === '') return;
        
        const noteContent = notebookNoteContent ? notebookNoteContent.value.trim() : "";
        
        appendNotebookChatMessage('user', query);
        notebookChatInput.value = '';
        
        setTimeout(() => {
            let reply = "Como assistente do seu Notebook, analisei o texto ao lado, mas não encontrei menção específica a essa pergunta. Você pode adicionar mais detalhes na nota para eu te responder melhor!";
            const q = query.toLowerCase();
            
            if (noteContent === "") {
                reply = "Suas anotações no editor à esquerda estão vazias! Escreva algo sobre motores, transmissões ou projetos Stellantis e eu poderei te ajudar com análises e resumos.";
            } else {
                // Análise contextual baseada em palavras-chave da nota
                if (q.includes('resum') || q.includes('tópicos') || q.includes('resumo')) {
                    reply = `Aqui está uma síntese dos pontos-chave presentes na sua nota:\n\n1. **Foco Principal**: ${notebookNoteTitle.value}\n2. **Tamanho das Notas**: Contém ${noteContent.split(' ').length} palavras.\n3. **Conteúdo**: Analisando os conceitos, o texto descreve componentes técnicos, processos e parâmetros operacionais.`;
                } else if (q.includes('componente') || q.includes('peça') || q.includes('tecnologia')) {
                    if (noteContent.toLowerCase().includes('adas') || noteContent.toLowerCase().includes('commander')) {
                        reply = "Com base nas suas anotações, as principais tecnologias e componentes citados para o Jeep Commander são: câmera de para-brisa, radar frontal da Beta Sistemas Automotivos (fictício)/Alfa Eletrônica (fictício), ACC (Controle de Cruzeiro Adaptativo), AEB (Frenagem Autônoma de Emergência) e central Uconnect de 10.1\".";
                    } else if (noteContent.toLowerCase().includes('hybrid')) {
                        reply = "Com base nas suas anotações, a plataforma Bio-Hybrid descreve três tecnologias principais: MHEV (Híbrido leve com gerador elétrico e baterias de 12V/48V), HEV (Híbrido convencional com motor no câmbio e-DCT) e PHEV (Híbrido plug-in recarregável com motor flex T270 dianteiro e motor elétrico traseiro).";
                    } else {
                        reply = "Encontrei menções a componentes de engenharia automotiva na sua nota. O texto detalha a integração física e eletrônica de módulos de controle da Stellantis.";
                    }
                } else if (q.includes('calibração') || q.includes('procedimento') || q.includes('teste')) {
                    if (noteContent.toLowerCase().includes('calibração') || noteContent.toLowerCase().includes('radar')) {
                        reply = "De acordo com suas notas de calibração, o Radar Frontal (Beta Sistemas Automotivos (fictício) LRR4) requer um espelho refletor posicionado a 1.5 metros do centro e alinhamento geométrico. Já a câmera (Alfa Eletrônica (fictício) MFC) requer um tabuleiro xadrez a 2.1 metros do para-brisa.";
                    } else {
                        reply = "As calibrações e testes descritos no seu texto exigem padrões rígidos de controle, ferramentas especializadas Stellantis e condições controladas de oficina ou pista.";
                    }
                } else {
                    // Resposta inteligente genérica contextual
                    reply = `Com base nas informações da sua nota de **"${notebookNoteTitle.value}"**, pude extrair que o foco principal é a engenharia automotiva e validação de sistemas Stellantis. Você gostaria de expandir algum detalhe específico das notas, como fornecedores ou parâmetros operacionais?`;
                }
            }
            
            // Formatando quebras de linha para HTML
            reply = reply.replace(/\n/g, '<br>');
            appendNotebookChatMessage('system', reply);
        }, 800);
    }

    if (btnSendNotebookChat) btnSendNotebookChat.addEventListener('click', processNotebookChat);
    if (notebookChatInput) {
        notebookChatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                processNotebookChat();
            }
        });
    }

    // Botões assistidos por IA do Notebook (Esquerda)
    
    // 1. Resumir nota
    if (btnNotebookSummary) {
        btnNotebookSummary.addEventListener('click', () => {
            const content = notebookNoteContent ? notebookNoteContent.value.trim() : "";
            if (content === "") {
                alert("O conteúdo da nota está vazio para ser resumido!");
                return;
            }
            
            // Simular efeito de processamento
            appendNotebookChatMessage('user', "Por favor, gere um resumo executivo desta anotação.");
            
            setTimeout(() => {
                let summary = `### Resumo da Nota: **${notebookNoteTitle.value}**\n\n- **Objetivo**: Documentação técnica e de conformidade de engenharia Stellantis.\n- **Pontos Relevantes**:\n  - Detalhamento de arquitetura física e eletrônica do sistema.\n  - Definição clara dos componentes principais e parametrização.\n  - Indicações de fornecedores Tier-1 e protocolos de validação.\n\n- **Status**: Pronto para revisão de engenharia.`;
                summary = summary.replace(/\n/g, '<br>');
                appendNotebookChatMessage('system', summary);
            }, 600);
        });
    }

    // 2. Melhorar texto
    if (btnNotebookImprove) {
        btnNotebookImprove.addEventListener('click', () => {
            const content = notebookNoteContent ? notebookNoteContent.value.trim() : "";
            if (content === "") {
                alert("O conteúdo da nota está vazio para ser aprimorado!");
                return;
            }
            
            appendNotebookChatMessage('user', "Refine a linguagem deste texto para um padrão técnico e corporativo formal.");
            
            setTimeout(() => {
                let improvement = `Aqui está uma versão refinada e profissional para as suas anotações:\n\n*\"O presente documento estabelece as especificações de arquitetura e parâmetros operacionais do sistema ${notebookNoteTitle.value}. A integração dos componentes de controle atende aos requisitos globais de qualidade e durabilidade Stellantis, assegurando a conformidade das interfaces elétricas e protocolos de comunicação Tier-1. As calibrações descritas devem ser executadas em ambiente técnico controlado, seguindo as diretrizes oficiais de validação.\"*`;
                improvement = improvement.replace(/\n/g, '<br>');
                appendNotebookChatMessage('system', improvement);
            }, 700);
        });
    }

    // 3. Extrair Siglas
    if (btnNotebookExtractAcronyms) {
        btnNotebookExtractAcronyms.addEventListener('click', () => {
            const content = notebookNoteContent ? notebookNoteContent.value.trim() : "";
            if (content === "") {
                alert("Escreva alguma nota antes de extrair as siglas!");
                return;
            }
            
            appendNotebookChatMessage('user', "Encontre e explique as siglas técnicas Stellantis neste texto.");
            
            setTimeout(() => {
                let acronymsText = "Identifiquei as seguintes siglas no seu texto e as associei com a base de dados do dicionário Stellantis:<br><br>";
                
                const found = [];
                if (content.toLowerCase().includes('adas')) found.push("🚗 **ADAS**: Advanced Driver Assistance Systems (Sistemas Avançados de Assistência ao Condutor).");
                if (content.toLowerCase().includes('acc')) found.push("⏱️ **ACC**: Adaptive Cruise Control (Controle de Cruzeiro Adaptativo).");
                if (content.toLowerCase().includes('mhev')) found.push("⚡ **MHEV**: Mild Hybrid Electric Vehicle (Veículo Híbrido Leve).");
                if (content.toLowerCase().includes('hev')) found.push("🔋 **HEV**: Hybrid Electric Vehicle (Veículo Híbrido Convencional).");
                if (content.toLowerCase().includes('phev')) found.push("🔌 **PHEV**: Plug-in Hybrid Electric Vehicle (Híbrido Plug-in).");
                if (content.toLowerCase().includes('e-dct')) found.push("⚙️ **e-DCT**: electrified Dual Clutch Transmission (Transmissão de dupla embreagem eletrificada).");
                if (content.toLowerCase().includes('ivi') || content.toLowerCase().includes('uconnect')) found.push("📱 **IVI**: In-Vehicle Infotainment (Infotretenimento de Bordo).");
                if (content.toLowerCase().includes('t270')) found.push("🔥 **T270**: Motor Stellantis 1.3L Turbo Flex de 185 cv.");
                
                if (found.length === 0) {
                    acronymsText += "Nenhuma sigla técnica Stellantis cadastrada foi identificada no texto atual. Tente inserir termos como ADAS, ACC, MHEV ou e-DCT.";
                } else {
                    acronymsText += found.join('<br>');
                }
                
                appendNotebookChatMessage('system', acronymsText);
            }, 600);
        });
    }

    // Inicializar os Notebooks na carga da página
    renderNotebookSidebar();



    // ========================================================
    // 6. LÓGICA DO CENTRO DE TREINAMENTO (SUBABAS, FLASHCARDS, LEITOR)
    // ========================================================
    const subNavBtns = document.querySelectorAll('.sub-nav-btn');
    const trainingSubSections = document.querySelectorAll('.training-sub-section');
    const flashcards = document.querySelectorAll('.flashcard');
    const btnStartCourses = document.querySelectorAll('.btn-start-course');
    const readerEmptyState = document.getElementById('readerEmptyState');
    const readerContentArea = document.getElementById('readerContentArea');
    const courseCards = document.querySelectorAll('.course-card');

    // Troca de Subabas (Cards vs Conteúdo)
    if (subNavBtns) {
        subNavBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                subNavBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const target = btn.getAttribute('data-subtarget');
                trainingSubSections.forEach(sec => {
                    sec.classList.remove('active');
                    if (sec.id === `sub-sec-${target}`) {
                        sec.classList.add('active');
                    }
                });
            });
        });
    }

    // LÓGICA DE FLASHCARDS PERSONALIZADOS (LOCALSTORAGE & ROTAÇÃO 3D)
    let customCards = JSON.parse(localStorage.getItem('stellantis_custom_flashcards')) || [];
    const flashcardsGrid = document.querySelector('.flashcards-grid');

    function renderCustomFlashcards() {
        if (!flashcardsGrid) return;
        
        // Limpar cartões personalizados anteriores
        const previouslyAdded = flashcardsGrid.querySelectorAll('.custom-flashcard-container');
        previouslyAdded.forEach(el => el.remove());

        // Injetar novos cartões
        customCards.forEach(cardData => {
            const cardWrapper = document.createElement('div');
            cardWrapper.className = 'flashcard-container custom-flashcard-container';
            cardWrapper.innerHTML = `
                <div class="flashcard">
                    <div class="flashcard-front">
                        <div class="card-logo-watermark">${cardData.watermark}</div>
                        <h4>${cardData.title}</h4>
                        <p>${cardData.question}</p>
                        <span class="click-hint"><i data-lucide="help-circle"></i> Revelar Resposta</span>
                    </div>
                    <div class="flashcard-back">
                        <h4>Resposta Técnica</h4>
                        <p>${cardData.answer}</p>
                        <span class="click-hint-back"><i data-lucide="rotate-ccw"></i> Voltar</span>
                    </div>
                </div>
            `;
            flashcardsGrid.appendChild(cardWrapper);
        });

        // Atualizar ícones do Lucide
        lucide.createIcons();
    }

    // Delegação de eventos para virar qualquer flashcard (estático ou dinâmico)
    if (flashcardsGrid) {
        flashcardsGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.flashcard');
            if (card) {
                card.classList.toggle('flipped');
            }
        });
    }

    // Renderizar flashcards salvos ao inicializar
    renderCustomFlashcards();

    // INTERATIVIDADE DO MODAL DE NOVO FLASHCARD
    const modalAddCard = document.getElementById('modalAddCard');
    const btnOpenAddCardModal = document.getElementById('btnOpenAddCardModal');
    const btnCloseAddCardModal = document.getElementById('btnCloseAddCardModal');
    const btnCancelAddCardModal = document.getElementById('btnCancelAddCardModal');
    const btnSaveNewCard = document.getElementById('btnSaveNewCard');
    const formAddCard = document.getElementById('formAddCard');

    if (btnOpenAddCardModal && modalAddCard) {
        btnOpenAddCardModal.addEventListener('click', () => {
            modalAddCard.classList.add('open');
        });
    }

    const fcSearchDictionary = document.getElementById('fcSearchDictionary');
    const fcSearchSuggestions = document.getElementById('fcSearchSuggestions');

    function closeAddCardModal() {
        if (modalAddCard) {
            modalAddCard.classList.remove('open');
            if (formAddCard) formAddCard.reset();
            if (fcSearchDictionary) fcSearchDictionary.value = '';
            if (fcSearchSuggestions) {
                fcSearchSuggestions.innerHTML = '';
                fcSearchSuggestions.style.display = 'none';
            }
        }
    }

    if (fcSearchDictionary && fcSearchSuggestions) {
        fcSearchDictionary.addEventListener('input', () => {
            const query = fcSearchDictionary.value.trim().toLowerCase();
            fcSearchSuggestions.innerHTML = '';
            
            if (query.length < 2) {
                fcSearchSuggestions.style.display = 'none';
                return;
            }

            const matched = terms.filter(t => 
                t.title.toLowerCase().includes(query) || 
                t.def.toLowerCase().includes(query)
            );

            if (matched.length === 0) {
                fcSearchSuggestions.innerHTML = '<div style="padding: 10px 14px; font-size: 13px; color: var(--text-dark); text-align: center;">Nenhum termo correspondente</div>';
                fcSearchSuggestions.style.display = 'block';
                return;
            }

            matched.forEach(t => {
                const item = document.createElement('div');
                item.style.cssText = 'padding: 10px 14px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; color: var(--text-muted); transition: all 0.2s ease; display: flex; justify-content: space-between; align-items: center;';
                item.innerHTML = `<strong>${t.title}</strong> <span style="font-size: 10px; background: rgba(6,182,212,0.15); color: var(--secondary); padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">${t.category}</span>`;
                
                item.addEventListener('mouseenter', () => {
                    item.style.background = 'rgba(59, 130, 246, 0.15)';
                    item.style.color = 'var(--text-main)';
                });
                item.addEventListener('mouseleave', () => {
                    item.style.background = 'transparent';
                    item.style.color = 'var(--text-muted)';
                });

                item.addEventListener('click', () => {
                    // Preencher o formulário do flashcard
                    const watermarkInput = document.getElementById('cardWatermark');
                    const titleInput = document.getElementById('cardTitle');
                    const questionInput = document.getElementById('cardQuestion');
                    const answerInput = document.getElementById('cardAnswer');

                    if (watermarkInput) watermarkInput.value = t.title.charAt(0).toUpperCase();
                    if (titleInput) titleInput.value = t.title;
                    if (questionInput) questionInput.value = `O que é ${t.title}?`;
                    if (answerInput) answerInput.value = t.def;

                    // Limpar e fechar
                    fcSearchDictionary.value = '';
                    fcSearchSuggestions.innerHTML = '';
                    fcSearchSuggestions.style.display = 'none';

                    // Feedback visual sutil
                    [watermarkInput, titleInput, questionInput, answerInput].forEach(inp => {
                        if (inp) {
                            inp.style.borderColor = 'var(--secondary)';
                            setTimeout(() => {
                                inp.style.borderColor = 'var(--glass-border)';
                            }, 800);
                        }
                    });
                });

                fcSearchSuggestions.appendChild(item);
            });

            fcSearchSuggestions.style.display = 'block';
        });

        document.addEventListener('click', (e) => {
            if (e.target !== fcSearchDictionary && e.target !== fcSearchSuggestions && !fcSearchSuggestions.contains(e.target)) {
                fcSearchSuggestions.innerHTML = '';
                fcSearchSuggestions.style.display = 'none';
            }
        });
    }

    if (btnCloseAddCardModal) {
        btnCloseAddCardModal.addEventListener('click', closeAddCardModal);
    }
    if (btnCancelAddCardModal) {
        btnCancelAddCardModal.addEventListener('click', closeAddCardModal);
    }
    if (modalAddCard) {
        modalAddCard.addEventListener('click', (e) => {
            if (e.target === modalAddCard) {
                closeAddCardModal();
            }
        });
    }

    if (btnSaveNewCard) {
        btnSaveNewCard.addEventListener('click', () => {
            const watermarkInput = document.getElementById('cardWatermark');
            const titleInput = document.getElementById('cardTitle');
            const questionInput = document.getElementById('cardQuestion');
            const answerInput = document.getElementById('cardAnswer');

            if (!watermarkInput || !titleInput || !questionInput || !answerInput) return;

            const watermark = watermarkInput.value.trim().toUpperCase().substring(0, 1);
            const title = titleInput.value.trim();
            const question = questionInput.value.trim();
            const answer = answerInput.value.trim();

            if (watermark === '' || title === '' || question === '' || answer === '') {
                alert('Por favor, preencha todos os campos do flashcard.');
                return;
            }

            const newCard = {
                watermark: watermark,
                title: title,
                question: question,
                answer: answer,
                date: new Date().toLocaleString('pt-BR'),
                timestamp: Date.now()
            };

            // Salvar no array e persistir no LocalStorage
            customCards.push(newCard);
            localStorage.setItem('stellantis_custom_flashcards', JSON.stringify(customCards));

            // Re-renderizar e fechar modal
            renderCustomFlashcards();
            closeAddCardModal();
        });
    }

    // Banco de Dados de Cursos
    const coursesContent = {
        biohybrid: {
            title: "Eletrificação Bio-Hybrid Flex",
            level: "Iniciante",
            duration: "15 min",
            body: `
                <p>A tecnologia <strong>Bio-Hybrid</strong> é a resposta estratégica da Stellantis para a descarbonização inteligente nos mercados emergentes, como a América Latina. Em vez de focar exclusivamente em elétricos a bateria (BEVs) de custo elevado, o sistema combina a alta eficiência dos <strong>biocombustíveis (etanol)</strong> com diferentes níveis de assistência elétrica.</p>
                
                <h5>Arquitetura MHEV (Híbrido Leve de 48V):</h5>
                <p>Nesse sistema, o alternador e motor de partida tradicionais são substituídos por um motor elétrico multifuncional de <strong>3 kW (aprox. 4 cv)</strong> alimentado por uma bateria de íons de lítio de 48V. Esse motor elétrico auxilia o motor térmico nas arrancadas e retomadas, momento em que o consumo de combustível é maior.</p>
                
                <h5>Regeneração de Energia:</h5>
                <p>Durante as desacelerações e frenagens, o motor elétrico atua como gerador, convertendo a energia cinética que seria desperdiçada em calor nos freios em eletricidade para recarregar a bateria auxiliar.</p>
                
                <div class="reader-note">
                    <strong>Nota do Engenheiro:</strong> O sistema reduz em até 15% a emissão de CO2 quando abastecido com etanol, oferecendo a menor pegada de carbono do ciclo "poço ao roda" disponível no mercado.
                </div>
            `
        },
        adas: {
            title: "Arquitetura de Sensores ADAS",
            level: "Intermediário",
            duration: "30 min",
            body: `
                <p>O <strong>ADAS (Advanced Driver Assistance Systems)</strong> de nível 2 da Stellantis requer uma leitura tridimensional e precisa do ambiente externo do veículo. Para isso, os modelos da marca empregam uma fusão de dados baseada em múltiplos tipos de sensores.</p>
                
                <h5>Radar de Ondas Milimétricas (Frontal):</h5>
                <p>Instalado na grade frontal inferior, emite ondas de rádio milimétricas para medir com precisão milimétrica a distância e a velocidade relativa do veículo à frente. Ele é insensível às condições de iluminação, chuva ou neblina.</p>
                
                <h5>Câmera Estereoscópica de Alta Definição:</h5>
                <p>Montada na parte interna superior do para-brisa. Ela identifica marcações de faixas de rodagem na pista, pedestres, ciclistas e placas de trânsito. A fusão do radar com a câmera garante a redundância necessária para a segurança ativa.</p>
                
                <h5>Sensores Ultrassônicos e Câmeras 360°:</h5>
                <p>Usados para manobras de baixa velocidade, detecção de tráfego cruzado traseiro e monitoramento de ponto cego nos retrovisores.</p>
                
                <div class="reader-note">
                    <strong>Nota do Engenheiro:</strong> Se a câmera do para-brisa detectar obstrução por sujeira ou chuva intensa, o sistema alerta o motorista e desativa temporariamente os recursos que necessitam de leitura visual das faixas.
                </div>
            `
        },
        motores: {
            title: "Mapeamento Térmico & MultiAir III",
            level: "Avançado",
            duration: "45 min",
            body: `
                <p>O motor Stellantis <strong>T270 (1.3 Turbo Flex)</strong> destaca-se pela adoção do cabeçote com controle eletro-hidráulico de válvulas <strong>MultiAir III</strong>, patente exclusiva do grupo.</p>
                
                <h5>Controle Dinâmico de Admissão:</h5>
                <p>Diferente de um comando de válvulas mecânico rígido, o MultiAir utiliza uma câmara hidráulica entre o came de comando e a válvula de admissão. Uma válvula solenoide solta ou prende o óleo na câmara, permitindo alterar a abertura e o fechamento das válvulas de admissão em tempo real.</p>
                
                <h5>Estratégias de Carga Parcial (Ciclo Miller):</h5>
                <p>Em cargas baixas, o MultiAir fecha as válvulas de admissão antes do tempo (antecipado), forçando uma expansão que resfria a câmara e diminui perdas de bombeamento, otimizando o consumo. Em plena carga, adota abertura máxima para rendimento volumétrico total.</p>
                
                <h5>Turbocompressor Otimizado:</h5>
                <p>Emprega turbina do tipo mono-scroll de baixo volume interno. A wastegate (válvula de alívio) tem controle elétrico ultra-rápido, minimizando o lag do turbo e mantendo a pressão de sobrealimentação ideal em qualquer regime.</p>
                
                <div class="reader-note">
                    <strong>Nota do Engenheiro:</strong> O controle MultiAir III opera de forma assíncrona para cada cilindro, permitindo estratégias refinadas de aquecimento rápido do catalisador após a partida a frio.
                </div>
            `
        }
    };

    // Acessar Conteúdo do Curso
    if (btnStartCourses) {
        btnStartCourses.forEach(btn => {
            btn.addEventListener('click', () => {
                const courseKey = btn.getAttribute('data-course');
                const data = coursesContent[courseKey];
                
                if (data && readerContentArea && readerEmptyState) {
                    // Marcar card como ativo
                    courseCards.forEach(c => c.classList.remove('active'));
                    const card = document.querySelector(`.course-card[data-course="${courseKey}"]`);
                    if (card) card.classList.add('active');

                    // Preencher leitor
                    readerContentArea.innerHTML = `
                        <div class="reader-header">
                            <h3>${data.title}</h3>
                            <div class="reader-meta">
                                <span class="course-badge ${data.level.toLowerCase()}">${data.level}</span>
                                <span><i data-lucide="clock" style="width: 12px; height: 12px; display: inline-block; vertical-align: middle;"></i> Duração: ${data.duration}</span>
                            </div>
                        </div>
                        <div class="reader-body">
                            ${data.body}
                            <button class="btn-primary" style="margin-top: 10px; width: fit-content;" id="btnCompleteModule" data-course="${courseKey}">
                                <i data-lucide="check-circle"></i> Concluir Módulo de Treinamento
                            </button>
                        </div>
                    `;

                    // Mostrar leitor e ocultar estado vazio
                    readerEmptyState.style.display = 'none';
                    readerContentArea.style.display = 'flex';
                    
                    lucide.createIcons();

                    // Lógica de conclusão do módulo
                    const btnComplete = document.getElementById('btnCompleteModule');
                    if (btnComplete) {
                        btnComplete.addEventListener('click', () => {
                            // Simular atualização de progresso
                            if (card) {
                                const progressFill = card.querySelector('.progress-bar-fill');
                                const progressText = card.querySelector('.progress-text');
                                if (progressFill && progressText) {
                                    progressFill.style.width = '100%';
                                    progressText.textContent = '100% Concluído';
                                    progressText.style.color = '#34d399';
                                }
                            }
                            // Adicionar XP e ativar badge de conquista
                            if (window.addXpOnCompletion) {
                                window.addXpOnCompletion(courseKey);
                            }
                            btnComplete.innerHTML = '<i data-lucide="check"></i> Módulo Concluído!';
                            btnComplete.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                            lucide.createIcons();
                        });
                    }
                }
            });
        });
    }

    // ========================================================
    // 7. LÓGICA DA ABA INFORMAÇÕES & DROPDOWNS DO MENU
    // ========================================================
    const infoSubNavBtns = document.querySelectorAll('.info-sub-nav .sub-nav-btn');
    const infoSubSections = document.querySelectorAll('.info-sub-section');
    const btnContactSpecialists = document.querySelectorAll('.btn-contact-specialist');
    const dropdownLinks = document.querySelectorAll('.dropdown-link');

    // Troca de Subabas em Informações (Especialistas vs Diretrizes)
    if (infoSubNavBtns) {
        infoSubNavBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                infoSubNavBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const target = btn.getAttribute('data-infosub');
                infoSubSections.forEach(sec => {
                    sec.classList.remove('active');
                    if (sec.id === `info-sec-${target}`) {
                        sec.classList.add('active');
                    }
                });
            });
        });
    }

    // Lógica para links do dropdown menu superior
    if (dropdownLinks) {
        dropdownLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.stopPropagation(); // Evita dupla ativação
                const targetId = link.getAttribute('data-target');
                const subtarget = link.getAttribute('data-sub');
                
                // Mudar seção principal
                switchSection(targetId);
                
                // Mudar subaba correspondente
                if (targetId === 'treinamento' && subtarget) {
                    const subBtn = document.querySelector(`.sub-nav-btn[data-subtarget="${subtarget}"]`);
                    if (subBtn) subBtn.click();
                } else if (targetId === 'informacoes' && subtarget) {
                    const subBtn = document.querySelector(`.sub-nav-btn[data-infosub="${subtarget}"]`);
                    if (subBtn) subBtn.click();
                }

                // Fechar o dropdown de abas no clique
                const parent = link.closest('.nav-item-dropdown');
                if (parent) parent.classList.remove('open');
            });
        });
    }

    // Contatar Especialista (integração com Chat IA)
    if (btnContactSpecialists) {
        btnContactSpecialists.forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.getAttribute('data-name');
                const dept = btn.getAttribute('data-dept');
                
                // Redireciona para o Chat IA
                switchSection('chat-ia');
                
                // Digita e foca
                if (chatInputGpt) {
                    chatInputGpt.value = `Olá! Gostaria de falar com o especialista ${name} sobre o departamento de ${dept}. Como posso tirar dúvidas sobre isso?`;
                    chatInputGpt.focus();
                }
            });
        });
    }

    // ========================================================
    // 8. SISTEMA DE AUTENTICAÇÃO, PERFIL DE USUÁRIO & GAMIFICAÇÃO
    // ========================================================
    const btnProfileToggle = document.getElementById('btnProfileToggle');
    const profileDropdownCard = document.getElementById('profileDropdownCard');
    const btnLogin = document.getElementById('btnLogin');
    const btnLogout = document.getElementById('btnLogout');
    const userProfileMenuContainer = document.getElementById('userProfileMenuContainer');
    const btnGoToProfile = document.getElementById('btnGoToProfile');
    const btnSaveProfileSettings = document.getElementById('btnSaveProfileSettings');

    // Dicionário de informações de setores Stellantis (Lideranças)
    const sectorsData = {
        audio: {
            name: "Áudio & Projeção",
            leader: "Saulo Carvalho",
            area: "Projection, Legacy IVI & SA Audio",
            icon: "music",
            class: "sector-audio",
            desc: "Time liderado por Saulo Carvalho. Focado em espelhamento, conectividade e sistemas de áudio legados/SA."
        },
        core: {
            name: "Execução Core & Projetos",
            leader: "Breno Teixeira",
            area: "Core Module & SA Vehicle Project Execution",
            icon: "settings",
            class: "sector-core",
            desc: "Time liderado por Breno Teixeira. Coordena a engenharia de módulos base e integração de projetos de veículos."
        },
        requirements: {
            name: "Gestão de Requisitos",
            leader: "Heber Santos",
            area: "RT/Low & Entry Info. Requirements Mgmt",
            icon: "clipboard-list",
            class: "sector-requirements",
            desc: "Time liderado por Heber Santos. Focado em documentação de especificações e requisitos de info-entretenimento de entrada."
        },
        displays: {
            name: "Displays & Software",
            leader: "Gabriel Esteves",
            area: "Cluster and Displays & SA SWF",
            icon: "layout",
            class: "sector-displays",
            desc: "Time liderado por Gabriel Esteves. Desenvolve layouts de painéis (clusters), telas centrais e framework de software."
        },
        compliance: {
            name: "Operações & Compliance",
            leader: "Arthur Lott",
            area: "Operations, VO & Compliance Lead",
            icon: "shield-check",
            class: "sector-compliance",
            desc: "Time liderado por Arthur Lott. Controla testes de validação, operações em veículos físicos e conformidade de software."
        },
        hardware: {
            name: "Hardware & Mecânica",
            leader: "Alexandre Prates",
            area: "HW, MEC & Legacy IVI Lead",
            icon: "cpu",
            class: "sector-hardware",
            desc: "Time liderado por Alexandre Prates. Responsável pelo empacotamento físico do hardware, cablagem, e suporte mecânico de centrais."
        },
        china: {
            name: "Parcerias Globais",
            leader: "Yu Tian",
            area: "China Partners Development Mgmt Lead",
            icon: "globe",
            class: "sector-china",
            desc: "Time liderado por Yu Tian. Alinhamento técnico, importação e desenvolvimento com fornecedores e parceiros asiáticos."
        }
    };

    // Carregar Estado de Gamificação e Cadastro do LocalStorage
    let userName = localStorage.getItem('stellantis_user_name') || 'Eduardo Henrique';
    let userRole = localStorage.getItem('stellantis_user_role') || 'Engenheiro de Produto Júnior';
    let userAvatarUrl = localStorage.getItem('stellantis_user_avatar_url') || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
    let userSector = localStorage.getItem('stellantis_user_sector') || '';

    let userXp = parseInt(localStorage.getItem('stellantis_user_xp')) || 850;
    let userLevel = parseInt(localStorage.getItem('stellantis_user_level')) || 3;
    let userBadges = JSON.parse(localStorage.getItem('stellantis_user_badges')) || {
        biohybrid: true, // Já começa ativo no protótipo como exemplo
        adas: false,
        motores: false
    };

    function updateProfileUI() {
        const xpText = document.getElementById('profileXpText');
        const xpBar = document.getElementById('profileXpBar');
        const xpLevel = document.getElementById('profileXpLevel');
        
        // Atualizar insígnias no DOM
        const badgeBio = document.getElementById('badgeBioHybrid');
        const badgeAdasDom = document.getElementById('badgeADAS');
        const badgeMot = document.getElementById('badgeMotores');

        if (xpText && xpBar && xpLevel) {
            let maxXp = 1500;
            if (userLevel === 4) maxXp = 2500; // Aumenta teto se subiu de nível
            
            xpText.textContent = `${userXp} / ${maxXp} XP`;
            xpBar.style.width = `${Math.min((userXp / maxXp) * 100, 100)}%`;
            
            // Atualizar o texto de exibição do nível
            let levelTitle = "Nível 3 (Pleno)";
            if (userLevel === 1) levelTitle = "Nível 1 (Novato)";
            else if (userLevel === 2) levelTitle = "Nível 2 (Júnior)";
            else if (userLevel === 3) levelTitle = "Nível 3 (Pleno)";
            else if (userLevel === 4) levelTitle = "Nível 4 (Sênior)";
            xpLevel.textContent = levelTitle;
        }

        // Ativar/Inativar classes no Dropdown
        if (badgeBio) {
            if (userBadges.biohybrid) badgeBio.classList.add('active');
            else badgeBio.classList.remove('active');
        }
        if (badgeAdasDom) {
            if (userBadges.adas) badgeAdasDom.classList.add('active');
            else badgeAdasDom.classList.remove('active');
        }
        if (badgeMot) {
            if (userBadges.motores) badgeMot.classList.add('active');
            else badgeMot.classList.remove('active');
        }

        // --- Sincronizar Dados do Perfil ---
        // 1. Header (Nome Abreviado e Fotos)
        const userNameAbbrEls = document.querySelectorAll('.user-name-abbr');
        userNameAbbrEls.forEach(el => {
            const parts = userName.trim().split(/\s+/);
            const abbr = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
            el.textContent = abbr;
        });

        const userAvatarImgEls = document.querySelectorAll('.user-avatar-img, .profile-avatar-large, #editProfileAvatarPreview');
        userAvatarImgEls.forEach(el => {
            el.src = userAvatarUrl;
        });

        // 2. Dropdown Header
        const profileHeaderInfoName = document.querySelector('.profile-card-header h4');
        if (profileHeaderInfoName) profileHeaderInfoName.textContent = userName;

        const profileCargoEls = document.querySelectorAll('.profile-cargo');
        profileCargoEls.forEach(el => {
            el.textContent = userRole;
        });

        // 3. Inputs na Seção Perfil
        const inputName = document.getElementById('inputProfileName');
        const inputRole = document.getElementById('inputProfileRole');
        const selectArea = document.getElementById('selectProfileArea');

        if (inputName) inputName.value = userName;
        if (inputRole) inputRole.value = userRole;
        if (selectArea) selectArea.value = userSector;

        // Sincronizar seleção visual da lista de avatares pré-definidos
        const avatarItems = document.querySelectorAll('.avatar-select-item');
        avatarItems.forEach(item => {
            if (item.getAttribute('data-src') === userAvatarUrl) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });

        // 4. Insígnias Detalhes na Seção Perfil
        // A) Módulos de Treinamento
        const detailBio = document.getElementById('profileBadgeDetailBio');
        const detailAdas = document.getElementById('profileBadgeDetailAdas');
        const detailMotores = document.getElementById('profileBadgeDetailMotores');

        if (detailBio) {
            const p = detailBio.querySelector('p');
            if (userBadges.biohybrid) {
                detailBio.classList.add('active');
                if (p) p.textContent = "Concluído • Tecnologia de hibridização Flex da Stellantis.";
            } else {
                detailBio.classList.remove('active');
                if (p) p.textContent = "Pendente • Conclua o curso de hibridização na aba Treinamento.";
            }
        }
        if (detailAdas) {
            const p = detailAdas.querySelector('p');
            if (userBadges.adas) {
                detailAdas.classList.add('active');
                if (p) p.textContent = "Concluído • Sistemas avançados de assistência ao condutor.";
            } else {
                detailAdas.classList.remove('active');
                if (p) p.textContent = "Pendente • Conclua o curso ADAS na aba Treinamento.";
            }
        }
        if (detailMotores) {
            const p = detailMotores.querySelector('p');
            if (userBadges.motores) {
                detailMotores.classList.add('active');
                if (p) p.textContent = "Concluído • Calibração e mecânica de motores Stellantis.";
            } else {
                detailMotores.classList.remove('active');
                if (p) p.textContent = "Pendente • Conclua o curso de motores na aba Treinamento.";
            }
        }

        // B) Setor Selecionado (Saulo, Breno, Heber, Gabriel, Arthur, Alexandre, Yu)
        const detailSector = document.getElementById('profileBadgeDetailSector');
        const detailSectorName = document.getElementById('profileBadgeSectorName');
        const detailSectorDesc = document.getElementById('profileBadgeSectorDesc');
        const detailSectorIcon = document.getElementById('profileBadgeSectorIcon');

        if (detailSector && detailSectorName && detailSectorDesc && detailSectorIcon) {
            detailSector.className = "badge-detail-item"; // Reset class
            
            if (userSector && sectorsData[userSector]) {
                const sec = sectorsData[userSector];
                detailSector.classList.add('active', sec.class);
                detailSectorName.textContent = sec.name;
                detailSectorDesc.textContent = `${sec.area} • Líder: ${sec.leader}. ${sec.desc}`;
                detailSectorIcon.innerHTML = `<i data-lucide="${sec.icon}"></i>`;
            } else {
                detailSectorName.textContent = "Nenhum Setor Selecionado";
                detailSectorDesc.textContent = "Selecione seu setor no menu de edição para ganhar a insígnia.";
                detailSectorIcon.innerHTML = `<i data-lucide="briefcase"></i>`;
            }
        }

        // C) Patente de Nível (Evolutiva)
        const detailRank = document.getElementById('profileBadgeDetailRank');
        const detailRankName = document.getElementById('profileBadgeRankName');
        const detailRankDesc = document.getElementById('profileBadgeRankDesc');
        const detailRankIcon = document.getElementById('profileBadgeRankIcon');

        if (detailRank && detailRankName && detailRankDesc && detailRankIcon) {
            detailRank.className = "badge-detail-item active rank-badge"; // Reset class
            
            if (userLevel === 1) {
                detailRank.classList.add('level-1');
                detailRankName.textContent = "Novato de Engenharia (Rank 1)";
                detailRankDesc.textContent = "Começando a desbravar os sistemas e termos da Stellantis.";
                detailRankIcon.innerHTML = `<i data-lucide="user-check"></i>`;
            } else if (userLevel === 2) {
                detailRank.classList.add('level-2');
                detailRankName.textContent = "Júnior de Chassis/Software (Rank 2)";
                detailRankDesc.textContent = "Possui conhecimento técnico intermediário e já colabora ativamente.";
                detailRankIcon.innerHTML = `<i data-lucide="award"></i>`;
            } else if (userLevel === 3) {
                detailRank.classList.add('level-3');
                detailRankName.textContent = "Engenheiro Pleno (Rank 3)";
                detailRankDesc.textContent = "Calibrador experiente e profundo conhecedor da infraestrutura de software.";
                detailRankIcon.innerHTML = `<i data-lucide="shield"></i>`;
            } else {
                detailRank.classList.add('level-4');
                detailRankName.textContent = "Engenheiro Sênior Elite (Rank 4)";
                detailRankDesc.textContent = "Autoridade técnica na Stellantis. Mestre absoluto em arquitetura e integração.";
                detailRankIcon.innerHTML = `<i data-lucide="crown"></i>`;
            }
        }

        // Recarregar ícones dinâmicos do Lucide
        lucide.createIcons();
    }

    // Toggle do dropdown de perfil
    if (btnProfileToggle && profileDropdownCard) {
        btnProfileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdownCard.classList.toggle('open');
        });
    }

    // Fechar dropdown de perfil ao clicar fora
    document.addEventListener('click', (e) => {
        if (profileDropdownCard && !profileDropdownCard.contains(e.target) && btnProfileToggle && !btnProfileToggle.contains(e.target)) {
            profileDropdownCard.classList.remove('open');
        }
    });

    // Lógica de Sair (Logout)
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (userProfileMenuContainer) userProfileMenuContainer.style.display = 'none';
            if (btnLogin) btnLogin.style.display = 'block';
            profileDropdownCard.classList.remove('open');
        });
    }

    // Lógica de Entrar (Login)
    if (btnLogin) {
        btnLogin.addEventListener('click', () => {
            if (btnLogin) btnLogin.style.display = 'none';
            if (userProfileMenuContainer) userProfileMenuContainer.style.display = 'block';
            
            // Re-renderizar ícones ao logar para garantir
            lucide.createIcons();
            
            // Mensagem de boas-vindas sutil
            alert(`Bem-vindo de volta, ${userName}!`);
        });
    }

    // Função global para adicionar XP chamada quando um módulo é concluído
    window.addXpOnCompletion = function(courseKey) {
        let xpGained = 0;
        let badgeEarned = '';

        if (courseKey === 'biohybrid' && !userBadges.biohybrid) {
            userBadges.biohybrid = true;
            xpGained = 350;
            badgeEarned = 'Bio-H';
        } else if (courseKey === 'adas' && !userBadges.adas) {
            userBadges.adas = true;
            xpGained = 350;
            badgeEarned = 'ADAS';
        } else if (courseKey === 'motores' && !userBadges.motores) {
            userBadges.motores = true;
            xpGained = 350;
            badgeEarned = 'MultiAir';
        }

        if (xpGained > 0) {
            userXp += xpGained;
            
            // Lógica de Level Up
            let maxXp = userLevel === 3 ? 1500 : 2500;
            if (userXp >= maxXp) {
                userLevel = 4;
                userXp = userXp - maxXp; // Transfere o restante
                setTimeout(() => {
                    alert(`🎉 PARABÉNS! Você subiu de nível no Stellantis Dictionary!\nAgora seu cargo foi atualizado para: Engenheiro de Produto Sênior (Nível 4)`);
                    
                    updateProfileUI();
                }, 800);
            } else {
                setTimeout(() => {
                    alert(`⭐ +${xpGained} XP Adquirido! Insígnia "${badgeEarned}" ativada no seu perfil.`);
                }, 800);
            }

            // Salvar no LocalStorage
            localStorage.setItem('stellantis_user_xp', userXp);
            localStorage.setItem('stellantis_user_level', userLevel);
            localStorage.setItem('stellantis_user_badges', JSON.stringify(userBadges));
            
            updateProfileUI();
        }
    };

    // Navegar para a seção do Perfil completo ao clicar em "Ver Meu Perfil Completo"
    if (btnGoToProfile) {
        btnGoToProfile.addEventListener('click', () => {
            if (profileDropdownCard) {
                profileDropdownCard.classList.remove('open');
            }
            switchSection('perfil');
            loadProfileTimelineAndStats();
        });
    }

    // Configuração de Avatares do Perfil (Seleção & Upload via Modal Pop-up)
    let selectedAvatarUrl = userAvatarUrl;
    let tempAvatarChoice = userAvatarUrl;

    const btnOpenAvatarModal = document.getElementById('btnOpenAvatarModal');
    const modalAvatarPicker = document.getElementById('modalAvatarPicker');
    const btnCloseAvatarModal = document.getElementById('btnCloseAvatarModal');
    const btnCancelAvatarModal = document.getElementById('btnCancelAvatarModal');
    const btnConfirmAvatarChoice = document.getElementById('btnConfirmAvatarChoice');
    const inputAvatarFile = document.getElementById('inputProfileAvatarFile');
    const editPreviewImg = document.getElementById('editProfileAvatarPreview');

    // Inicializar marcação da classe selected nos avatares ilustrados no modal
    function syncAvatarModalSelection() {
        const items = document.querySelectorAll('#modalAvatarPicker .avatar-select-item');
        items.forEach(item => {
            if (item.getAttribute('data-src') === tempAvatarChoice) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    if (btnOpenAvatarModal && modalAvatarPicker) {
        btnOpenAvatarModal.addEventListener('click', () => {
            tempAvatarChoice = selectedAvatarUrl;
            syncAvatarModalSelection();
            modalAvatarPicker.classList.add('open');
        });
    }

    function closeAvatarModal() {
        if (modalAvatarPicker) modalAvatarPicker.classList.remove('open');
    }

    if (btnCloseAvatarModal) btnCloseAvatarModal.addEventListener('click', closeAvatarModal);
    if (btnCancelAvatarModal) btnCancelAvatarModal.addEventListener('click', closeAvatarModal);

    if (modalAvatarPicker) {
        modalAvatarPicker.addEventListener('click', (e) => {
            if (e.target === modalAvatarPicker) closeAvatarModal();
        });
    }

    // Gerenciar cliques nos avatares ilustrados dentro do modal
    const modalAvatarItems = document.querySelectorAll('#modalAvatarPicker .avatar-select-item');
    modalAvatarItems.forEach(item => {
        item.addEventListener('click', () => {
            modalAvatarItems.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            tempAvatarChoice = item.getAttribute('data-src');
        });
    });

    // Upload de arquivo local dentro do modal
    if (inputAvatarFile) {
        inputAvatarFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    alert('Por favor, envie uma foto com menos de 2MB!');
                    return;
                }
                const reader = new FileReader();
                reader.onload = function(evt) {
                    tempAvatarChoice = evt.target.result;
                    // Desmarcar todos os avatares do grid para indicar a escolha do arquivo
                    modalAvatarItems.forEach(i => i.classList.remove('selected'));
                    alert('Foto carregada com sucesso! Clique em "Confirmar Escolha" para aplicar.');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Confirmar escolha do modal
    if (btnConfirmAvatarChoice) {
        btnConfirmAvatarChoice.addEventListener('click', () => {
            selectedAvatarUrl = tempAvatarChoice;
            if (editPreviewImg) editPreviewImg.src = selectedAvatarUrl;
            closeAvatarModal();
        });
    }

    // Salvar Dados Editados no Perfil
    if (btnSaveProfileSettings) {
        btnSaveProfileSettings.addEventListener('click', () => {
            const inputName = document.getElementById('inputProfileName');
            const inputRole = document.getElementById('inputProfileRole');
            const selectArea = document.getElementById('selectProfileArea');

            let updatedSector = false;

            if (inputName && inputName.value.trim() !== '') {
                userName = inputName.value.trim();
                localStorage.setItem('stellantis_user_name', userName);
            }
            if (inputRole && inputRole.value.trim() !== '') {
                userRole = inputRole.value.trim();
                localStorage.setItem('stellantis_user_role', userRole);
            }
            
            // Persistir o avatar selecionado ou enviado por upload
            userAvatarUrl = selectedAvatarUrl;
            localStorage.setItem('stellantis_user_avatar_url', userAvatarUrl);

            if (selectArea) {
                const oldSector = userSector;
                userSector = selectArea.value;
                localStorage.setItem('stellantis_user_sector', userSector);
                if (userSector !== oldSector) {
                    updatedSector = true;
                }
            }

            updateProfileUI();

            if (updatedSector && userSector && sectorsData[userSector]) {
                const sec = sectorsData[userSector];
                alert(`🎉 PARABÉNS!\nVocê ingressou na divisão de ${sec.name} (Liderança: ${sec.leader})!\nA insígnia corporativa oficial correspondente foi desbloqueada no seu painel.`);
            } else {
                alert('Perfil atualizado com sucesso no banco de dados local!');
            }
        });
    }

    // Compila e renderiza a Timeline de Atividades e Estatísticas do Perfil
    function loadProfileTimelineAndStats() {
        const statTerms = document.getElementById('statCreatedTerms');
        const statIdeas = document.getElementById('statCreatedIdeas');
        const statFlashcards = document.getElementById('statCreatedFlashcards');
        const timelineTrack = document.getElementById('profileActivityTimeline');

        if (!timelineTrack) return;

        // 1. Carregar dados atuais com segurança try-catch
        let currentTerms = [];
        let currentIdeas = [];
        let currentFlashcards = [];

        try {
            currentTerms = JSON.parse(localStorage.getItem('stellantis_terms')) || [];
        } catch(e) {
            currentTerms = [];
        }

        try {
            currentIdeas = JSON.parse(localStorage.getItem('stellantis_ideas')) || [];
        } catch(e) {
            currentIdeas = [];
        }

        try {
            currentFlashcards = JSON.parse(localStorage.getItem('stellantis_custom_flashcards')) || [];
        } catch(e) {
            currentFlashcards = [];
        }

        // 2. Calcular estatísticas
        const customTerms = currentTerms.filter(t => t.id && t.id.toString().startsWith('custom-'));
        const totalTerms = customTerms.length;
        const totalIdeas = currentIdeas.length;
        const totalFlashcards = currentFlashcards.length;

        if (statTerms) statTerms.textContent = totalTerms;
        if (statIdeas) statIdeas.textContent = totalIdeas;
        if (statFlashcards) statFlashcards.textContent = totalFlashcards;

        // 3. Compilar Atividades para a Timeline
        const activities = [];

        // Adicionar termos
        customTerms.forEach(t => {
            try {
                const ts = parseInt(t.id.split('-')[1]) || Date.now();
                activities.push({
                    type: 'term',
                    title: `Verbete Adicionado: ${t.title}`,
                    desc: t.def,
                    time: new Date(ts).toLocaleString('pt-BR'),
                    timestamp: ts
                });
            } catch(err) {
                console.error("Erro ao carregar termo na timeline:", err);
            }
        });

        // Adicionar ideias (com parsing ISO seguro)
        currentIdeas.forEach(id => {
            try {
                let ts = Date.now();
                if (id.date) {
                    const formatted = id.date.replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$2-$1').replace(', ', 'T');
                    const parseTs = Date.parse(formatted);
                    if (!isNaN(parseTs)) ts = parseTs;
                }
                activities.push({
                    type: 'idea',
                    title: `Ideia Registrada (${id.type === 'termo' ? 'Dicionário' : id.type === 'hotspot' ? 'Hotspot 3D' : 'Geral'}): ${id.title}`,
                    desc: id.desc,
                    time: id.date || 'Data Indisponível',
                    timestamp: ts
                });
            } catch(err) {
                console.error("Erro ao carregar ideia na timeline:", err);
            }
        });

        // Adicionar flashcards
        currentFlashcards.forEach(fc => {
            try {
                const ts = fc.timestamp || Date.now();
                activities.push({
                    type: 'flashcard',
                    title: `Flashcard de Estudos Criado`,
                    desc: `<strong>Tema:</strong> ${fc.title} (${fc.watermark})<br><strong>Pergunta:</strong> ${fc.question}<br><strong>Resposta:</strong> ${fc.answer}`,
                    time: fc.date || new Date(ts).toLocaleString('pt-BR'),
                    timestamp: ts
                });
            } catch(err) {
                console.error("Erro ao carregar flashcard na timeline:", err);
            }
        });

        // Ordenar por data decrescente (mais recente primeiro)
        activities.sort((a, b) => b.timestamp - a.timestamp);

        // 4. Renderizar
        timelineTrack.innerHTML = '';

        if (activities.length === 0) {
            timelineTrack.innerHTML = `
                <div class="timeline-empty-state">
                    <i data-lucide="calendar-days"></i>
                    <p>Nenhuma atividade registrada ainda. Colabore no Dicionário, crie Ideias ou crie Flashcards para ver seu histórico!</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        activities.forEach(act => {
            const item = document.createElement('div');
            item.className = `profile-activity-item type-${act.type}`;
            item.innerHTML = `
                <span class="activity-dot"></span>
                <div class="activity-header">
                    <span class="activity-title">${act.title}</span>
                    <span class="activity-time">${act.time}</span>
                </div>
                <p class="activity-description">${act.desc}</p>
            `;
            timelineTrack.appendChild(item);
        });

        lucide.createIcons();
    }

    // Inicializar interface de perfil de usuário
    updateProfileUI();

    // ========================================================
    // 9. LÓGICA DO MODAL DE DETALHES DE VERSÕES DE PROJETOS
    // ========================================================
    const projectDetailsData = {
        DEMO1: {
            title: "Gama de Modelos Jeep Compass",
            subtitle: "Projeto DEMO1 - SUV Médio Líder de Vendas",
            versions: [
                {
                    name: "Compass Sport T270",
                    engine: "1.3 Turbo Flex (185 cv)",
                    transmission: "Automático 6 marchas",
                    traction: "4x2 Dianteira",
                    description: "Versão de entrada focada em excelente relação custo-benefício. Traz quadro digital, faróis Full LED e rodas de liga aro 18.",
                    highlights: ["Faróis Full LED", "Rodas de Liga Aro 18", "Ar Dual-Zone"]
                },
                {
                    name: "Compass Longitude T270 / TD380",
                    engine: "1.3 Turbo Flex (185 cv) ou 2.0 Turbo Diesel (170 cv)",
                    transmission: "Automático 6 marchas (Flex) ou 9 marchas (Diesel)",
                    traction: "4x2 (Flex) ou 4x4 Jeep Active Drive (Diesel)",
                    description: "A configuração mais vendida da linha. Soma acabamento interno premium em couro, central de 10.1 polegadas e painel digital de 10.25 polegadas.",
                    highlights: ["Couro Premium", "Multimídia 10.1\"", "Painel 10.25\""]
                },
                {
                    name: "Compass Limited T270 / TD380",
                    engine: "1.3 Turbo Flex (185 cv) ou 2.0 Turbo Diesel (170 cv)",
                    transmission: "Automático 6 marchas (Flex) ou 9 marchas (Diesel)",
                    traction: "4x2 (Flex) ou 4x4 (Diesel)",
                    description: "Foco em tecnologia e requinte superior. Oferece assistências de condução semiautônoma ADAS completas, banco elétrico e sete airbags.",
                    highlights: ["Sistemas ADAS", "Sete Airbags", "Bancos Elétricos"]
                },
                {
                    name: "Compass Série S T270 / Hurricane 4",
                    engine: "1.3 Turbo Flex (185 cv) ou 2.0 Turbo Hurricane Gasolina (272 cv)",
                    transmission: "Automático 6 marchas (Flex) ou 9 marchas (Hurricane)",
                    traction: "4x2 (Flex) ou 4x4 (Hurricane)",
                    description: "O topo do requinte urbano com apelo esportivo. Visual totalmente escurecido (black pack), teto solar panorâmico, som Beats premium de 506 Watts e motor Hurricane 4 de alta performance.",
                    highlights: ["Som Beats 506W", "Teto Solar Panorâmico", "Hurricane 4 (272 cv)"]
                },
                {
                    name: "Compass Trailhawk TD380",
                    engine: "2.0 Turbo Diesel (170 cv)",
                    transmission: "Automático 9 marchas",
                    traction: "4x4 Off-Road Trail Rated",
                    description: "Desenvolvido para transpor obstáculos off-road extremos. Possui suspensão elevada, pneus especiais para uso na lama, ganchos de reboque vermelhos e protetores metálicos.",
                    highlights: ["Selo Trail Rated", "Ganchos Vermelhos", "Suspensão Elevada Off-road"]
                },
                {
                    name: "Compass 4xe (Híbrido Plug-in)",
                    engine: "1.3 Turbo Flex + Motor Elétrico (240 cv combinado)",
                    transmission: "Automático 6 marchas",
                    traction: "4x4 E-AWD Integral Elétrica",
                    description: "Tecnologia de eletrificação plug-in importada. Roda até 44 km em modo 100% elétrico com consumo médio simulado superior a 25 km/l.",
                    highlights: ["Bateria recarregável (PHEV)", "Consumo > 25 km/l", "Modo 100% Elétrico"]
                }
            ]
        },
        DEMO2: {
            title: "Gama de Modelos Ram Rampage",
            subtitle: "Projeto DEMO2 - Picape Intermediária Premium",
            versions: [
                {
                    name: "Rampage Rebel",
                    engine: "2.0 Turbo Diesel (170 cv) ou 2.0 Turbo Hurricane (272 cv)",
                    transmission: "Automático 9 marchas",
                    traction: "4x4 Integral Ativa",
                    description: "Aparência off-road robusta com grade preta estilizada, pneus todo-terreno e visual agressivo ideal para terra e asfalto.",
                    highlights: ["Pneus All-Terrain", "Visual Rebel Escurecido", "Tração 4x4"]
                },
                {
                    name: "Rampage Laramie",
                    engine: "2.0 Turbo Diesel (170 cv) ou 2.0 Turbo Hurricane (272 cv)",
                    transmission: "Automático 9 marchas",
                    traction: "4x4 Integral Ativa",
                    description: "Foco no requinte com acabamento cromado na grade e molduras de janelas, além de interior revestido em couro marrom premium.",
                    highlights: ["Grade Cromada", "Couro Marrom Premium", "Rodas Aro 18 Diamantadas"]
                },
                {
                    name: "Rampage R/T",
                    engine: "2.0 Turbo Hurricane Gasolina (272 cv)",
                    transmission: "Automático 9 marchas",
                    traction: "4x4 Integral Ativa",
                    description: "Calibração esportiva com escapamento duplo ativo, suspensão rebaixada, rodas pretas aro 19 e modo de condução esportivo R/T dedicado.",
                    highlights: ["Modo R/T Esportivo", "Duplo Escapamento", "Suspensão Rebaixada"]
                }
            ]
        },
        DEMO3: {
            title: "Gama de Modelos Jeep Commander",
            subtitle: "Projeto DEMO3 - D-SUV de 7 Lugares Premium",
            versions: [
                {
                    name: "Commander Longitude T270",
                    engine: "1.3 Turbo Flex (185 cv)",
                    transmission: "Automático 6 marchas",
                    traction: "4x2 Dianteira",
                    description: "Versão de entrada para o SUV de 7 lugares. Acabamento interno requintado em suede e couro preto, painel digital e ótimo espaço de bagageiro.",
                    highlights: ["7 Lugares", "Suede & Couro Preto", "Multimídia 10.1\""]
                },
                {
                    name: "Commander Limited T270 / TD380",
                    engine: "1.3 Turbo Flex (185 cv) ou 2.0 Turbo Diesel (170 cv)",
                    transmission: "Automático 6 marchas (Flex) ou 9 marchas (Diesel)",
                    traction: "4x2 (Flex) ou 4x4 (Diesel)",
                    description: "Versão clássica de luxo. Soma as assistências autônomas ADAS completas, porta-malas com abertura automática elétrica por aproximação e rodas aro 19.",
                    highlights: ["ADAS Avançado", "Abertura Elétrica Porta-malas", "Rodas Aro 19"]
                },
                {
                    name: "Commander Overland T270 / TD380 / Hurricane 4",
                    engine: "T270 Flex, TD380 Diesel ou Hurricane 4 Gasolina (272 cv)",
                    transmission: "Automático 6 marchas (Flex) ou 9 marchas (Diesel/Gasolina)",
                    traction: "4x2 (Flex) ou 4x4 (Diesel/Gasolina)",
                    description: "O máximo do luxo da marca. Teto solar panorâmico, som Gama Áudio (fictício) de altíssima fidelidade, interior marrom cooper e acabamentos sofisticados.",
                    highlights: ["Som Gama Áudio (fictício)", "Teto Solar Panorâmico", "Couro Cooper Premium"]
                },
                {
                    name: "Commander Blackhawk Hurricane 4",
                    engine: "2.0 Turbo Hurricane Gasolina (272 cv)",
                    transmission: "Automático 9 marchas",
                    traction: "4x4 Integral",
                    description: "A união de altíssima performance com visual sombrio. Detalhes em preto brilhante, pinças de freio vermelhas e motor de 272 cv capaz de ir de 0 a 100 km/h em 7 segundos.",
                    highlights: ["Visual Blackhawk", "Hurricane 4 (272 cv)", "Aceleração Esportiva"]
                }
            ]
        }
    };

    const modalProjectDetails = document.getElementById('modalProjectDetails');
    const projectModalTitle = document.getElementById('projectModalTitle');
    const projectModalSubtitle = document.getElementById('projectModalSubtitle');
    const projectModalBody = document.getElementById('projectModalBody');
    const btnCloseProjectModal = document.getElementById('btnCloseProjectModal');
    const btnCloseProjectModalBtn = document.getElementById('btnCloseProjectModalBtn');
    
    // Adicionar eventos de clique nos cards de projeto
    const projectCards = document.querySelectorAll('.project-card');
    if (projectCards) {
        projectCards.forEach(card => {
            card.addEventListener('click', () => {
                const codeBadge = card.querySelector('.project-code-badge');
                if (codeBadge) {
                    const projectCode = codeBadge.textContent.trim();
                    openProjectDetailsModal(projectCode);
                }
            });
        });
    }

    function openProjectDetailsModal(code) {
        const data = projectDetailsData[code];
        if (!data || !modalProjectDetails || !projectModalTitle || !projectModalSubtitle || !projectModalBody) return;

        projectModalTitle.textContent = data.title;
        projectModalSubtitle.textContent = data.subtitle;

        // Limpar corpo e gerar HTML
        projectModalBody.innerHTML = '';
        const listGrid = document.createElement('div');
        listGrid.className = 'versions-list-grid';

        data.versions.forEach(ver => {
            const verCard = document.createElement('div');
            verCard.className = 'version-detail-card';

            // Highlights HTML
            let highlightsHtml = '';
            ver.highlights.forEach(h => {
                highlightsHtml += `<span class="highlight-tag">${h}</span>`;
            });

            verCard.innerHTML = `
                <div class="version-card-header">
                    <h4>${ver.name}</h4>
                    <span class="version-engine-badge">${ver.engine.split(' ')[0]}</span>
                </div>
                <div class="version-specs-grid">
                    <div class="spec-info-item">
                        <span>Motor</span>
                        <span>${ver.engine}</span>
                    </div>
                    <div class="spec-info-item">
                        <span>Câmbio</span>
                        <span>${ver.transmission}</span>
                    </div>
                    <div class="spec-info-item">
                        <span>Tração</span>
                        <span>${ver.traction}</span>
                    </div>
                </div>
                <p class="version-detail-desc">${ver.description}</p>
                <div class="version-highlights">
                    ${highlightsHtml}
                </div>
            `;
            listGrid.appendChild(verCard);
        });

        projectModalBody.appendChild(listGrid);
        modalProjectDetails.classList.add('open');
        lucide.createIcons();
    }

    // Fechar Modal
    if (btnCloseProjectModal) {
        btnCloseProjectModal.addEventListener('click', () => {
            modalProjectDetails.classList.remove('open');
        });
    }
    if (btnCloseProjectModalBtn) {
        btnCloseProjectModalBtn.addEventListener('click', () => {
            modalProjectDetails.classList.remove('open');
        });
    }
    
    // Fechar ao clicar no overlay
    if (modalProjectDetails) {
        modalProjectDetails.addEventListener('click', (e) => {
            if (e.target === modalProjectDetails) {
                modalProjectDetails.classList.remove('open');
            }
        });
    }

    // ========================================================
    // 10. FILTRO DE COMPONENTES DE INFOTAINMENT (DROPDOWNS)
    // ========================================================
    const btnFilterComponentDropdown = document.getElementById('btnFilterComponentDropdown');
    const btnFilterSupplierDropdown = document.getElementById('btnFilterSupplierDropdown');
    const menuFilterComponent = document.getElementById('menuFilterComponent');
    const menuFilterSupplier = document.getElementById('menuFilterSupplier');

    // Arrays globais de filtros ativos (sincronizados com o estado inicial dos checkboxes no index.html)
    window.activeCategories = ['audio-tela', 'conectividade-auxilio'];
    window.activeSuppliers = ['alfa', 'delta', 'gama', 'beta'];

    function toggleFilterDropdown(btn, menu) {
        if (!menu) return;
        const isOpen = menu.style.display === 'flex';
        
        // Fechar todos antes
        if (menuFilterComponent) menuFilterComponent.style.display = 'none';
        if (menuFilterSupplier) menuFilterSupplier.style.display = 'none';
        if (btnFilterComponentDropdown) btnFilterComponentDropdown.classList.remove('open');
        if (btnFilterSupplierDropdown) btnFilterSupplierDropdown.classList.remove('open');

        if (!isOpen) {
            menu.style.display = 'flex';
            btn.classList.add('open');
        }
    }

    if (btnFilterComponentDropdown && menuFilterComponent) {
        btnFilterComponentDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFilterDropdown(btnFilterComponentDropdown, menuFilterComponent);
        });
    }

    if (btnFilterSupplierDropdown && menuFilterSupplier) {
        btnFilterSupplierDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFilterDropdown(btnFilterSupplierDropdown, menuFilterSupplier);
        });
    }

    // Fechar dropdowns ao clicar fora
    document.addEventListener('click', (e) => {
        if (menuFilterComponent && !menuFilterComponent.contains(e.target) && e.target !== btnFilterComponentDropdown) {
            menuFilterComponent.style.display = 'none';
            if (btnFilterComponentDropdown) btnFilterComponentDropdown.classList.remove('open');
        }
        if (menuFilterSupplier && !menuFilterSupplier.contains(e.target) && e.target !== btnFilterSupplierDropdown) {
            menuFilterSupplier.style.display = 'none';
            if (btnFilterSupplierDropdown) btnFilterSupplierDropdown.classList.remove('open');
        }
    });

    // Evento de alteração nos checkboxes
    const filterCheckboxes = document.querySelectorAll('.filter-checkbox');
    function updateDropdownFilters() {
        const catList = [];
        const supList = [];

        filterCheckboxes.forEach(cb => {
            if (cb.checked) {
                const cat = cb.getAttribute('data-cat');
                const sup = cb.getAttribute('data-sup');
                if (cat) catList.push(cat);
                if (sup) supList.push(sup);
            }
        });

        window.activeCategories = catList;
        window.activeSuppliers = supList;

        // Atualizar estado ativo visual nos botões principais caso haja filtros selecionados
        if (btnFilterComponentDropdown) {
            if (catList.length < 2) {
                btnFilterComponentDropdown.classList.add('active');
            } else {
                btnFilterComponentDropdown.classList.remove('active');
            }
        }
        if (btnFilterSupplierDropdown) {
            if (supList.length < 4) {
                btnFilterSupplierDropdown.classList.add('active');
            } else {
                btnFilterSupplierDropdown.classList.remove('active');
            }
        }

        if (typeof renderInfotainment === 'function') {
            renderInfotainment();
        }
    }

    if (filterCheckboxes) {
        filterCheckboxes.forEach(cb => {
            cb.addEventListener('change', updateDropdownFilters);
        });
    }

    // ========================================================
    // 11. LÓGICA DO ORGANOGRAMA HIERÁRQUICO E MAPA GLOBAL
    // ========================================================
    const orgViewBtns = document.querySelectorAll('.org-view-btn');
    const orgModeContainers = document.querySelectorAll('.org-mode-container');
    const mapPins = document.querySelectorAll('.map-pin-pulse');
    
    const locEmptyState = document.getElementById('locEmptyState');
    const locContentArea = document.getElementById('locContentArea');
    
    const locTitle = document.getElementById('locTitle');
    const locSubtitle = document.getElementById('locSubtitle');
    const statLocInternal = document.getElementById('statLocInternal');
    const statLocExternal = document.getElementById('statLocExternal');
    const statLocTotal = document.getElementById('statLocTotal');
    const locTeamList = document.getElementById('locTeamList');

    const orgTreeWrapper = document.getElementById('orgTreeWrapper');
    const orgBreadcrumbs = document.getElementById('orgBreadcrumbs');

    // Estrutura de dados completa da hierarquia (Slide 1, 2, 3 e 5)
    const orgHierarchy = JSON.parse(localStorage.getItem('stellantis_hierarchy')) || {
        id: "heiko",
        name: "Heiko SCHILLING",
        role: "Software Engineering Director (Global)",
        level: "N-2",
        location: "de",
        avatar: "HS",
        reports: [
            {
                id: "doug",
                name: "Doug WELLMAN",
                role: "Autonomous Driving Lead",
                level: "N-3",
                location: "na",
                avatar: "DW",
                reports: []
            },
            {
                id: "tara",
                name: "Tara VATCHER",
                role: "Core Software Platform Dev Lead",
                level: "N-3",
                location: "na",
                avatar: "TV",
                reports: []
            },
            {
                id: "anantha",
                name: "Anantha KRISHNAN",
                role: "Digital Cockpit Lead",
                level: "N-3",
                location: "in",
                avatar: "AK",
                reports: [
                    {
                        id: "fernando",
                        name: "Fernando ATAIDE",
                        role: "Entry Infotainment & SA TC Lead",
                        level: "N-4",
                        location: "sa",
                        avatar: "FA",
                        reports: [
                            {
                                id: "saulo",
                                name: "Saulo CARVALHO",
                                role: "Projection, Legacy IVI & SA Audio",
                                level: "N-5",
                                location: "sa",
                                avatar: "SC",
                                reports: [
                                    {
                                        id: "global_tech_leads",
                                        name: "Global Tech Leaders",
                                        role: "Systems & Projection Technology",
                                        level: "N-6 Group",
                                        location: "sa",
                                        avatar: "TL",
                                        reports: [
                                            { id: "pedro_n", name: "Pedro NETO", role: "Projection & LPM", level: "N-6", location: "sa", avatar: "PN", reports: [] },
                                            { id: "pamela_c", name: "Pamela CACERES", role: "PLM Mgmt & AEE2010/Atl-Mid IVIs", level: "N-6", location: "sa", avatar: "PC", reports: [] },
                                            { id: "iuri_m", name: "Iuri MENDES", role: "SEAR2 IVIs & KP1", level: "N-6", location: "sa", avatar: "IM", reports: [] },
                                            { id: "julien_b", name: "Julien BONNET", role: "Crony 2 Part Manager (ext)", level: "N-6", location: "sa", avatar: "JB", reports: [] }
                                        ]
                                    },
                                    {
                                        id: "dre_saulo",
                                        name: "Design Release Engineering",
                                        role: "DRE Projection & Audio",
                                        level: "N-6 Group",
                                        location: "sa",
                                        avatar: "DE",
                                        reports: [
                                            { id: "carla_c", name: "Carla CASTRO", role: "R2EX SA DRE", level: "N-6", location: "sa", avatar: "CC", reports: [] },
                                            { id: "caio_c", name: "Caio COELHO", role: "AEE2010 & KP1 SA DRE", level: "N-6", location: "sa", avatar: "CC", reports: [] },
                                            { id: "yassine_z", name: "Yassine ZAAZOUA", role: "R2EX MEA DRE (ext)", level: "N-6", location: "mor", avatar: "YZ", reports: [] },
                                            { id: "artur_j", name: "Artur JORGE", role: "R1H Atl-Mid DRE (ext)", level: "N-6", location: "sa", avatar: "AJ", reports: [] },
                                            { id: "karen_c", name: "Karen CORREA", role: "Audio System DRE (ext)", level: "N-6", location: "sa", avatar: "KC", reports: [] },
                                            { id: "vitor_l", name: "Vitor LEMBI", role: "Projection DRE", level: "N-6", location: "sa", avatar: "VL", reports: [] }
                                        ]
                                    },
                                    {
                                        id: "war_room_leaders",
                                        name: "War Room Leaders",
                                        role: "Crisis & Delivery Execution",
                                        level: "N-6 Group",
                                        location: "sa",
                                        avatar: "WR",
                                        reports: [
                                            { id: "matheus_v", name: "Matheus VIEIRA", role: "SA War Room Leader (ext)", level: "N-6", location: "sa", avatar: "MV", reports: [] },
                                            { id: "mostafa_z", name: "Mostafa ZAHARI", role: "Crony 2 War Room Leader (ext)", level: "N-6", location: "mor", avatar: "MZ", reports: [] },
                                            { id: "souhail_f", name: "Souhail FADLI", role: "Crony 2 Marocco War Room (ext)", level: "N-6", location: "mor", avatar: "SF", reports: [] }
                                        ]
                                    }
                                ]
                            },
                            {
                                id: "breno",
                                name: "Breno TEIXEIRA",
                                role: "Core Module & SA Vehicle Project Execution Mngt",
                                level: "N-5",
                                location: "sa",
                                avatar: "BT",
                                reports: [
                                    {
                                        id: "tpm_breno",
                                        name: "Technical Program Managers",
                                        role: "TPM Release Management",
                                        level: "N-6 Group",
                                        location: "sa",
                                        avatar: "TP",
                                        reports: [
                                            { id: "sara_c", name: "Sara CANÇADO", role: "Crony1 / Crony2 TPM", level: "N-6", location: "sa", avatar: "SC", reports: [] },
                                            { id: "laura_cot", name: "Laura COTTA", role: "Legacy's TPM", level: "N-6", location: "sa", avatar: "LC", reports: [] },
                                            { id: "luiz_a", name: "Luiz ARAUJO", role: "R1LR TPM", level: "N-6", location: "sa", avatar: "LA", reports: [] },
                                            { id: "alexandre_p_ai", name: "Alexandre PRATES (a.i)", role: "R2ex TPM", level: "N-6", location: "sa", avatar: "AP", reports: [] }
                                        ]
                                    },
                                    {
                                        id: "sstl_breno",
                                        name: "Sub System Technical Leads",
                                        role: "SSTL Domain Leads",
                                        level: "N-6 Group",
                                        location: "sa",
                                        avatar: "SS",
                                        reports: [
                                            { id: "luiza_c", name: "Luiza CAMPOS", role: "SSTL DEMO1 (Compass)", level: "N-6", location: "sa", avatar: "LC", reports: [] },
                                            { id: "cecilia_e", name: "Cecilia EMANUELY", role: "SSTL 521 / J1U", level: "N-6", location: "sa", avatar: "CE", reports: [] },
                                            { id: "ronan_b", name: "Ronan BALBINO", role: "SSTL 551 / 598 / J4L", level: "N-6", location: "sa", avatar: "RB", reports: [] },
                                            { id: "lucas_m", name: "Lucas MARCATO", role: "SSTL 226 / 291 / F3P", level: "N-6", location: "sa", avatar: "LM", reports: [] },
                                            { id: "pedro_l", name: "Pedro LOURO", role: "SSTL F1H / F2U / F2X", level: "N-6", location: "sa", avatar: "PL", reports: [] },
                                            { id: "elder_l", name: "Elder LUCIO", role: "SSTL CC2X / 516 JJ", level: "N-6", location: "sa", avatar: "EL", reports: [] },
                                            { id: "ana_c", name: "Ana Carolina", role: "SSTL 363 / 376 & Go Forward", level: "N-6", location: "sa", avatar: "AC", reports: [] },
                                            { id: "mauricio_c", name: "Mauricio CARMINATE", role: "SSTL P21 / P24 / XBP", level: "N-6", location: "sa", avatar: "MC", reports: [] },
                                            { id: "igor_i", name: "Igor INACIO", role: "SSTL LPM / KP1 / K0 / X250", level: "N-6", location: "sa", avatar: "II", reports: [] },
                                            { id: "amanda_g", name: "Amanda GIORI", role: "SSTL Legacy's & Imports", level: "N-6", location: "sa", avatar: "AG", reports: [] },
                                            { id: "isaac_b", name: "Isaac BOY", role: "SSTL Advanced", level: "N-6", location: "sa", avatar: "IB", reports: [] }
                                        ]
                                    }
                                ]
                            },
                            {
                                id: "heber",
                                name: "Heber SANTOS",
                                role: "R1Low & Entry Info. Requirements Mgmt",
                                level: "N-5",
                                location: "sa",
                                avatar: "HS",
                                reports: [
                                    {
                                        id: "req_team",
                                        name: "Requirements Team",
                                        role: "Global Entry Infotainment SPEC",
                                        level: "N-6 Group",
                                        location: "sa",
                                        avatar: "RT",
                                        reports: [
                                            { id: "carlos_a", name: "Carlos AQUINO", role: "Global Tech Lead SPEC", level: "N-6", location: "sa", avatar: "CA", reports: [] },
                                            { id: "antoniel_g", name: "Antoniel GRAVINA", role: "Component Leader (ext)", level: "N-6", location: "sa", avatar: "AG", reports: [] },
                                            { id: "junio_a", name: "Junio AQUINO", role: "Component Designer", level: "N-6", location: "sa", avatar: "JA", reports: [] },
                                            { id: "eduardo_b", name: "Eduardo BIANUCCI", role: "Component Designer (ext)", level: "N-6", location: "sa", avatar: "EB", reports: [] },
                                            { id: "ademir_t", name: "Ademir TOLEDO", role: "Component Designer", level: "N-6", location: "sa", avatar: "AT", reports: [] },
                                            { id: "daniel_s", name: "Daniel SANTANA", role: "Component Designer (ext)", level: "N-6", location: "sa", avatar: "DS", reports: [] },
                                            { id: "nathan_m", name: "Nathan MARQUES", role: "Component Designer (ext)", level: "N-6", location: "sa", avatar: "NM", reports: [] },
                                            { id: "giuseppe_d", name: "Giuseppe D'ALOIA", role: "Component Designer (ext)", level: "N-6", location: "sa", avatar: "GD", reports: [] },
                                            { id: "laura_c", name: "Laura COLARES", role: "Component Designer (ext)", level: "N-6", location: "sa", avatar: "LC", reports: [] },
                                            { id: "kavyasree_n", name: "Kavyasree NAMANI", role: "Component Designer", level: "N-6", location: "in", avatar: "KN", reports: [] },
                                            { id: "lakshaman_b", name: "Lakshaman B.", role: "Component Designer", level: "N-6", location: "in", avatar: "LB", reports: [] }
                                        ]
                                    },
                                    {
                                        id: "mod_exec_team",
                                        name: "Module Execution Team",
                                        role: "Global Entry Infotainment Execution",
                                        level: "N-6 Group",
                                        location: "sa",
                                        avatar: "ME",
                                        reports: [
                                            { id: "romulo_b", name: "Romulo BERTU", role: "Global Tech Lead Module Execution", level: "N-6", location: "sa", avatar: "RB", reports: [] },
                                            { id: "hagatha_j", name: "Hagatha JULIATO", role: "Cyber & Apps Lead", level: "N-6", location: "sa", avatar: "HJ", reports: [] },
                                            { id: "daniel_l", name: "Daniel LAGUARDIA", role: "OTA & SW Lead (ext)", level: "N-6", location: "sa", avatar: "DL", reports: [] }
                                        ]
                                    },
                                    {
                                        id: "dre_tpm_team",
                                        name: "DRE/TPM Team",
                                        role: "Release & Project Management",
                                        level: "N-6 Group",
                                        location: "sa",
                                        avatar: "DT",
                                        reports: [
                                            { id: "pedro_c", name: "Pedro CAIO", role: "R1L-R/R1L DRE SA (ext)", level: "N-6", location: "sa", avatar: "PC", reports: [] },
                                            { id: "alhanza_a", name: "Alhanza ALLAMILI", role: "R1L-R/R1L DRE NA", level: "N-6", location: "na", avatar: "AA", reports: [] },
                                            { id: "jason_k", name: "Jason KATO", role: "R1L TPM NA", level: "N-6", location: "na", avatar: "JK", reports: [] }
                                        ]
                                    }
                                ]
                            },
                            {
                                id: "gabriel",
                                name: "Gabriel ESTEVES",
                                role: "Cluster and Displays & SA SWF",
                                level: "N-5",
                                location: "sa",
                                avatar: "GE",
                                reports: [
                                    {
                                        id: "cluster_sw_mgt",
                                        name: "Cluster SW Management",
                                        role: "Project & Scrum Management",
                                        level: "N-6 Group",
                                        location: "sa",
                                        avatar: "SM",
                                        reports: [
                                            { id: "anderson_m", name: "Anderson Morelli", role: "SW Integrator", level: "N-6", location: "sa", avatar: "AM", reports: [] },
                                            { id: "eric_l", name: "Eric Lovera", role: "Product Owner (ext)", level: "N-6", location: "sa", avatar: "EL", reports: [] },
                                            { id: "caio_p", name: "Caio Paulino", role: "Product Owner (ext)", level: "N-6", location: "sa", avatar: "CP", reports: [] },
                                            { id: "tiago_c", name: "Tiago Comin", role: "Scrum Master (ext)", level: "N-6", location: "sa", avatar: "TC", reports: [] },
                                            { id: "eron_m", name: "Eron Muniz", role: "Intern", level: "N-6", location: "sa", avatar: "EM", reports: [] }
                                        ]
                                    },
                                    {
                                        id: "cluster_features_logic",
                                        name: "Cluster Features Logic SW",
                                        role: "SW Architecture & Validation",
                                        level: "N-6 Group",
                                        location: "sa",
                                        avatar: "FL",
                                        reports: [
                                            { id: "bruno_s", name: "Bruno Soares", role: "SW Architect Lead", level: "N-6", location: "sa", avatar: "BS", reports: [] },
                                            { id: "guilherme_d", name: "Guilherme Doxa", role: "SW Architect", level: "N-6", location: "sa", avatar: "GD", reports: [] },
                                            { id: "mara_h", name: "Mara Hermenegildo", role: "SW Architect", level: "N-6", location: "sa", avatar: "MH", reports: [] },
                                            { id: "samuel_r", name: "Samuel Rocha", role: "SW Architect", level: "N-6", location: "sa", avatar: "SR", reports: [] },
                                            { id: "bruna_m", name: "Bruna Miskalo", role: "Issue Manager (ext)", level: "N-6", location: "sa", avatar: "BM", reports: [] },
                                            { id: "pedro_s", name: "Pedro dos Santos", role: "Issue Manager (ext)", level: "N-6", location: "sa", avatar: "PS", reports: [] },
                                            { id: "roberto_a", name: "Roberto Alves", role: "SW Unit Validation (ext)", level: "N-6", location: "sa", avatar: "RA", reports: [] },
                                            { id: "cristian_f", name: "Cristian Fernandes", role: "SW Unit Validation (ext)", level: "N-6", location: "sa", avatar: "CF", reports: [] },
                                            { id: "stenio_d", name: "Stenio Duarte", role: "SW Unit Validation (ext)", level: "N-6", location: "sa", avatar: "SD", reports: [] },
                                            { id: "filipe_l", name: "Filipe Lopes", role: "Developer (ext)", level: "N-6", location: "sa", avatar: "FL", reports: [] },
                                            { id: "giovana_v", name: "Giovana Vieira", role: "Developer (ext)", level: "N-6", location: "sa", avatar: "GV", reports: [] },
                                            { id: "igor_q", name: "Igor Quaresma", role: "Developer (ext)", level: "N-6", location: "sa", avatar: "IQ", reports: [] },
                                            { id: "lucas_n", name: "Lucas Nacif", role: "Developer (ext)", level: "N-6", location: "sa", avatar: "LN", reports: [] },
                                            { id: "marcus_sa", name: "Marcus Santos", role: "Developer (ext)", level: "N-6", location: "sa", avatar: "MS", reports: [] }
                                        ]
                                    },
                                    {
                                        id: "cluster_graphics",
                                        name: "Cluster Graphics Features Logic",
                                        role: "Graphic Architecture & Dev",
                                        level: "N-6 Group",
                                        location: "sa",
                                        avatar: "GF",
                                        reports: [
                                            { id: "jean_f", name: "Jean Fonseca", role: "Graphic SW Architect", level: "N-6", location: "sa", avatar: "JF", reports: [] },
                                            { id: "juliana_n", name: "Juliana Neves", role: "Graphic SW Architect", level: "N-6", location: "sa", avatar: "JN", reports: [] },
                                            { id: "gabriela_m", name: "Gabriela Matos", role: "Graphic Developer (ext)", level: "N-6", location: "sa", avatar: "GM", reports: [] },
                                            { id: "pedro_co", name: "Pedro Correa", role: "Graphic Developer (ext)", level: "N-6", location: "sa", avatar: "PC", reports: [] }
                                        ]
                                    },
                                    {
                                        id: "cluster_module_dev",
                                        name: "Cluster Module Development",
                                        role: "DRE Module Engineering",
                                        level: "N-6 Group",
                                        location: "sa",
                                        avatar: "MD",
                                        reports: [
                                            { id: "luis_p", name: "Luis Paulo", role: "Design Release Engineer", level: "N-6", location: "sa", avatar: "LP", reports: [] },
                                            { id: "gil_m", name: "Gil Moreira", role: "Design Release Engineer (ext)", level: "N-6", location: "sa", avatar: "GM", reports: [] },
                                            { id: "gustavo_e", name: "Gustavo Elias", role: "Design Release Engineer (ext)", level: "N-6", location: "sa", avatar: "GE", reports: [] }
                                        ]
                                    }
                                ]
                            },
                            {
                                id: "arthur",
                                name: "Arthur LOTT",
                                role: "Operations, VO & Compliance Lead",
                                level: "N-5",
                                location: "sa",
                                avatar: "AL",
                                reports: [
                                    {
                                        id: "operations_team",
                                        name: "Operations Team",
                                        role: "Business Operations",
                                        level: "N-6 Group",
                                        location: "sa",
                                        avatar: "OP",
                                        reports: [
                                            { id: "thomaz_b", name: "Thomaz BRITO", role: "Operations Specialist (ext)", level: "N-6", location: "sa", avatar: "TB", reports: [] }
                                        ]
                                    },
                                    {
                                        id: "vo_team",
                                        name: "VO Team",
                                        role: "Value Optimization & Lessons Learned",
                                        level: "N-6 Group",
                                        location: "sa",
                                        avatar: "VO",
                                        reports: [
                                            { id: "gustavo_p", name: "Gustavo PIUZANA", role: "VO Pilot & LL (ext)", level: "N-6", location: "sa", avatar: "GP", reports: [] }
                                        ]
                                    },
                                    {
                                        id: "compliance_team",
                                        name: "Compliance Team",
                                        role: "Part Management & Standards",
                                        level: "N-6 Group",
                                        location: "sa",
                                        avatar: "CO",
                                        reports: [
                                            { id: "arthur_l_ai", name: "Arthur LOTT (a.i)", role: "Part Manager", level: "N-6", location: "sa", avatar: "AL", reports: [] }
                                        ]
                                    }
                                ]
                            },
                            {
                                id: "alexandre_p",
                                name: "Alexandre PRATES",
                                role: "HW, MEC & Legacy IVI Lead",
                                level: "N-5",
                                location: "sa",
                                avatar: "AP",
                                reports: [
                                    {
                                        id: "hardware_team",
                                        name: "Hardware Team",
                                        role: "DRE Hardware Engineering",
                                        level: "N-6 Group",
                                        location: "sa",
                                        avatar: "HW",
                                        reports: [
                                            { id: "danien_l", name: "Danien Lopes", role: "DRE Hardware", level: "N-6", location: "sa", avatar: "DL", reports: [] },
                                            { id: "leandro_a", name: "Leandro Aguiar", role: "DRE Hardware", level: "N-6", location: "sa", avatar: "LA", reports: [] },
                                            { id: "joao_g", name: "João Vitor Guimarães", role: "Intern Hardware", level: "N-6", location: "sa", avatar: "JG", reports: [] }
                                        ]
                                    },
                                    {
                                        id: "mechanical_team",
                                        name: "Mechanical Team",
                                        role: "DRE Mechanical & CAD",
                                        level: "N-6 Group",
                                        location: "sa",
                                        avatar: "ME",
                                        reports: [
                                            { id: "rafael_o", name: "Rafael Oliveira", role: "DRE Mechanical (ext)", level: "N-6", location: "sa", avatar: "RO", reports: [] },
                                            { id: "marcus_si", name: "Marcus Silva", role: "CAD Specialist (ext)", level: "N-6", location: "sa", avatar: "MS", reports: [] }
                                        ]
                                    },
                                    {
                                        id: "dre_alexandre",
                                        name: "Design Release Engineering",
                                        role: "DRE IVI & Audio Modules",
                                        level: "N-6 Group",
                                        location: "sa",
                                        avatar: "DR",
                                        reports: [
                                            { id: "maurizio_ba", name: "Maurizio Baggio", role: "DL Tech Reference", level: "N-6", location: "sa", avatar: "MB", reports: [] },
                                            { id: "enrico_g", name: "Enrico Guglielmi", role: "DRE J10 / VP2R / A7+ (ext)", level: "N-6", location: "sa", avatar: "EG", reports: [] },
                                            { id: "giuseppe_p", name: "Giuseppe Panetta", role: "DRE A7+ / A7 (ext)", level: "N-6", location: "sa", avatar: "GP", reports: [] },
                                            { id: "maurizio_bal", name: "Maurizio Ballatore", role: "DRE A7+ / A7 / Giorgio 2.5", level: "N-6", location: "sa", avatar: "MB", reports: [] },
                                            { id: "paolo_l", name: "Paolo Luppo", role: "DRE Smart Audio 1.0 / 2.0", level: "N-6", location: "sa", avatar: "PL", reports: [] },
                                            { id: "venkatesh_u", name: "Venkatesh Umapathy", role: "DRE Crony 1 / Quality IAP", level: "in", avatar: "VU", reports: [] }
                                        ]
                                    }
                                ]
                            },
                            {
                                id: "yu",
                                name: "Yu TIAN",
                                role: "China Partners Development Mgmt Lead",
                                level: "N-5",
                                location: "cn",
                                avatar: "YT",
                                reports: [
                                    {
                                        id: "china_proj_mgt",
                                        name: "Project & Function Management",
                                        role: "Product & Feature Specification",
                                        level: "N-6 Group",
                                        location: "cn",
                                        avatar: "PM",
                                        reports: [
                                            { id: "simin_y", name: "Simin YANG", role: "Project Management", level: "N-6", location: "cn", avatar: "SY", reports: [] },
                                            { id: "qiuhan_y", name: "Qiuhan YI", role: "Function Owner Nav & VR", level: "N-6", location: "cn", avatar: "QY", reports: [] }
                                        ]
                                    },
                                    {
                                        id: "china_proj_exec",
                                        name: "Project Execution",
                                        role: "Delivery & Engineering Release",
                                        level: "N-6 Group",
                                        location: "cn",
                                        avatar: "PE",
                                        reports: [
                                            { id: "shasha_w", name: "Shasha WEN", role: "War Room Leader", level: "N-6", location: "cn", avatar: "SW", reports: [] },
                                            { id: "shengyan_z", name: "Shengyan ZENG", role: "DRE Infotainment", level: "N-6", location: "cn", avatar: "SZ", reports: [] }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: "pranjal",
                        name: "Pranjal CHAKRABORTY",
                        role: "Architecture Digital Cockpit Lead",
                        level: "N-4",
                        location: "in",
                        avatar: "PC",
                        reports: []
                    },
                    {
                        id: "pranay",
                        name: "Pranay NIGAM",
                        role: "Infotainment Lead",
                        level: "N-4",
                        location: "in",
                        avatar: "PN",
                        reports: []
                    },
                    {
                        id: "kannan",
                        name: "Kannan VARADHAN",
                        role: "Driver Info & Digital Cockpit IAP Lead",
                        level: "N-4",
                        location: "in",
                        avatar: "KV",
                        reports: []
                    },
                    {
                        id: "alexandra",
                        name: "Alexandra RHEUME SERT",
                        role: "Chief Modules Engineer (West Europe)",
                        level: "N-4",
                        location: "fr",
                        avatar: "AS",
                        reports: []
                    },
                    {
                        id: "daniele",
                        name: "Daniele DROCCO",
                        role: "Quality Engineering Digital Cockpit",
                        level: "N-4",
                        location: "it",
                        avatar: "DD",
                        reports: []
                    },
                    {
                        id: "walter",
                        name: "Walter HERMSEN",
                        role: "Software Platform Digital Cockpit Lead",
                        level: "N-4",
                        location: "na",
                        avatar: "WH",
                        reports: []
                    },
                    {
                        id: "akshay",
                        name: "Akshay KHANNA",
                        role: "Software Defined Audio & Acoustics",
                        level: "N-4",
                        location: "in",
                        avatar: "AK",
                        reports: []
                    },
                    {
                        id: "andrea",
                        name: "Andrea FIOCCARDI",
                        role: "Inflight Programs & Affordable Cockpit Lead",
                        level: "N-4",
                        location: "it",
                        avatar: "AF",
                        reports: []
                    },
                    {
                        id: "adinath",
                        name: "Adinath JADHAV",
                        role: "Senior Fellow - Digital Cockpit Software",
                        level: "N-4",
                        location: "in",
                        avatar: "AJ",
                        reports: []
                    },
                    {
                        id: "rajesh",
                        name: "Rajesh BISWAL",
                        role: "Self Service Feature Configuration Lead",
                        level: "N-4",
                        location: "in",
                        avatar: "RB",
                        reports: []
                    },
                    {
                        id: "souvik",
                        name: "Souvik DATTA",
                        role: "Digital Cockpit Cyber Security Lead",
                        level: "N-4",
                        location: "in",
                        avatar: "SD",
                        reports: []
                    },
                    {
                        id: "lora",
                        name: "Lora VEDDER",
                        role: "Premium Infotainment & NA TC Lead",
                        level: "N-4",
                        location: "na",
                        avatar: "LV",
                        reports: []
                    },
                    {
                        id: "laurent",
                        name: "Laurent MAURY",
                        role: "Displays & Cluster, HUD Modules Lead",
                        level: "N-4",
                        location: "fr",
                        avatar: "LM",
                        reports: []
                    },
                    {
                        id: "jesse",
                        name: "Jesse SAIER",
                        role: "Digital Cockpit NA TC Domain Lead",
                        level: "N-4",
                        location: "na",
                        avatar: "JS",
                        reports: []
                    },
                    {
                        id: "jochen",
                        name: "Jochen STOLL",
                        role: "Digital Cockpit EMEA TC Domain Lead",
                        level: "N-4",
                        location: "de",
                        avatar: "JS",
                        reports: []
                    },
                    {
                        id: "alexandre_f",
                        name: "Alexandre FROMION",
                        role: "Senior Fellow - Digital Cockpit",
                        level: "N-4",
                        location: "fr",
                        avatar: "AF",
                        reports: []
                    }
                ]
            },
            {
                id: "ankur",
                name: "Ankur VACHHANI",
                role: "Connected Services & Apps Lead",
                level: "N-3",
                location: "in",
                avatar: "AV",
                reports: []
            },
            {
                id: "teresa",
                name: "Teresa HODDER",
                role: "Software PMO & Quality Lead",
                level: "N-3",
                location: "na",
                avatar: "TH",
                reports: []
            },
            {
                id: "marco",
                name: "Marco SAENGER",
                role: "SWE Integration, Verification & DevOps Lead",
                level: "N-3",
                location: "de",
                avatar: "MS",
                reports: []
            },
            {
                id: "raj",
                name: "Raj TIWARI",
                role: "AI Platform & Developer Productivity Lead",
                level: "N-3",
                location: "in",
                avatar: "RT",
                reports: []
            },
            {
                id: "pierrick",
                name: "Pierrick PUCHOIS",
                role: "System Software Architecture & Design Lead",
                level: "N-3",
                location: "fr",
                avatar: "PP",
                reports: []
            },
            {
                id: "sylvain",
                name: "Sylvain POLES",
                role: "Solutions Systems & Tech Council Lead",
                level: "N-3",
                location: "fr",
                avatar: "SP",
                reports: []
            },
            {
                id: "tilman",
                name: "Tilman LACKO",
                role: "Navigation Lead",
                level: "N-3",
                location: "de",
                avatar: "TL",
                reports: []
            },
            {
                id: "sri",
                name: "Sri MARUNENI",
                role: "SWE North America Technical Centers Lead",
                level: "N-3",
                location: "na",
                avatar: "SM",
                reports: []
            },
            {
                id: "mauricio",
                name: "Mauricio VIANNA",
                role: "SWE South America TC Lead",
                level: "N-3",
                location: "sa",
                avatar: "MV",
                reports: []
            },
            {
                id: "alexander",
                name: "Alexander BLOBNER",
                role: "SWE EMEA Technical Centers Lead",
                level: "N-3",
                location: "de",
                avatar: "AB",
                reports: []
            },
            {
                id: "aravind",
                name: "Aravind DOSS",
                role: "SWE India Asia Pacific Technical Centers Lead",
                level: "N-3",
                location: "in",
                avatar: "AD",
                reports: []
            },
            {
                id: "zhenquan",
                name: "Zhenquan CHEN",
                role: "SWE China Technical Centers Lead",
                level: "N-3",
                location: "cn",
                avatar: "ZC",
                reports: []
            },
            {
                id: "georgia",
                name: "Georgia WESTPHAL",
                role: "SWE Technical Operations Manager",
                level: "N-3",
                location: "de",
                avatar: "GW",
                reports: []
            }
        ]
    };

    let currentFocusedNodeId = "heiko";
    const hiddenNodeIds = new Set();

    // Função recursiva para achar nó na hierarquia
    function findNodeById(node, id) {
        if (node.id === id) return node;
        for (let child of node.reports) {
            let found = findNodeById(child, id);
            if (found) return found;
        }
        return null;
    }

    // Função recursiva para achar nó pai de um nó na hierarquia
    function findParentNode(rootNode, targetId, parentNode = null) {
        if (rootNode.id === targetId) return parentNode;
        for (let child of rootNode.reports) {
            let found = findParentNode(child, targetId, rootNode);
            if (found) return found;
        }
        return null;
    }

    // Função recursiva para gerar os breadcrumbs do nó focado
    function getBreadcrumbPath(rootNode, targetId, path = []) {
        if (rootNode.id === targetId) {
            return [...path, rootNode];
        }
        for (let child of rootNode.reports) {
            let found = getBreadcrumbPath(child, targetId, [...path, rootNode]);
            if (found) return found;
        }
        return null;
    }

    function renderTree() {
        if (!orgTreeWrapper) return;
        orgTreeWrapper.innerHTML = '';

        // Togglar classe de gerenciamento ativo
        if (typeof isOrgManagementActive !== 'undefined' && isOrgManagementActive) {
            orgTreeWrapper.classList.add('org-manage-active');
        } else {
            orgTreeWrapper.classList.remove('org-manage-active');
        }

        const focusedNode = findNodeById(orgHierarchy, currentFocusedNodeId);
        if (!focusedNode) return;

        let parentNode = findParentNode(orgHierarchy, currentFocusedNodeId);
        if (parentNode && hiddenNodeIds.has(parentNode.id)) {
            parentNode = null;
        }

        // 1. Renderizar Nível Pai (se houver)
        if (parentNode) {
            const parentContainer = document.createElement('div');
            parentContainer.className = 'tree-level-container level-parent';
            parentContainer.innerHTML = `
                <span class="level-label">Nível Superior (Clique para Subir)</span>
                <div class="tree-node parent-node clickable" data-nodeid="${parentNode.id}">
                    <div class="node-avatar bg-gray">${parentNode.avatar}</div>
                    <div class="node-info">
                        <h4>${parentNode.name}</h4>
                        <span>${parentNode.role}</span>
                    </div>
                    <div class="node-actions-bar">
                        <button class="btn-node-action edit" data-nodeid="${parentNode.id}" title="Editar Integrante"><i data-lucide="edit-2"></i></button>
                        <button class="btn-node-action add" data-nodeid="${parentNode.id}" title="Adicionar Subordinado"><i data-lucide="plus"></i></button>
                        <button class="btn-node-action delete" data-nodeid="${parentNode.id}" title="Excluir Integrante"><i data-lucide="trash-2"></i></button>
                    </div>
                    <button class="btn-node-locate" data-location="${parentNode.location || 'sa'}"><i data-lucide="map-pin"></i> ${(parentNode.location || 'sa').toUpperCase()}</button>
                    <button class="btn-node-hide" title="Ocultar Usuário" data-nodeid="${parentNode.id}"><i data-lucide="eye-off"></i></button>
                </div>
            `;
            orgTreeWrapper.appendChild(parentContainer);

            // Conector vertical
            const connector = document.createElement('div');
            connector.className = 'tree-connector';
            orgTreeWrapper.appendChild(connector);
        }

        // 2. Renderizar Nó Focado (Centro)
        const focusedContainer = document.createElement('div');
        focusedContainer.className = 'tree-level-container level-focused';
        focusedContainer.innerHTML = `
            <span class="level-label">Foco Atual</span>
            <div class="tree-node leader-node active" data-nodeid="${focusedNode.id}">
                <div class="node-avatar bg-blue">${focusedNode.avatar}</div>
                <div class="node-info">
                    <h4>${focusedNode.name}</h4>
                    <span>${focusedNode.role}</span>
                </div>
                <div class="node-actions-bar">
                    <button class="btn-node-action edit" data-nodeid="${focusedNode.id}" title="Editar Integrante"><i data-lucide="edit-2"></i></button>
                    <button class="btn-node-action add" data-nodeid="${focusedNode.id}" title="Adicionar Subordinado"><i data-lucide="plus"></i></button>
                    <button class="btn-node-action delete" data-nodeid="${focusedNode.id}" title="Excluir Integrante"><i data-lucide="trash-2"></i></button>
                </div>
                <button class="btn-node-locate" data-location="${focusedNode.location || 'sa'}"><i data-lucide="map-pin"></i> ${(focusedNode.location || 'sa').toUpperCase()}</button>
                <button class="btn-node-hide" title="Ocultar Usuário" data-nodeid="${focusedNode.id}"><i data-lucide="eye-off"></i></button>
            </div>
        `;
        orgTreeWrapper.appendChild(focusedContainer);

        // 3. Renderizar Subordinados (se houver)
        const visibleReports = (focusedNode.reports || []).filter(child => !hiddenNodeIds.has(child.id));

        if (visibleReports.length > 0) {
            // Conector vertical
            const connector2 = document.createElement('div');
            connector2.className = 'tree-connector';
            orgTreeWrapper.appendChild(connector2);

            const childContainer = document.createElement('div');
            childContainer.className = 'tree-level-container level-reports';
            childContainer.innerHTML = `<span class="level-label">Subordinados Diretos (Clique no card para aprofundar)</span>`;
            
            const row = document.createElement('div');
            row.className = 'nodes-row';
            if (visibleReports.length > 3) {
                row.classList.add('flex-four');
            }

            visibleReports.forEach(child => {
                const nodeDiv = document.createElement('div');
                const isClickable = child.reports && child.reports.length > 0;
                nodeDiv.className = `tree-node ${isClickable ? 'clickable' : ''}`;
                nodeDiv.setAttribute('data-nodeid', child.id);

                nodeDiv.innerHTML = `
                    <div class="node-avatar bg-gray">${child.avatar}</div>
                    <div class="node-info">
                        <h4>${child.name}</h4>
                        <span>${child.role}</span>
                    </div>
                    <div class="node-actions-bar">
                        <button class="btn-node-action edit" data-nodeid="${child.id}" title="Editar Integrante"><i data-lucide="edit-2"></i></button>
                        <button class="btn-node-action add" data-nodeid="${child.id}" title="Adicionar Subordinado"><i data-lucide="plus"></i></button>
                        <button class="btn-node-action delete" data-nodeid="${child.id}" title="Excluir Integrante"><i data-lucide="trash-2"></i></button>
                    </div>
                    ${isClickable ? '<span class="node-expand-tag">Ver Equipe</span>' : ''}
                    <button class="btn-node-locate" data-location="${child.location || 'sa'}"><i data-lucide="map-pin"></i> ${(child.location || 'sa').toUpperCase()}</button>
                    <button class="btn-node-hide" title="Ocultar Usuário" data-nodeid="${child.id}"><i data-lucide="eye-off"></i></button>
                `;
                row.appendChild(nodeDiv);
            });

            childContainer.appendChild(row);
            orgTreeWrapper.appendChild(childContainer);
        }

        // Registrar Eventos de cliques nos nós para drill-down
        const nodes = orgTreeWrapper.querySelectorAll('.tree-node');
        nodes.forEach(n => {
            n.addEventListener('click', (e) => {
                if (e.target.closest('.btn-node-locate') || e.target.closest('.btn-node-hide') || e.target.closest('.node-actions-bar')) return;

                const nodeId = n.getAttribute('data-nodeid');
                const targetNode = findNodeById(orgHierarchy, nodeId);
                if (targetNode && ((targetNode.reports && targetNode.reports.length > 0) || n.classList.contains('parent-node'))) {
                    currentFocusedNodeId = nodeId;
                    renderTree();
                }
            });
        });

        // Registrar eventos nos botões de localização
        const locateBtns = orgTreeWrapper.querySelectorAll('.btn-node-locate');
        locateBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const loc = btn.getAttribute('data-location');
                const mapSelectorBtn = document.querySelector('.org-view-btn[data-orgview="map"]');
                if (mapSelectorBtn) mapSelectorBtn.click();
                const targetPin = document.querySelector(`.map-pin-pulse[data-pinloc="${loc}"]`);
                if (targetPin) {
                    setTimeout(() => {
                        targetPin.click();
                        targetPin.style.transform = 'translate(-50%, -50%) scale(1.6)';
                        setTimeout(() => { targetPin.style.transform = 'translate(-50%, -50%) scale(1)'; }, 300);
                    }, 350);
                }
            });
        });

        // Registrar eventos nos botões de ocultação (olho)
        const hideBtns = orgTreeWrapper.querySelectorAll('.btn-node-hide');
        hideBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const nodeId = btn.getAttribute('data-nodeid');
                hiddenNodeIds.add(nodeId);

                // Se o nó ocultado for o focado atual, redefine o foco para o pai ou heiko
                if (currentFocusedNodeId === nodeId) {
                    const parent = findParentNode(orgHierarchy, nodeId);
                    currentFocusedNodeId = parent ? parent.id : "heiko";
                }

                renderTree();
            });
        });

        // Vincular ações da barra de edição
        const editBtns = orgTreeWrapper.querySelectorAll('.btn-node-action.edit');
        editBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const nodeId = btn.getAttribute('data-nodeid');
                openEditOrgNodeModal(nodeId);
            });
        });

        const addBtns = orgTreeWrapper.querySelectorAll('.btn-node-action.add');
        addBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const nodeId = btn.getAttribute('data-nodeid');
                openAddOrgNodeModal(nodeId);
            });
        });

        const deleteBtns = orgTreeWrapper.querySelectorAll('.btn-node-action.delete');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const nodeId = btn.getAttribute('data-nodeid');
                if (confirm('Tem certeza que deseja excluir este integrante da hierarquia? Isso também removerá todos os seus subordinados!')) {
                    deleteOrgNode(nodeId);
                }
            });
        });

        // Atualizar Breadcrumbs
        renderBreadcrumbs();
        lucide.createIcons();
    }

    // Renderizar Breadcrumbs (Caminho)
    function renderBreadcrumbs() {
        if (!orgBreadcrumbs) return;
        orgBreadcrumbs.innerHTML = '';

        const path = getBreadcrumbPath(orgHierarchy, currentFocusedNodeId);
        if (!path) return;

        // Container flexível para os itens
        const listContainer = document.createElement('div');
        listContainer.className = 'org-breadcrumbs-list';

        path.forEach((node, idx) => {
            const isLast = idx === path.length - 1;
            const item = document.createElement('span');
            item.className = `org-breadcrumb-item ${isLast ? 'active' : ''}`;
            item.textContent = node.name.split(' ')[0]; // Apenas o primeiro nome
            item.title = node.name;
            item.setAttribute('data-nodeid', node.id);

            item.addEventListener('click', () => {
                currentFocusedNodeId = node.id;
                renderTree();
            });

            listContainer.appendChild(item);

            if (!isLast) {
                const sep = document.createElement('span');
                sep.className = 'org-breadcrumb-sep';
                sep.textContent = '>';
                listContainer.appendChild(sep);
            }
        });

        orgBreadcrumbs.appendChild(listContainer);

        // Se houver nós ocultados, adiciona o botão de restaurar no lado direito
        if (hiddenNodeIds.size > 0) {
            const restoreBtn = document.createElement('button');
            restoreBtn.className = 'btn-restore-hidden';
            restoreBtn.innerHTML = `<i data-lucide="eye"></i> Restaurar Equipe (${hiddenNodeIds.size})`;
            restoreBtn.addEventListener('click', () => {
                hiddenNodeIds.clear();
                renderTree();
            });
            orgBreadcrumbs.appendChild(restoreBtn);
        }
    }

    // Dados das localidades no mapa
    const locationDetailsData = {
        sa: {
            title: "América do Sul (Brasil)",
            subtitle: "Technical Center Betim / Goiana",
            internal: 37,
            external: 38,
            total: 75,
            team: [
                { name: "Mauricio VIANNA", role: "SWE South America TC Lead", type: "Internal" },
                { name: "Fernando ATAIDE", role: "Entry Infotainment & SA TC Domain Lead", type: "Internal" },
                { name: "Saulo CARVALHO", role: "Projection Certification & Legacy IVI", type: "Internal" },
                { name: "Breno TEIXEIRA", role: "Core Module & SA Project Execution", type: "Internal" },
                { name: "Heber SANTOS", role: "R1Low Requirements Management", type: "Internal" },
                { name: "Gabriel ESTEVES", role: "Cluster and Displays & SA SWF", type: "Internal" },
                { name: "Carlos Aquino", role: "Global Tech Lead SPEC", type: "Internal" },
                { name: "Romulo BERTU", role: "Global Tech Lead Module Execution", type: "Internal" },
                { name: "Hagatha JULIATO", role: "Cyber & Apps Lead", type: "Internal" },
                { name: "Antoniel GRAVINA", role: "Component Leader", type: "External" },
                { name: "Eduardo BIANUCCI", role: "Component Designer", type: "External" },
                { name: "Daniel SANTANA", role: "Component Designer", type: "External" }
            ]
        },
        na: {
            title: "América do Norte (Detroit/EUA)",
            subtitle: "Auburn Hills Technical Center",
            internal: 2,
            external: 0,
            total: 2,
            team: [
                { name: "Sri MARUNENI", role: "SWE North America Technical Center Lead", type: "Internal" },
                { name: "Lora VEDDER", role: "Premium Infotainment Systems Lead", type: "Internal" },
                { name: "Jesse SAIER", role: "Digital Cockpit NA TC Lead", type: "Internal" }
            ]
        },
        fr: {
            title: "França (Paris)",
            subtitle: "Poissy Technical Center",
            internal: 2,
            external: 0,
            total: 2,
            team: [
                { name: "Alexandra RHEUME SERT", role: "Chief Modules Engineer & West Europe Lead", type: "Internal" },
                { name: "Alexandre FROMION", role: "Senior Fellow - Digital Cockpit", type: "Internal" }
            ]
        },
        it: {
            title: "Itália (Turim)",
            subtitle: "Mirafiori Technical Center",
            internal: 4,
            external: 0,
            total: 4,
            team: [
                { name: "Daniele DROCCO", role: "Quality Engineering Digital Cockpit", type: "Internal" },
                { name: "Andrea FIOCCARDI", role: "Inflight Programs & Affordable Cockpit", type: "Internal" }
            ]
        },
        de: {
            title: "Alemanha & Europa Central",
            subtitle: "Rüsselsheim Technical Center",
            internal: 3,
            external: 1,
            total: 4,
            team: [
                { name: "Heiko SCHILLING", role: "Software Engineering Director (Global)", type: "Internal" },
                { name: "Alexander BLOBNER", role: "SWE EMEA Technical Centers Lead", type: "Internal" },
                { name: "Jochen STOLL", role: "Digital Cockpit EMEA TC Domain Lead", type: "Internal" },
                { name: "Sylvain POLES", role: "Solutions Systems & Tech Council Lead", type: "Internal" }
            ]
        },
        mor: {
            title: "Marrocos (Casablanca)",
            subtitle: "Casablanca Engineering Hub",
            internal: 2,
            external: 0,
            total: 2,
            team: [
                { name: "SWE Morocco Team", role: "Software Platform & IVI Execution", type: "Internal" }
            ]
        },
        in: {
            title: "Índia (Pune)",
            subtitle: "Pune Technical Center",
            internal: 3,
            external: 0,
            total: 3,
            team: [
                { name: "Kannan VARADHAN", role: "Driver Info & Digital Cockpit IAP Lead", type: "Internal" },
                { name: "Aravind DOSS", role: "SWE India Asia Pacific TC Lead", type: "Internal" },
                { name: "Adinath JADHAV", role: "Senior Fellow - Digital Cockpit Software", type: "Internal" }
            ]
        },
        cn: {
            title: "China (Xangai)",
            subtitle: "Shanghai Technical Center",
            internal: 2,
            external: 3,
            total: 5,
            team: [
                { name: "Zhenquan CHEN", role: "SWE China Technical Centers Lead", type: "Internal" },
                { name: "Yu TIAN", role: "China Partners Development Mgmt", type: "Internal" },
                { name: "China SW Partners", role: "External Development Support", type: "External" }
            ]
        }
    };

    // Exibir Detalhes de Localidade no Mapa
    function showLocationDetails(locCode) {
        const data = locationDetailsData[locCode];
        if (!data || !locEmptyState || !locContentArea) return;

        locTitle.textContent = data.title;
        locSubtitle.textContent = data.subtitle;
        statLocInternal.textContent = data.internal;
        statLocExternal.textContent = data.external;
        statLocTotal.textContent = data.total;

        // Limpar e popular lista
        locTeamList.innerHTML = '';
        data.team.forEach(member => {
            const li = document.createElement('li');
            li.className = 'loc-team-member';
            li.innerHTML = `
                <div class="member-info">
                    <h6>${member.name}</h6>
                    <span>${member.role}</span>
                </div>
                <span class="member-role-badge">${member.type === 'Internal' ? 'Interno' : 'Externo'}</span>
            `;
            locTeamList.appendChild(li);
        });

        // Toggle áreas
        locEmptyState.style.display = 'none';
        locContentArea.style.display = 'flex';
    }

    // Listener para Pins do Mapa
    if (mapPins) {
        mapPins.forEach(pin => {
            pin.addEventListener('click', () => {
                const locCode = pin.getAttribute('data-pinloc');
                showLocationDetails(locCode);
            });
        });
    }

    // ========================================================
    // 10. LÓGICA DA CENTRAL DE AUTOMAÇÕES & IA
    // ========================================================
    const automationsData = {
        stellantisgpt: {
            title: "StellantisGPT",
            desc: "Assistente virtual técnico avançado que utiliza uma LLM corporativa dedicada. A ferramenta foi projetada para otimizar os fluxos de consulta da engenharia Stellantis, permitindo encontrar respostas rápidas sobre a arquitetura Android Automotive, diretrizes ESG do Dare Forward 2030, regras de qualidade WCM e manuais de componentes. Conta com RAG (Geração Aumentada por Recuperação) para garantir precisão e segurança nas respostas com dados do setor.",
            techs: ["LLM API", "Python", "LangChain", "Vector DB", "ChromaDB", "HTML5/JS"],
            owner: "Engª Ana Martins",
            ownerDept: "ADAS & AI Division",
            status: "Produção / Protótipo Funcional",
            link: "#" // Redireciona via JS para o Chat IA
        },
        testgenai: {
            title: "TestGen-AI",
            desc: "Sistema automatizado baseado em inteligência artificial generativa que varre as páginas de requisitos técnicos do Confluence. A IA mapeia fluxos de navegação e gera automaticamente roteiros de testes de QA e scripts executáveis em Python/Appium prontos para rodar nas bancadas físicas de infotainment (IVI), reduzindo o tempo de criação de testes de regressão em até 70%.",
            techs: ["OpenAI GPT-4o API", "Python", "Confluence API", "Appium", "Pytest", "Docker"],
            owner: "Breno Teixeira",
            ownerDept: "SA Project Execution",
            status: "Beta / Em Validação",
            link: "https://testgen.betim.exemplo.interno"
        },
        cananalyzer: {
            title: "CAN-Analyzer AI",
            desc: "Ferramenta de análise inteligente conectada diretamente aos barramentos de rede CAN e redes Ethernet dos veículos Stellantis. Utiliza algoritmos de Machine Learning supervisionados para classificar e prever falhas de barramento, atrasos de clock no envio de mensagens de display de cluster, mensagens corrompidas e telemetria anormal durante testes de pista de protótipos em Betim.",
            techs: ["Python", "Scikit-Learn", "XGBoost", "Pandas", "Vector CANoe API", "C++"],
            owner: "Dr. Enzo Nogueira",
            ownerDept: "Bio-Hybrid Flex",
            status: "Homologado / Em Operação",
            link: "https://can-analyzer.exemplo.interno"
        },
        poweroptai: {
            title: "PowerOpt-AI",
            desc: "Algoritmo de Aprendizado por Reforço (Reinforcement Learning) embarcado nos microcontroladores da eTCU (unidade de transmissão) dos modelos Bio-Hybrid. O modelo de IA analisa dinamicamente o comportamento de aceleração do motorista, prevê necessidades de torque de partida e gerencia com inteligência milimétrica quando o motor elétrico de 48V de 3 kW deve atuar ou regenerar carga para a bateria de lítio.",
            techs: ["TensorFlow Lite", "C++", "Q-Learning", "Embedded C", "Matlab Simulink"],
            owner: "Engª Ana Martins",
            ownerDept: "ADAS & AI Division",
            status: "Em Desenvolvimento",
            link: "" // Sem link
        }
    };

    const modalAutomationDetails = document.getElementById('modalAutomationDetails');
    const automationModalTitle = document.getElementById('automationModalTitle');
    const automationModalDesc = document.getElementById('automationModalDesc');
    const automationModalTechs = document.getElementById('automationModalTechs');
    const automationModalOwner = document.getElementById('automationModalOwner');
    const automationModalStatus = document.getElementById('automationModalStatus');
    const btnLinkAutomation = document.getElementById('btnLinkAutomation');
    const btnContactAutomationOwner = document.getElementById('btnContactAutomationOwner');
    const btnCloseAutomationModal = document.getElementById('btnCloseAutomationModal');
    const btnCancelAutomationModal = document.getElementById('btnCancelAutomationModal');

    let activeAutomationProj = null;

    function openAutomationModal(projId) {
        const data = automationsData[projId];
        if (!data || !modalAutomationDetails) return;

        activeAutomationProj = data;

        automationModalTitle.textContent = data.title;
        automationModalDesc.textContent = data.desc;
        
        // Renderizar tecnologias
        if (automationModalTechs) {
            automationModalTechs.innerHTML = '';
            data.techs.forEach(t => {
                const badge = document.createElement('span');
                badge.className = 'highlight-tag';
                badge.style.cssText = 'background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.08); color: var(--text-muted); font-size: 11px; padding: 4px 10px; border-radius: 6px; margin-right: 4px; margin-bottom: 4px;';
                badge.textContent = t;
                automationModalTechs.appendChild(badge);
            });
        }

        // Renderizar responsável e status
        if (automationModalOwner) {
            automationModalOwner.innerHTML = `<i data-lucide="user" style="width: 14px; height: 14px; color: var(--secondary); display: inline-block; vertical-align: middle; margin-right: 4px;"></i> ${data.owner}`;
        }
        if (automationModalStatus) {
            let statusColor = '#eab308'; // Amarelo para Desenvolvimento
            if (data.status.includes('Produção') || data.status.includes('Operação')) {
                statusColor = '#10b981'; // Verde
            } else if (data.status.includes('Beta')) {
                statusColor = '#60a5fa'; // Azul
            }
            automationModalStatus.innerHTML = `<span style="background-color: ${statusColor}; box-shadow: 0 0 6px ${statusColor}; width:6px; height:6px; border-radius:50%; display:inline-block; vertical-align: middle; margin-right: 4px;"></span> ${data.status}`;
        }

        // Configurar botão de link
        if (btnLinkAutomation) {
            if (data.link === '') {
                btnLinkAutomation.style.display = 'none';
            } else {
                btnLinkAutomation.style.display = 'flex';
                btnLinkAutomation.href = data.link;
            }
        }

        modalAutomationDetails.classList.add('open');
        lucide.createIcons();
    }

    function closeAutomationModal() {
        if (modalAutomationDetails) {
            modalAutomationDetails.classList.remove('open');
        }
    }

    // Registrar clique nos cards de automação
    document.querySelectorAll('.automation-card').forEach(card => {
        card.addEventListener('click', () => {
            const projId = card.getAttribute('data-projid');
            openAutomationModal(projId);
        });
    });

    if (btnCloseAutomationModal) btnCloseAutomationModal.addEventListener('click', closeAutomationModal);
    if (btnCancelAutomationModal) btnCancelAutomationModal.addEventListener('click', closeAutomationModal);
    if (modalAutomationDetails) {
        modalAutomationDetails.addEventListener('click', (e) => {
            if (e.target === modalAutomationDetails) {
                closeAutomationModal();
            }
        });
    }

    // Botão de link para redirecionamento do StellantisGPT
    if (btnLinkAutomation) {
        btnLinkAutomation.addEventListener('click', (e) => {
            if (activeAutomationProj && activeAutomationProj.link === '#') {
                e.preventDefault();
                closeAutomationModal();
                switchSection('chat-ia');
            }
        });
    }

    // Botão conversar com o responsável
    if (btnContactAutomationOwner) {
        btnContactAutomationOwner.addEventListener('click', () => {
            if (!activeAutomationProj) return;

            closeAutomationModal();
            switchSection('chat-ia');

            if (chatInputGpt) {
                chatInputGpt.value = `Olá! Gostaria de conversar com o ${activeAutomationProj.owner} (${activeAutomationProj.ownerDept}) sobre o projeto de IA "${activeAutomationProj.title}". Você poderia me explicar o status e como posso colaborar?`;
                chatInputGpt.focus();
            }
        });
    }

    // Inicializar a árvore organizacional drill-down
    renderTree();

    // Exportar funções do painel de ideias globalmente para que car-interactivity possa usar
    window.openIdeaModal = function(componentName) {
        const modal = document.getElementById('modalIdea');
        const targetLabel = document.getElementById('modalComponentTarget');
        if (modal && targetLabel) {
            targetLabel.textContent = componentName;
            modal.classList.add('open');
        }
    };

    // ========================================================
    // 17. KIT COLABORADOR INTERATIVO (CARDS & POPUPS)
    // ========================================================
    const defaultKitItems = [
        {
            id: 'kit-1',
            title: "Checklist de Acessos",
            icon: "check-square",
            color: "#3b82f6",
            bgColor: "rgba(59, 130, 246, 0.1)",
            borderColor: "rgba(59, 130, 246, 0.2)",
            desc: "Siga o passo a passo inicial para configurar seu ambiente de desenvolvimento e crachá.",
            content: `
                <p style="margin-bottom: 12px; font-weight: 600; color: var(--text-main);">Para garantir a liberação rápida do seu ambiente de trabalho no primeiro dia, execute os seguintes passos:</p>
                <ul style="margin: 0; padding-left: 20px; line-height: 2.0; color: var(--text-muted);">
                    <li style="margin-bottom: 6px;"><strong>Retirar Crachá</strong>: Dirija-se ao posto de segurança principal Betim ou de sua filial portando documento oficial com foto.</li>
                    <li style="margin-bottom: 6px;"><strong>Ativar Conta AD</strong>: Utilize as credenciais corporativas e a senha temporária enviadas pelo RH para seu e-mail pessoal.</li>
                    <li style="margin-bottom: 6px;"><strong>Configurar MFA (Multi-Factor Authentication)</strong>: Instale o aplicativo Microsoft Authenticator em seu celular para a dupla autenticação.</li>
                    <li style="margin-bottom: 6px;"><strong>Conectar à VPN</strong>: Abra o cliente VPN Zscaler Client Connector instalado na sua máquina para acessar a rede interna.</li>
                    <li style="margin-bottom: 6px;"><strong>Instalar Softwares Base</strong>: Acesse o catálogo da Stellantis Software Center e instale as ferramentas necessárias homologadas (ex: VS Code, Teams, Git).</li>
                </ul>
            `,
            links: []
        },
        {
            id: 'kit-2',
            title: "Portais e Ferramentas",
            icon: "external-link",
            color: "#10b981",
            bgColor: "rgba(16, 185, 129, 0.1)",
            borderColor: "rgba(16, 185, 129, 0.2)",
            desc: "Links rápidos para portais de RH, Service Desk de TI e Gitlab da Engenharia.",
            content: `
                <p style="margin-bottom: 12px; font-weight: 600; color: var(--text-main);">Acesse rapidamente os portais e sistemas corporativos mais utilizados na engenharia e no RH da Stellantis:</p>
            `,
            links: [
                { text: "People Portal (Portal do Colaborador & Benefícios)", url: "https://people.exemplo.interno" },
                { text: "Service Desk TI (Abertura de chamados e suporte)", url: "https://servicedesk.exemplo.interno" },
                { text: "GitLab Engenharia (Repositórios de Software de Infotainment)", url: "https://gitlab.exemplo.interno" }
            ]
        },
        {
            id: 'kit-3',
            title: "Espaço do Estagiário",
            icon: "graduation-cap",
            color: "#a855f7",
            bgColor: "rgba(168, 85, 247, 0.1)",
            borderColor: "rgba(168, 85, 247, 0.2)",
            desc: "Instruções exclusivas, relatórios semestrais e termos de atividade obrigatórios.",
            content: `
                <p style="margin-bottom: 12px; font-weight: 600; color: var(--text-main);">Se você ingressou na Stellantis como estagiário, atente-se às obrigações legais de seu programa:</p>
                <ul style="margin: 0; padding-left: 20px; line-height: 2.0; color: var(--text-muted);">
                    <li style="margin-bottom: 6px;"><strong>Agente de Integração (CIEE)</strong>: Monitore o recebimento de seus termos de compromisso digitais e certifique-se de mantê-los assinados.</li>
                    <li style="margin-bottom: 6px;"><strong>Plano de Atividades (PAE)</strong>: Preencha com o auxílio do seu supervisor técnico nos primeiros 15 dias e envie assinado ao CIEE.</li>
                    <li style="margin-bottom: 6px;"><strong>Relatório de Estágio (RAE)</strong>: Documento semestral obrigatório onde você relata suas atividades e aprendizados práticos na engenharia.</li>
                    <li style="margin-bottom: 6px;"><strong>Treinamentos de Integração</strong>: Complete de forma mandatória os cursos de LGPD e segurança da informação.</li>
                </ul>
            `,
            links: [
                { text: "Acessar Portal CIEE", url: "https://portal.ciee.org.br" }
            ]
        },
        {
            id: 'kit-4',
            title: "Canais de Comunicação",
            icon: "message-square",
            color: "#14b8a6",
            bgColor: "rgba(20, 184, 166, 0.1)",
            borderColor: "rgba(20, 184, 166, 0.2)",
            desc: "Saiba a quem recorrer em caso de dúvidas e confira os canais oficiais do Slack e Teams.",
            content: `
                <p style="margin-bottom: 12px; font-weight: 600; color: var(--text-main);">Entre em contato direto com a comunidade de engenharia através dos nossos canais:</p>
                <ul style="margin: 0; padding-left: 20px; line-height: 2.0; color: var(--text-muted);">
                    <li style="margin-bottom: 6px;"><strong>Slack & Teams</strong>: Entre nos canais <code>#digital-cockpit</code> and <code>#infotainment-lounge</code>. Estes são os pontos principais de troca técnica diária.</li>
                    <li style="margin-bottom: 6px;"><strong>Suporte de TI Betim</strong>: Disque o ramal <strong>2300</strong> no telefone físico do escritório para chamados emergenciais.</li>
                    <li style="margin-bottom: 6px;"><strong>Buddy de Integração</strong>: Lembre-se que você tem um padrinho (Buddy) do seu time designado para responder qualquer dúvida técnica ou de processos. Não hesite em chamá-lo!</li>
                </ul>
            `,
            links: []
        }
    ];

    // Carregar itens do LocalStorage ou inicializar com o padrão
    let kitItems = [];
    try {
        kitItems = JSON.parse(localStorage.getItem('stellantis_kit_items')) || defaultKitItems;
    } catch(e) {
        kitItems = [...defaultKitItems];
    }

    const kitGridContainer = document.getElementById('kitGridContainer');
    const btnOpenAddKitModal = document.getElementById('btnOpenAddKitModal');
    const addKitItemModal = document.getElementById('addKitItemModal');
    const btnCancelAddKitModal = document.getElementById('btnCancelAddKitModal');
    const btnSaveNewKitItem = document.getElementById('btnSaveNewKitItem');
    const btnCloseAddKitModal = document.getElementById('btnCloseAddKitModal');

    const kitDetailsModal = document.getElementById('kitDetailsModal');
    const btnCloseKitDetailsModal = document.getElementById('btnCloseKitDetailsModal');
    const btnCancelKitDetailsModal = document.getElementById('btnCancelKitDetailsModal');
    const kitDetailsTitle = document.getElementById('kitDetailsTitle');
    const kitDetailsContent = document.getElementById('kitDetailsContent');
    const kitDetailsIconContainer = document.getElementById('kitDetailsIconContainer');

    function renderKitItems() {
        if (!kitGridContainer) return;
        kitGridContainer.innerHTML = '';

        kitItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'kit-card';
            card.setAttribute('data-id', item.id);
            
            card.innerHTML = `
                <div class="kit-card-header">
                    <div class="kit-card-icon-container" style="background: ${item.bgColor || 'rgba(6, 182, 212, 0.1)'}; border: 1px solid ${item.borderColor || 'rgba(6, 182, 212, 0.2)'}; color: ${item.color || 'var(--secondary)'};">
                        <i data-lucide="${item.icon}"></i>
                    </div>
                    <h4>${item.title}</h4>
                </div>
                <p>${item.desc}</p>
                <div class="kit-card-footer-info">
                    <span><i data-lucide="help-circle" style="width: 12px; height: 12px;"></i> Clique para ver</span>
                    <span style="font-size: 9px; opacity: 0.6;">Stellantis Onboarding</span>
                </div>
            `;

            // Clique abre o modal de detalhes
            card.addEventListener('click', () => {
                openKitDetailsModal(item);
            });

            kitGridContainer.appendChild(card);
        });

        // Recriar ícones lucide injetados
        lucide.createIcons();
    }

    function openKitDetailsModal(item) {
        if (!kitDetailsModal || !kitDetailsTitle || !kitDetailsContent || !kitDetailsIconContainer) return;
        
        kitDetailsTitle.textContent = item.title;
        
        // Injetar conteúdo principal
        let detailsHtml = item.content;

        // Adicionar botões de links rápidos estruturados caso existam
        if (item.links && item.links.length > 0) {
            detailsHtml += `<div style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 16px;">`;
            item.links.forEach(link => {
                // Formatar link caso não possua protocolo completo para evitar bugs
                let href = link.url;
                if (!href.startsWith('http://') && !href.startsWith('https://') && href !== '#') {
                    href = 'https://' + href;
                }
                detailsHtml += `
                    <a href="${href}" target="_blank" class="btn-primary" style="display: inline-flex; align-items: center; gap: 8px; justify-content: center; padding: 12px; border-radius: 10px; text-decoration: none; font-size: 13px; font-weight: 700; background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.15); color: var(--secondary); transition: all 0.2s;">
                        <i data-lucide="external-link" style="width: 14px; height: 14px;"></i> ${link.text}
                    </a>
                `;
            });
            detailsHtml += `</div>`;
        }

        kitDetailsContent.innerHTML = detailsHtml;
        
        // Estilizar e aplicar ícone do modal
        kitDetailsIconContainer.style.background = item.bgColor || 'rgba(6, 182, 212, 0.1)';
        kitDetailsIconContainer.style.borderColor = item.borderColor || 'rgba(6, 182, 212, 0.2)';
        kitDetailsIconContainer.style.color = item.color || 'var(--secondary)';
        kitDetailsIconContainer.innerHTML = `<i data-lucide="${item.icon}"></i>`;

        kitDetailsModal.classList.add('open');
        lucide.createIcons();
    }

    function closeKitDetailsModal() {
        if (kitDetailsModal) kitDetailsModal.classList.remove('open');
    }

    // Modal de criação
    if (btnOpenAddKitModal && addKitItemModal) {
        btnOpenAddKitModal.addEventListener('click', () => {
            // Reset do formulário
            document.getElementById('inputKitTitle').value = '';
            document.getElementById('inputKitDesc').value = '';
            document.getElementById('textareaKitContent').value = '';
            document.getElementById('selectKitIcon').value = 'check-square';
            
            // Reset dos links
            document.getElementById('inputKitLinkText1').value = '';
            document.getElementById('inputKitLinkUrl1').value = '';
            document.getElementById('inputKitLinkText2').value = '';
            document.getElementById('inputKitLinkUrl2').value = '';
            
            addKitItemModal.classList.add('open');
        });
    }

    function closeAddKitModal() {
        if (addKitItemModal) addKitItemModal.classList.remove('open');
    }

    if (btnCancelAddKitModal) btnCancelAddKitModal.addEventListener('click', closeAddKitModal);
    if (btnCloseAddKitModal) btnCloseAddKitModal.addEventListener('click', closeAddKitModal);
    
    if (btnCloseKitDetailsModal) btnCloseKitDetailsModal.addEventListener('click', closeKitDetailsModal);
    if (btnCancelKitDetailsModal) btnCancelKitDetailsModal.addEventListener('click', closeKitDetailsModal);

    // Fechar modais ao clicar fora
    if (addKitItemModal) {
        addKitItemModal.addEventListener('click', (e) => {
            if (e.target === addKitItemModal) closeAddKitModal();
        });
    }
    if (kitDetailsModal) {
        kitDetailsModal.addEventListener('click', (e) => {
            if (e.target === kitDetailsModal) closeKitDetailsModal();
        });
    }

    // Salvar Novo Item
    if (btnSaveNewKitItem) {
        btnSaveNewKitItem.addEventListener('click', () => {
            const title = document.getElementById('inputKitTitle').value.trim();
            const desc = document.getElementById('inputKitDesc').value.trim();
            const rawContent = document.getElementById('textareaKitContent').value.trim();
            const icon = document.getElementById('selectKitIcon').value;

            // Coleta dos Links Rápidos
            const linkText1 = document.getElementById('inputKitLinkText1').value.trim();
            const linkUrl1 = document.getElementById('inputKitLinkUrl1').value.trim();
            const linkText2 = document.getElementById('inputKitLinkText2').value.trim();
            const linkUrl2 = document.getElementById('inputKitLinkUrl2').value.trim();

            if (!title || !desc || !rawContent) {
                alert('Por favor, preencha todos os campos obrigatórios (Título, Descrição e Instruções)!');
                return;
            }

            // Mapear cores para o ícone
            let color = 'var(--secondary)';
            let bgColor = 'rgba(6, 182, 212, 0.1)';
            let borderColor = 'rgba(6, 182, 212, 0.2)';

            if (icon === 'check-square') {
                color = '#3b82f6';
                bgColor = 'rgba(59, 130, 246, 0.1)';
                borderColor = 'rgba(59, 130, 246, 0.2)';
            } else if (icon === 'external-link') {
                color = '#10b981';
                bgColor = 'rgba(16, 185, 129, 0.1)';
                borderColor = 'rgba(16, 185, 129, 0.2)';
            } else if (icon === 'graduation-cap') {
                color = '#a855f7';
                bgColor = 'rgba(168, 85, 247, 0.1)';
                borderColor = 'rgba(168, 85, 247, 0.2)';
            } else if (icon === 'message-square') {
                color = '#14b8a6';
                bgColor = 'rgba(20, 184, 166, 0.1)';
                borderColor = 'rgba(20, 184, 166, 0.2)';
            } else if (icon === 'book-open') {
                color = '#f59e0b';
                bgColor = 'rgba(245, 158, 11, 0.1)';
                borderColor = 'rgba(245, 158, 11, 0.2)';
            } else if (icon === 'info') {
                color = '#ef4444';
                bgColor = 'rgba(239, 68, 68, 0.1)';
                borderColor = 'rgba(239, 68, 68, 0.2)';
            }

            // Converter quebras de linha para tags <p> caso o usuário não tenha digitado HTML
            let finalContent = rawContent;
            if (!rawContent.includes('<p>') && !rawContent.includes('<li>')) {
                finalContent = rawContent.split('\n').filter(line => line.trim() !== '').map(line => `<p style="margin-bottom: 8px;">${line}</p>`).join('');
            }

            // Montar array de links rápidos válidos
            const links = [];
            if (linkText1 && linkUrl1) {
                links.push({ text: linkText1, url: linkUrl1 });
            }
            if (linkText2 && linkUrl2) {
                links.push({ text: linkText2, url: linkUrl2 });
            }

            const newItem = {
                id: `kit-${Date.now()}`,
                title: title,
                icon: icon,
                color: color,
                bgColor: bgColor,
                borderColor: borderColor,
                desc: desc,
                content: finalContent,
                links: links
            };

            // Salvar na lista e persistir
            kitItems.push(newItem);
            localStorage.setItem('stellantis_kit_items', JSON.stringify(kitItems));

            // Fechar modal e renderizar
            closeAddKitModal();
            renderKitItems();

            // Adicionar pontos de XP por cocriação (gamificação!)
            if (typeof userXp !== 'undefined') {
                userXp += 50;
                localStorage.setItem('stellantis_user_xp', userXp);
                if (typeof updateProfileUI === 'function') updateProfileUI();
            }

            // Registrar na timeline do Perfil
            let currentIdeas = [];
            try {
                currentIdeas = JSON.parse(localStorage.getItem('stellantis_ideas')) || [];
            } catch(e) { currentIdeas = []; }

            const nowStr = new Date().toLocaleString('pt-BR');
            currentIdeas.push({
                title: title,
                type: 'geral',
                desc: `Adicionou o card de informações "${title}" ao Kit do Novo Colaborador corporativo.`,
                date: nowStr
            });
            localStorage.setItem('stellantis_ideas', JSON.stringify(currentIdeas));

            alert(`🎉 Card "${title}" adicionado ao Kit Colaborador!\nVocê ganhou +50 XP por contribuir com o onboarding da equipe!`);
        });
    }

    // Inicializar renderização do Kit
    renderKitItems();

    // ========================================================
    // 18. CANAIS OFICIAIS DE TREINAMENTO (DINÂMICO E POPUPS)
    // ========================================================
    const defaultChannels = [
        {
            id: 'chan-1',
            title: "Stellantis Academy",
            icon: "graduation-cap",
            color: "var(--secondary)",
            bgColor: "rgba(6, 182, 212, 0.1)",
            borderColor: "rgba(6, 182, 212, 0.2)",
            desc: "Plataforma global de capacitação que oferece cursos sobre metodologia WCM, engenharia e qualidade.",
            content: "A Stellantis Academy é a universidade corporativa global do grupo. Nela, você terá acesso a centenas de cursos técnicos e de liderança, incluindo trilhas focadas em engenharia de produto, qualidade de software, calibração mecânica e gerenciamento de projetos ágeis corporativos.",
            url: "https://academy.exemplo.interno"
        },
        {
            id: 'chan-2',
            title: "Stellantis LXP (Cornerstone)",
            icon: "book-open",
            color: "var(--accent)",
            bgColor: "rgba(59, 130, 246, 0.1)",
            borderColor: "rgba(59, 130, 246, 0.2)",
            desc: "Portal de Experiência de Aprendizado contendo as trilhas obrigatórias e cursos corporativos.",
            content: "O portal LXP baseia-se na plataforma Cornerstone. É o local onde você realiza as capacitações regulatórias mandatárias do grupo, como as trilhas de Proteção de Dados (LGPD/GDPR), Segurança Cibernética, ESG (Sustentabilidade), e os regulamentos de integridade e conduta ética corporativa.",
            url: "https://stellantis.csod.com"
        },
        {
            id: 'chan-3',
            title: "Android IVI Documentation",
            icon: "tablet",
            color: "#10b981",
            bgColor: "rgba(16, 185, 129, 0.1)",
            borderColor: "rgba(16, 185, 129, 0.2)",
            desc: "Manuais de engenharia de software para o ecossistema Android Automotive OS (AAOS) das centrais.",
            content: "Aqui você encontra as especificações de engenharia para desenvolvimento no ecossistema Android Automotive OS (AAOS). É a base teórica de software sobre a qual operam os sistemas de infoentretenimento (IVI) modernos de quase toda a frota global da Stellantis.",
            url: "https://source.android.com/devices/automotive"
        },
        {
            id: 'chan-4',
            title: "Stellantis Developer Portal",
            icon: "code-2",
            color: "#f59e0b",
            bgColor: "rgba(245, 158, 11, 0.1)",
            borderColor: "rgba(245, 158, 11, 0.2)",
            desc: "Repositório de APIs, especificações de gateways e barramentos para conectividade e apps.",
            content: "O portal de desenvolvedores centraliza as documentações técnicas de APIs, gateways telemáticos da Stellantis (ex: conectividade veicular via eSIM), protocolos de barramento de dados CAN/Ethernet e ambientes de simulação de hardware para testes automatizados.",
            url: "https://developer.exemplo.interno"
        }
    ];

    let channelItems = [];
    try {
        channelItems = JSON.parse(localStorage.getItem('stellantis_channels')) || defaultChannels;
    } catch(e) {
        channelItems = [...defaultChannels];
    }

    const channelsGridContainer = document.getElementById('channelsGridContainer');
    const btnOpenAddChannelModal = document.getElementById('btnOpenAddChannelModal');
    const addChannelModal = document.getElementById('addChannelModal');
    const btnCancelAddChannelModal = document.getElementById('btnCancelAddChannelModal');
    const btnSaveNewChannel = document.getElementById('btnSaveNewChannel');
    const btnCloseAddChannelModal = document.getElementById('btnCloseAddChannelModal');

    const channelDetailsModal = document.getElementById('channelDetailsModal');
    const btnCloseChannelDetailsModal = document.getElementById('btnCloseChannelDetailsModal');
    const btnCancelChannelDetailsModal = document.getElementById('btnCancelChannelDetailsModal');
    const channelDetailsTitle = document.getElementById('channelDetailsTitle');
    const channelDetailsContent = document.getElementById('channelDetailsContent');
    const channelDetailsIconContainer = document.getElementById('channelDetailsIconContainer');
    const linkChannelAccess = document.getElementById('linkChannelAccess');

    function renderChannels() {
        if (!channelsGridContainer) return;
        channelsGridContainer.innerHTML = '';

        channelItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'channel-card';
            card.setAttribute('data-id', item.id);
            
            card.innerHTML = `
                <div>
                    <div class="channel-card-icon-container" style="background: ${item.bgColor || 'rgba(6, 182, 212, 0.1)'}; border: 1px solid ${item.borderColor || 'rgba(6, 182, 212, 0.2)'}; color: ${item.color || 'var(--secondary)'};">
                        <i data-lucide="${item.icon}"></i>
                    </div>
                    <h4>${item.title}</h4>
                    <p>${item.desc}</p>
                </div>
                <div class="channel-card-footer-info" style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 12px; margin-top: auto;">
                    <span><i data-lucide="help-circle" style="width: 12px; height: 12px;"></i> Detalhes do canal</span>
                    <span style="font-size: 9px; opacity: 0.6;">Stellantis Academy</span>
                </div>
            `;

            card.addEventListener('click', () => {
                openChannelDetailsModal(item);
            });

            channelsGridContainer.appendChild(card);
        });

        lucide.createIcons();
    }

    function openChannelDetailsModal(item) {
        if (!channelDetailsModal || !channelDetailsTitle || !channelDetailsContent || !channelDetailsIconContainer || !linkChannelAccess) return;

        channelDetailsTitle.textContent = item.title;
        channelDetailsContent.innerHTML = item.content;
        
        let href = item.url;
        if (!href.startsWith('http://') && !href.startsWith('https://') && href !== '#') {
            href = 'https://' + href;
        }
        linkChannelAccess.href = href;

        // Estilizar ícone
        channelDetailsIconContainer.style.background = item.bgColor || 'rgba(6, 182, 212, 0.1)';
        channelDetailsIconContainer.style.borderColor = item.borderColor || 'rgba(6, 182, 212, 0.2)';
        channelDetailsIconContainer.style.color = item.color || 'var(--secondary)';
        channelDetailsIconContainer.innerHTML = `<i data-lucide="${item.icon}"></i>`;

        channelDetailsModal.classList.add('open');
        lucide.createIcons();
    }

    function closeChannelDetailsModal() {
        if (channelDetailsModal) channelDetailsModal.classList.remove('open');
    }

    // Modal de cadastro
    if (btnOpenAddChannelModal && addChannelModal) {
        btnOpenAddChannelModal.addEventListener('click', () => {
            document.getElementById('inputChannelTitle').value = '';
            document.getElementById('inputChannelDesc').value = '';
            document.getElementById('inputChannelUrl').value = '';
            document.getElementById('textareaChannelContent').value = '';
            document.getElementById('selectChannelIcon').value = 'graduation-cap';
            addChannelModal.classList.add('open');
        });
    }

    function closeAddChannelModal() {
        if (addChannelModal) addChannelModal.classList.remove('open');
    }

    if (btnCancelAddChannelModal) btnCancelAddChannelModal.addEventListener('click', closeAddChannelModal);
    if (btnCloseAddChannelModal) btnCloseAddChannelModal.addEventListener('click', closeAddChannelModal);
    
    if (btnCloseChannelDetailsModal) btnCloseChannelDetailsModal.addEventListener('click', closeChannelDetailsModal);
    if (btnCancelChannelDetailsModal) btnCancelChannelDetailsModal.addEventListener('click', closeChannelDetailsModal);

    // Fechar ao clicar fora
    if (addChannelModal) {
        addChannelModal.addEventListener('click', (e) => {
            if (e.target === addChannelModal) closeAddChannelModal();
        });
    }
    if (channelDetailsModal) {
        channelDetailsModal.addEventListener('click', (e) => {
            if (e.target === channelDetailsModal) closeChannelDetailsModal();
        });
    }

    // Salvar Novo Canal
    if (btnSaveNewChannel) {
        btnSaveNewChannel.addEventListener('click', () => {
            const title = document.getElementById('inputChannelTitle').value.trim();
            const desc = document.getElementById('inputChannelDesc').value.trim();
            const url = document.getElementById('inputChannelUrl').value.trim();
            const rawContent = document.getElementById('textareaChannelContent').value.trim();
            const icon = document.getElementById('selectChannelIcon').value;

            if (!title || !desc || !url || !rawContent) {
                alert('Por favor, preencha todos os campos obrigatórios!');
                return;
            }

            // Mapear cores para o ícone
            let color = 'var(--secondary)';
            let bgColor = 'rgba(6, 182, 212, 0.1)';
            let borderColor = 'rgba(6, 182, 212, 0.2)';

            if (icon === 'graduation-cap') {
                color = 'var(--secondary)';
                bgColor = 'rgba(6, 182, 212, 0.1)';
                borderColor = 'rgba(6, 182, 212, 0.2)';
            } else if (icon === 'book-open') {
                color = 'var(--accent)';
                bgColor = 'rgba(59, 130, 246, 0.1)';
                borderColor = 'rgba(59, 130, 246, 0.2)';
            } else if (icon === 'tablet') {
                color = '#10b981';
                bgColor = 'rgba(16, 185, 129, 0.1)';
                borderColor = 'rgba(16, 185, 129, 0.2)';
            } else if (icon === 'code-2') {
                color = '#f59e0b';
                bgColor = 'rgba(245, 158, 11, 0.1)';
                borderColor = 'rgba(245, 158, 11, 0.2)';
            } else if (icon === 'link') {
                color = '#14b8a6';
                bgColor = 'rgba(20, 184, 166, 0.1)';
                borderColor = 'rgba(20, 184, 166, 0.2)';
            } else if (icon === 'help-circle') {
                color = '#ef4444';
                bgColor = 'rgba(239, 68, 68, 0.1)';
                borderColor = 'rgba(239, 68, 68, 0.2)';
            }

            // Formatação do conteúdo detalhado
            let finalContent = rawContent;
            if (!rawContent.includes('<p>') && !rawContent.includes('<li>')) {
                finalContent = rawContent.split('\n').filter(line => line.trim() !== '').map(line => `<p style="margin-bottom: 8px;">${line}</p>`).join('');
            }

            const newItem = {
                id: `chan-${Date.now()}`,
                title: title,
                icon: icon,
                color: color,
                bgColor: bgColor,
                borderColor: borderColor,
                desc: desc,
                content: finalContent,
                url: url
            };

            // Salvar na lista e persistir
            channelItems.push(newItem);
            localStorage.setItem('stellantis_channels', JSON.stringify(channelItems));

            closeAddChannelModal();
            renderChannels();

            // Adicionar pontos de XP por cocriação (gamificação!)
            if (typeof userXp !== 'undefined') {
                userXp += 50;
                localStorage.setItem('stellantis_user_xp', userXp);
                if (typeof updateProfileUI === 'function') updateProfileUI();
            }

            // Registrar na timeline do Perfil
            let currentIdeas = [];
            try {
                currentIdeas = JSON.parse(localStorage.getItem('stellantis_ideas')) || [];
            } catch(e) { currentIdeas = []; }

            const nowStr = new Date().toLocaleString('pt-BR');
            currentIdeas.push({
                title: title,
                type: 'geral',
                desc: `Adicionou o portal oficial "${title}" à aba de Canais Oficiais de capacitação técnica.`,
                date: nowStr
            });
            localStorage.setItem('stellantis_ideas', JSON.stringify(currentIdeas));

            alert(`🎉 Canal "${title}" adicionado com sucesso!\nVocê ganhou +50 XP por contribuir com a base de portais da equipe!`);
        });
    }

    // Inicializar renderização dos canais
    renderChannels();

    // ========================================================
    // 19. CORPO TÉCNICO DE ESPECIALISTAS (DINÂMICO)
    // ========================================================
    // Deriva um e-mail corporativo fictício (primeiro.ultimo@exemplo.interno)
    // a partir do nome, removendo acentos e títulos (Dr., Engª, etc.).
    function deriveSpecialistEmail(name) {
        const titles = ['dr.', 'dr', 'dra.', 'dra', 'engª', 'eng.', 'eng', 'sr.', 'sr', 'sra.', 'sra'];
        const parts = (name || '')
            .normalize('NFD').replace(/[̀-ͯ]/g, '') // remove acentos
            .replace(/[^a-zA-Z\s]/g, ' ')                     // remove pontuação/símbolos
            .trim()
            .split(/\s+/)
            .filter(p => p && !titles.includes(p.toLowerCase()));
        if (parts.length === 0) return 'especialista@exemplo.interno';
        const first = parts[0].toLowerCase();
        const last = parts[parts.length - 1].toLowerCase();
        const local = parts.length >= 2 ? `${first}.${last}` : first;
        return `${local}@exemplo.interno`;
    }

    // Garante um e-mail para o link do Teams, derivando do nome quando ausente.
    function getSpecialistEmail(spec) {
        return (spec && spec.email && spec.email.trim()) ? spec.email.trim() : deriveSpecialistEmail(spec ? spec.name : '');
    }

    // Valida um link de chat colado pelo admin (Teams web ou app nativo).
    function isValidChatLink(link) {
        if (!link) return false;
        return /^(https?:\/\/|msteams:)/i.test(link.trim());
    }

    // Resolve o destino do "Contatar Especialista":
    //  1) chatLink válido colado pelo admin -> usa direto;
    //  2) e-mail (informado ou derivado do nome) -> monta deep link do Teams.
    function resolveSpecialistContactUrl(spec) {
        if (spec && isValidChatLink(spec.chatLink)) {
            return spec.chatLink.trim();
        }
        const email = getSpecialistEmail(spec);
        const greeting = `Olá ${spec ? spec.name : ''}, poderia me ajudar com uma dúvida técnica?`;
        return `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(email)}&message=${encodeURIComponent(greeting)}`;
    }

    const defaultSpecialists = [
        {
            id: 'spec-1',
            name: "Dr. Enzo Nogueira",
            role: "Diretor de Propulsão Híbrida",
            dept: "Bio-Hybrid Flex",
            icon: "cpu",
            avatarColor: "blue",
            initials: "EN",
            email: "enzo.nogueira@exemplo.interno",
            bio: "Especialista em calibração de motores flex associados a motores de assistência leve de 48V."
        },
        {
            id: 'spec-2',
            name: "Engª Ana Martins",
            role: "Especialista Sênior em ADAS",
            dept: "Sistemas Inteligentes",
            icon: "eye",
            avatarColor: "cian",
            initials: "AM",
            email: "ana.martins@exemplo.interno",
            bio: "Responsável pela calibração de frenagem de emergência autônoma e fusão de dados radar/câmera."
        },
        {
            id: 'spec-3',
            name: "Carlos Silva",
            role: "Arquiteto de Plataformas Elétricas",
            dept: "Engenharia STLA",
            icon: "battery-charging",
            avatarColor: "green",
            initials: "CS",
            email: "carlos.silva@exemplo.interno",
            bio: "Arquiteto estrutural das plataformas BEV STLA Medium e Large para o mercado latino-americano."
        }
    ];

    let specialists = [];
    try {
        specialists = JSON.parse(localStorage.getItem('stellantis_specialists')) || defaultSpecialists;
    } catch(e) {
        specialists = [...defaultSpecialists];
    }

    const specialistsGridContainer = document.getElementById('specialistsGridContainer');
    const btnOpenAddSpecialistModal = document.getElementById('btnOpenAddSpecialistModal');
    const addSpecialistModal = document.getElementById('addSpecialistModal');
    const btnCancelAddSpecialistModal = document.getElementById('btnCancelAddSpecialistModal');
    const btnSaveNewSpecialist = document.getElementById('btnSaveNewSpecialist');
    const btnCloseAddSpecialistModal = document.getElementById('btnCloseAddSpecialistModal');

    function renderSpecialists() {
        if (!specialistsGridContainer) return;
        specialistsGridContainer.innerHTML = '';

        specialists.forEach(spec => {
            const card = document.createElement('div');
            card.className = 'specialist-card';
            card.setAttribute('data-id', spec.id);

            card.innerHTML = `
                <div class="specialist-avatar-container">
                    <div class="specialist-avatar ${spec.avatarColor || 'blue'}">${spec.initials || 'ST'}</div>
                    <span class="specialist-status active" title="Disponível"></span>
                </div>
                <div class="specialist-info">
                    <h4>${spec.name}</h4>
                    <span class="specialist-role">${spec.role}</span>
                    <span class="specialist-dept"><i data-lucide="${spec.icon || 'user'}"></i> ${spec.dept}</span>
                    <p class="specialist-bio">${spec.bio}</p>
                    <button class="btn-contact-specialist" data-name="${spec.name}" data-dept="${spec.dept}">
                        <i data-lucide="message-square"></i> Contatar Especialista
                    </button>
                </div>
            `;

            // Abrir conversa 1:1 diretamente no Microsoft Teams
            const btnContact = card.querySelector('.btn-contact-specialist');
            if (btnContact) {
                btnContact.addEventListener('click', () => {
                    const targetUrl = resolveSpecialistContactUrl(spec);
                    window.open(targetUrl, '_blank', 'noopener');
                });
            }

            specialistsGridContainer.appendChild(card);
        });

        lucide.createIcons();
    }

    // Controle dos modais de especialistas
    if (btnOpenAddSpecialistModal && addSpecialistModal) {
        btnOpenAddSpecialistModal.addEventListener('click', () => {
            document.getElementById('inputSpecName').value = '';
            document.getElementById('inputSpecRole').value = '';
            document.getElementById('selectSpecDept').value = 'Bio-Hybrid Flex';
            const emailField = document.getElementById('inputSpecEmail');
            if (emailField) emailField.value = '';
            const chatLinkField = document.getElementById('inputSpecChatLink');
            if (chatLinkField) chatLinkField.value = '';
            document.getElementById('inputSpecBio').value = '';
            addSpecialistModal.classList.add('open');
        });
    }

    function closeAddSpecialistModal() {
        if (addSpecialistModal) addSpecialistModal.classList.remove('open');
    }

    if (btnCancelAddSpecialistModal) btnCancelAddSpecialistModal.addEventListener('click', closeAddSpecialistModal);
    if (btnCloseAddSpecialistModal) btnCloseAddSpecialistModal.addEventListener('click', closeAddSpecialistModal);

    if (addSpecialistModal) {
        addSpecialistModal.addEventListener('click', (e) => {
            if (e.target === addSpecialistModal) closeAddSpecialistModal();
        });
    }

    if (btnSaveNewSpecialist) {
        btnSaveNewSpecialist.addEventListener('click', () => {
            const name = document.getElementById('inputSpecName').value.trim();
            const role = document.getElementById('inputSpecRole').value.trim();
            const dept = document.getElementById('selectSpecDept').value;
            const emailField = document.getElementById('inputSpecEmail');
            const emailInput = emailField ? emailField.value.trim() : '';
            const chatLinkField = document.getElementById('inputSpecChatLink');
            const chatLinkInput = chatLinkField ? chatLinkField.value.trim() : '';
            const bio = document.getElementById('inputSpecBio').value.trim();

            if (!name || !role || !bio) {
                alert('Por favor, preencha todos os campos do especialista!');
                return;
            }

            // Cores do avatar com base no departamento
            let avatarColor = 'blue';
            let icon = 'user';
            if (dept.includes('Bio-Hybrid')) {
                avatarColor = 'blue';
                icon = 'cpu';
            } else if (dept.includes('Inteligentes')) {
                avatarColor = 'cian';
                icon = 'eye';
            } else if (dept.includes('STLA')) {
                avatarColor = 'green';
                icon = 'battery-charging';
            } else if (dept.includes('Cockpit')) {
                avatarColor = 'purple';
                icon = 'tv';
            } else if (dept.includes('Acústica')) {
                avatarColor = 'orange';
                icon = 'volume-2';
            } else if (dept.includes('Conectividade')) {
                avatarColor = 'teal';
                icon = 'wifi';
            }

            // Obter iniciais do especialista
            const nameParts = name.split(' ').filter(part => part.toLowerCase() !== 'dr.' && part.toLowerCase() !== 'dr' && part.toLowerCase() !== 'engª' && part.toLowerCase() !== 'eng');
            let initials = 'ST';
            if (nameParts.length >= 2) {
                initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
            } else if (nameParts.length === 1) {
                initials = nameParts[0].substring(0, 2).toUpperCase();
            }

            const newSpec = {
                id: `spec-${Date.now()}`,
                name: name,
                role: role,
                dept: dept,
                icon: icon,
                avatarColor: avatarColor,
                initials: initials,
                email: emailInput || deriveSpecialistEmail(name),
                chatLink: isValidChatLink(chatLinkInput) ? chatLinkInput : '',
                bio: bio
            };

            specialists.push(newSpec);
            localStorage.setItem('stellantis_specialists', JSON.stringify(specialists));

            closeAddSpecialistModal();
            renderSpecialists();

            // Gamificação de XP
            if (typeof userXp !== 'undefined') {
                userXp += 50;
                localStorage.setItem('stellantis_user_xp', userXp);
                if (typeof updateProfileUI === 'function') updateProfileUI();
            }

            // Timeline do Perfil
            let currentIdeas = [];
            try {
                currentIdeas = JSON.parse(localStorage.getItem('stellantis_ideas')) || [];
            } catch(e) { currentIdeas = []; }

            const nowStr = new Date().toLocaleString('pt-BR');
            currentIdeas.push({
                title: name,
                type: 'geral',
                desc: `Adicionou o especialista "${name}" (${role}) ao corpo técnico de engenharia.`,
                date: nowStr
            });
            localStorage.setItem('stellantis_ideas', JSON.stringify(currentIdeas));

            alert(`🎉 Especialista "${name}" adicionado com sucesso!\nVocê ganhou +50 XP por contribuir com a equipe!`);
        });
    }


    // ========================================================
    // 20. COMPONENTES DE INFOTAINMENT (DINÂMICO & POPUPS COM IMAGENS)
    // ========================================================
    const defaultInfotainmentComponents = [
        {
            id: 'info-1',
            title: "Central Uconnect Touch 10.1\"",
            category: "audio-tela",
            supplier: "alfa",
            desc: "Tela de alta definição de 10.1 polegadas com personalização em estilo widget, espelhamento sem fio de celular e múltiplos perfis de usuário.",
            applied: "Compass, Commander, Rampage",
            imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600"
        },
        {
            id: 'info-2',
            title: "Full Digital Cluster 10.25\"",
            category: "audio-tela",
            supplier: "delta",
            desc: "Painel de instrumentos de alta resolução com visualização configurável em 3D, integração de mapa de navegação nativo e leitura ADAS.",
            applied: "Compass, Commander, Rampage",
            imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600"
        },
        {
            id: 'info-3',
            title: "Som Premium Gama Áudio (fictício)",
            category: "audio-tela",
            supplier: "gama",
            desc: "Sistema de som premium de 9 alto-falantes com Subwoofer e amplificador de 360 Watts com tecnologia de áudio surround virtualizado.",
            applied: "Rampage, Commander",
            imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600"
        },
        {
            id: 'info-4',
            title: "Adventure Intelligence",
            category: "conectividade-auxilio",
            supplier: "alfa",
            desc: "Plataforma conectada que possibilita controle remoto de portas, localização, alertas rápidos de pânico automáticos e Wi-Fi nativo a bordo.",
            applied: "Pulse, Fastback, Compass, Commander",
            imageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=600"
        },
        {
            id: 'info-5',
            title: "Wireless Charger com Refrigeração",
            category: "conectividade-auxilio",
            supplier: "delta",
            desc: "Carregador de celular sem fio com sistema de refrigeração de ar ativo para evitar o superaquecimento do smartphone durante a indução.",
            applied: "Rampage, Compass, Commander",
            imageUrl: "https://images.unsplash.com/photo-1584438784894-089d6a128f3e?w=600"
        },
        {
            id: 'info-6',
            title: "Câmeras Multivisão 360°",
            category: "conectividade-auxilio",
            supplier: "beta",
            desc: "Fusão de imagem de quatro câmeras externas simulando uma visão aérea tridimensional para manobras seguras e detecção de obstáculos próximos.",
            applied: "Commander, Rampage (Overland/RT)",
            imageUrl: "https://images.unsplash.com/photo-1508974239320-0a029497e820?w=600"
        }
    ];

    let infotainmentComponents = [];
    try {
        infotainmentComponents = JSON.parse(localStorage.getItem('stellantis_infotainment')) || defaultInfotainmentComponents;
    } catch(e) {
        infotainmentComponents = [...defaultInfotainmentComponents];
    }

    // ----------------------------------------------------------------
    // Taxonomias dinâmicas de Componentes: Categorias e Fornecedores
    // Semeadas a partir das listas fixas e persistidas em localStorage.
    // ----------------------------------------------------------------
    const defaultComponentCategories = [
        { value: 'audio-tela', label: 'Telas & Áudio' },
        { value: 'conectividade-auxilio', label: 'Conectividade & Auxílio' }
    ];
    // Fornecedores Tier-1/Tier-2 — NOMES FICTÍCIOS por decisão de segurança
    // (S9/R5, doc 24 §3 / doc 25 §8): nunca versionar/publicar identidade real
    // de parceiros nem alegações de parceria real com a Stellantis neste
    // protótipo público. Alinhado a `seeds/suppliers.json` (alfa/beta/gama);
    // delta/epsilon/zeta/eta/theta são exclusivos deste mock de exemplo.
    const defaultComponentSuppliers = [
        { value: 'alfa', label: 'Alfa Eletrônica (fictício)', area: 'Conectividade & Elétrica', desc: 'Arquiteturas elétricas, conectividade e software para veículos definidos por software (fornecedor fictício de exemplo).',
          history: 'Fornecedor fictício de exemplo, usado apenas para demonstrar o módulo de Componentes de Infotainment do protótipo.',
          partnership: 'Dado fictício de exemplo: representa um fornecedor genérico de conectividade e arquitetura elétrica, sem relação com empresas reais.' },
        { value: 'delta', label: 'Delta Iluminação e Eletrônica (fictício)', area: 'Eletrônica & Iluminação', desc: 'Eletrônica veicular, sistemas de iluminação, painéis e módulos de infotainment (fornecedor fictício de exemplo).',
          history: 'Fornecedor fictício de exemplo, usado apenas para demonstrar o módulo de Componentes de Infotainment do protótipo.',
          partnership: 'Dado fictício de exemplo: representa um fornecedor genérico de iluminação e eletrônica, sem relação com empresas reais.' },
        { value: 'gama', label: 'Gama Áudio (fictício)', area: 'Áudio & Infotainment', desc: 'Sistemas de áudio premium, infotainment e conectividade embarcada (fornecedor fictício de exemplo).',
          history: 'Fornecedor fictício de exemplo, usado apenas para demonstrar o módulo de Componentes de Infotainment do protótipo.',
          partnership: 'Dado fictício de exemplo: representa um fornecedor genérico de áudio e infotainment, sem relação com empresas reais.' },
        { value: 'beta', label: 'Beta Sistemas Automotivos (fictício)', area: 'Freios & Sensores', desc: 'Sistemas de freios, powertrain, sensores e eletrônica automotiva (fornecedor fictício de exemplo).',
          history: 'Fornecedor fictício de exemplo, usado apenas para demonstrar o módulo de Componentes de Infotainment do protótipo.',
          partnership: 'Dado fictício de exemplo: representa um fornecedor genérico de freios e sensores, sem relação com empresas reais.' },
        { value: 'epsilon', label: 'Épsilon Chassi & ADAS (fictício)', area: 'ADAS & Chassi', desc: 'Sistemas de freios, ADAS e soluções de conectividade e display (fornecedor fictício de exemplo).',
          history: 'Fornecedor fictício de exemplo, usado apenas para demonstrar o módulo de Componentes de Infotainment do protótipo.',
          partnership: 'Dado fictício de exemplo: representa um fornecedor genérico de chassi e ADAS, sem relação com empresas reais.' },
        { value: 'zeta', label: 'Zeta Transmissões (fictício)', area: 'Powertrain & Chassi', desc: 'Transmissões, sistemas de chassi, direção e tecnologias de segurança (fornecedor fictício de exemplo).',
          history: 'Fornecedor fictício de exemplo, usado apenas para demonstrar o módulo de Componentes de Infotainment do protótipo.',
          partnership: 'Dado fictício de exemplo: representa um fornecedor genérico de transmissões e chassi, sem relação com empresas reais.' },
        { value: 'eta', label: 'Eta Térmica (fictício)', area: 'Térmico & ADAS', desc: 'Sistemas térmicos, iluminação, ADAS e eletrificação de powertrain (fornecedor fictício de exemplo).',
          history: 'Fornecedor fictício de exemplo, usado apenas para demonstrar o módulo de Componentes de Infotainment do protótipo.',
          partnership: 'Dado fictício de exemplo: representa um fornecedor genérico de sistemas térmicos, sem relação com empresas reais.' },
        { value: 'theta', label: 'Theta Interiores (fictício)', area: 'Interiores & Cockpit', desc: 'Interiores, assentos, sistemas de escape e eletrônica de cockpit (fornecedor fictício de exemplo).',
          history: 'Fornecedor fictício de exemplo, usado apenas para demonstrar o módulo de Componentes de Infotainment do protótipo.',
          partnership: 'Dado fictício de exemplo: representa um fornecedor genérico de interiores e cockpit, sem relação com empresas reais.' }
    ];

    function slugifyComponentTaxonomy(str) {
        return str.toString().toLowerCase().trim()
            .normalize('NFD').replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    let componentCategories = [];
    let componentSuppliers = [];
    try {
        componentCategories = JSON.parse(localStorage.getItem('stellantis_component_categories')) || [...defaultComponentCategories];
    } catch(e) { componentCategories = [...defaultComponentCategories]; }
    try {
        componentSuppliers = JSON.parse(localStorage.getItem('stellantis_component_suppliers')) || [...defaultComponentSuppliers];
    } catch(e) { componentSuppliers = [...defaultComponentSuppliers]; }
    if (!Array.isArray(componentCategories) || !componentCategories.length) componentCategories = [...defaultComponentCategories];
    if (!Array.isArray(componentSuppliers) || !componentSuppliers.length) componentSuppliers = [...defaultComponentSuppliers];

    // Backfill: garante que os fornecedores semeados existam e tenham metadados (area/desc)
    // para o showcase, sem sobrescrever fornecedores criados pelo usuário.
    defaultComponentSuppliers.forEach(def => {
        const found = componentSuppliers.find(s => s.value === def.value);
        if (!found) {
            componentSuppliers.push({ ...def });
        } else {
            if (!found.area) found.area = def.area;
            if (!found.desc) found.desc = def.desc;
            if (!found.label) found.label = def.label;
            if (!found.history) found.history = def.history;
            if (!found.partnership) found.partnership = def.partnership;
        }
    });

    function persistComponentTaxonomies() {
        localStorage.setItem('stellantis_component_categories', JSON.stringify(componentCategories));
        localStorage.setItem('stellantis_component_suppliers', JSON.stringify(componentSuppliers));
    }
    // Semear no primeiro carregamento para manter as listas visíveis/persistidas
    persistComponentTaxonomies();

    function getComponentCategoryLabel(value) {
        const found = componentCategories.find(c => c.value === value);
        if (found) return found.label;
        // Compatibilidade com valores legados
        if (value === 'conectividade' || value === 'auxilio') return 'Conectividade & Auxílio';
        return value;
    }
    function getComponentSupplierLabel(value) {
        const found = componentSuppliers.find(s => s.value === value);
        return found ? found.label : (value || '').toUpperCase();
    }

    // Renderiza as opções do <select> de Categoria (com ação "+ Categoria" no início)
    function renderComponentCategorySelect(preferredValue) {
        const sel = document.getElementById('selectInfoCategory');
        if (!sel) return;
        const current = preferredValue || sel.value;
        sel.innerHTML =
            '<option value="__add_category__">+ Categoria (cadastrar nova)</option>' +
            componentCategories.map(c => `<option value="${c.value}">${c.label}</option>`).join('');
        if (current && componentCategories.some(c => c.value === current)) {
            sel.value = current;
        } else if (componentCategories[0]) {
            sel.value = componentCategories[0].value;
        }
    }

    // Renderiza as opções do <select> de Fornecedor (com ação "+ Fornecedor" no início)
    function renderComponentSupplierSelect(preferredValue) {
        const sel = document.getElementById('selectInfoSupplier');
        if (!sel) return;
        const current = preferredValue || sel.value;
        sel.innerHTML =
            '<option value="__add_supplier__">+ Fornecedor (cadastrar novo)</option>' +
            componentSuppliers.map(s => `<option value="${s.value}">${s.label}</option>`).join('');
        if (current && componentSuppliers.some(s => s.value === current)) {
            sel.value = current;
        } else if (componentSuppliers[0]) {
            sel.value = componentSuppliers[0].value;
        }
    }

    // Recalcula os filtros ativos a partir dos checkboxes vivos e re-renderiza a grade
    function updateComponentFilters() {
        const cats = [];
        const sups = [];
        document.querySelectorAll('#menuFilterComponent .filter-checkbox').forEach(cb => {
            if (cb.checked) cats.push(cb.getAttribute('data-cat'));
        });
        document.querySelectorAll('#menuFilterSupplier .filter-checkbox').forEach(cb => {
            if (cb.checked) sups.push(cb.getAttribute('data-sup'));
        });
        window.activeCategories = cats;
        window.activeSuppliers = sups;
        const btnC = document.getElementById('btnFilterComponentDropdown');
        const btnS = document.getElementById('btnFilterSupplierDropdown');
        if (btnC) btnC.classList.toggle('active', cats.length < componentCategories.length);
        if (btnS) btnS.classList.toggle('active', sups.length < componentSuppliers.length);
        if (typeof renderInfotainment === 'function') renderInfotainment();
    }

    // (Re)constrói os checkboxes de filtro de Categoria e Fornecedor, preservando marcações
    function renderComponentFilterCheckboxes() {
        const catMenu = document.getElementById('menuFilterComponent');
        const supMenu = document.getElementById('menuFilterSupplier');
        const labelStyle = 'display: flex; align-items: center; gap: 10px; color: var(--text-muted); font-size: 12.5px; cursor: pointer; padding: 6px 8px; border-radius: 6px; transition: background 0.2s;';
        const boxStyle = 'accent-color: var(--secondary); cursor: pointer; width: 14px; height: 14px;';

        // Preservar estado de marcação atual
        const prevCats = {};
        document.querySelectorAll('#menuFilterComponent .filter-checkbox').forEach(cb => { prevCats[cb.getAttribute('data-cat')] = cb.checked; });
        const prevSups = {};
        document.querySelectorAll('#menuFilterSupplier .filter-checkbox').forEach(cb => { prevSups[cb.getAttribute('data-sup')] = cb.checked; });

        if (catMenu) {
            catMenu.innerHTML = componentCategories.map(c => {
                const checked = (prevCats[c.value] !== false) ? 'checked' : '';
                return `<label class="filter-checkbox-label" style="${labelStyle}"><input type="checkbox" ${checked} class="filter-checkbox" data-cat="${c.value}" style="${boxStyle}"><span>${c.label}</span></label>`;
            }).join('');
        }
        if (supMenu) {
            supMenu.innerHTML = componentSuppliers.map(s => {
                const checked = (prevSups[s.value] !== false) ? 'checked' : '';
                return `<label class="filter-checkbox-label" style="${labelStyle}"><input type="checkbox" ${checked} class="filter-checkbox" data-sup="${s.value}" style="${boxStyle}"><span>${s.label}</span></label>`;
            }).join('');
        }
        document.querySelectorAll('#menuFilterComponent .filter-checkbox, #menuFilterSupplier .filter-checkbox').forEach(cb => {
            cb.addEventListener('change', updateComponentFilters);
        });
    }

    // Cadastra uma nova categoria e a seleciona; retorna o value criado (ou existente)
    function addComponentCategory(name) {
        const label = (name || '').trim();
        if (!label) return null;
        let value = slugifyComponentTaxonomy(label);
        if (!value) return null;
        const existing = componentCategories.find(c => c.value === value);
        if (!existing) {
            componentCategories.push({ value, label });
            persistComponentTaxonomies();
            renderComponentFilterCheckboxes();
        }
        renderComponentCategorySelect(value);
        updateComponentFilters();
        return value;
    }

    function addComponentSupplier(name, details) {
        const label = (name || '').trim();
        if (!label) return null;
        let value = slugifyComponentTaxonomy(label);
        if (!value) return null;
        const extra = details || {};
        const existing = componentSuppliers.find(s => s.value === value);
        if (!existing) {
            componentSuppliers.push({ value, label, area: (extra.area || '').trim(), desc: (extra.desc || '').trim(), logo: (extra.logo || '').trim(), history: (extra.history || '').trim(), partnership: (extra.partnership || '').trim() });
            persistComponentTaxonomies();
            renderComponentFilterCheckboxes();
        } else {
            // Enriquecer metadados se vierem do cadastro do showcase
            if (extra.area) existing.area = extra.area.trim();
            if (extra.desc) existing.desc = extra.desc.trim();
            if (extra.logo) existing.logo = extra.logo.trim();
            if (extra.history) existing.history = extra.history.trim();
            if (extra.partnership) existing.partnership = extra.partnership.trim();
            persistComponentTaxonomies();
        }
        renderComponentSupplierSelect(value);
        updateComponentFilters();
        if (typeof renderSuppliersShowcase === 'function') renderSuppliersShowcase();
        return value;
    }

    // ----------------------------------------------------------------
    // Showcase de Fornecedores (fonte unificada: stellantis_component_suppliers)
    // ----------------------------------------------------------------
    function escapeSupplierText(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // Placeholder genérico (sem logotipos de marca) para a imagem no topo das cards de fornecedor
    const SUPPLIER_PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600';

    function renderSuppliersShowcase() {
        const grid = document.getElementById('suppliersGridContainer');
        if (!grid) return;
        grid.innerHTML = '';
        componentSuppliers.forEach(s => {
            const card = document.createElement('div');
            card.className = 'infotainment-card';
            card.setAttribute('data-supplier-value', s.value);
            const label = escapeSupplierText(s.label || s.value);
            const initial = (s.label || s.value || '?').trim().charAt(0).toUpperCase();
            const img = escapeSupplierText((s.logo || '').trim() || SUPPLIER_PLACEHOLDER_IMG);
            const area = escapeSupplierText(s.area || 'Fornecedor Tier-1');
            const desc = escapeSupplierText(s.desc || 'Fornecedor cadastrado no catálogo de Componentes da Stellantis.');
            card.innerHTML = `
                <div class="infotainment-image-container">
                    <img src="${img}" alt="${label}" class="infotainment-image" onerror="this.src='${SUPPLIER_PLACEHOLDER_IMG}'">
                    <span class="infotainment-image-badge">${area}</span>
                </div>
                <div class="infotainment-card-body">
                    <div class="infotainment-card-icon blue" style="overflow:hidden;"><span style="font-size:20px;font-weight:800;">${escapeSupplierText(initial)}</span></div>
                    <div class="infotainment-card-content" style="width:100%;">
                        <h4>${label}</h4>
                        <p>${desc}</p>
                    </div>
                </div>`;
            card.addEventListener('click', () => openSupplierDetailsModal(s));
            grid.appendChild(card);
        });
        if (window.lucide) lucide.createIcons();
    }

    // Modal de detalhes do Fornecedor
    function openSupplierDetailsModal(s) {
        const modal = document.getElementById('supplierDetailsModal');
        if (!modal) return;
        const label = escapeSupplierText(s.label || s.value);
        const area = escapeSupplierText(s.area || 'Fornecedor Tier-1');
        const img = escapeSupplierText((s.logo || '').trim() || SUPPLIER_PLACEHOLDER_IMG);
        const fallbackDesc = s.desc ? escapeSupplierText(s.desc) : 'Sem descrição cadastrada.';
        const history = s.history ? escapeSupplierText(s.history) : fallbackDesc;
        const partnership = s.partnership ? escapeSupplierText(s.partnership) : fallbackDesc;

        const imgEl = document.getElementById('supplierDetailsImg');
        if (imgEl) { imgEl.src = img; imgEl.alt = label; imgEl.setAttribute('onerror', `this.src='${SUPPLIER_PLACEHOLDER_IMG}'`); }
        const titleEl = document.getElementById('supplierDetailsTitle');
        if (titleEl) titleEl.textContent = s.label || s.value;
        const areaEl = document.getElementById('supplierDetailsArea');
        if (areaEl) areaEl.textContent = s.area || 'Fornecedor Tier-1';
        const histEl = document.getElementById('supplierDetailsHistory');
        if (histEl) histEl.innerHTML = history;
        const partEl = document.getElementById('supplierDetailsPartnership');
        if (partEl) partEl.innerHTML = partnership;

        modal.classList.add('open');
        if (window.lucide) lucide.createIcons();
    }
    window.openSupplierDetailsModal = openSupplierDetailsModal;

    const infotainmentGridContainer = document.getElementById('infotainmentGridContainer');
    const btnOpenAddInfotainmentModal = document.getElementById('btnOpenAddInfotainmentModal');
    const addInfotainmentModal = document.getElementById('addInfotainmentModal');
    const btnCancelAddInfotainmentModal = document.getElementById('btnCancelAddInfotainmentModal');
    const btnSaveNewInfotainment = document.getElementById('btnSaveNewInfotainment');
    const btnCloseAddInfotainmentModal = document.getElementById('btnCloseAddInfotainmentModal');

    const infotainmentDetailsModal = document.getElementById('infotainmentDetailsModal');
    const btnCloseInfoDetailsModal = document.getElementById('btnCloseInfoDetailsModal');
    const btnCancelInfoDetailsModal = document.getElementById('btnCancelInfoDetailsModal');
    const infoDetailsTitle = document.getElementById('infoDetailsTitle');
    const infoDetailsSubtitle = document.getElementById('infoDetailsSubtitle');
    const imgInfoDetails = document.getElementById('imgInfoDetails');
    const infoDetailsContent = document.getElementById('infoDetailsContent');
    const infoDetailsAppliedContainer = document.getElementById('infoDetailsAppliedContainer');
    const infoDetailsIconContainer = document.getElementById('infoDetailsIconContainer');

    // Placeholder/fallback para a imagem no topo das cards de componente
    const COMPONENT_PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600';

    window.renderInfotainment = function() {
        if (!infotainmentGridContainer) return;
        infotainmentGridContainer.innerHTML = '';

        // Filtrar com base em múltipla escolha acumulativa
        const filtered = infotainmentComponents.filter(item => {
            let catNorm = item.category;
            if (catNorm === 'conectividade' || catNorm === 'auxilio') {
                catNorm = 'conectividade-auxilio';
            }

            const matchesCategory = (window.activeCategories || []).length === 0 || (window.activeCategories || []).includes(catNorm);
            const matchesSupplier = (window.activeSuppliers || []).length === 0 || (window.activeSuppliers || []).includes(item.supplier);

            return matchesCategory && matchesSupplier;
        });

        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = 'infotainment-card';
            card.setAttribute('data-id', item.id);
            card.setAttribute('data-infocategory', item.category);
            card.setAttribute('data-infosupplier', item.supplier);

            // Ícone representativo
            let icon = 'tablet';
            let iconClass = 'blue';
            if (item.category === 'conectividade-auxilio' || item.category === 'conectividade') {
                icon = 'wifi';
                iconClass = 'green';
            } else if (item.category === 'auxilio') {
                icon = 'compass';
                iconClass = 'cian';
            }

            const compImg = item.imageUrl || COMPONENT_PLACEHOLDER_IMG;
            card.innerHTML = `
                <div class="infotainment-image-container">
                    <img src="${compImg}" alt="${item.title}" class="infotainment-image" onerror="this.src='${COMPONENT_PLACEHOLDER_IMG}'">
                    <span class="infotainment-image-badge">${getComponentCategoryLabel(item.category)}</span>
                </div>
                <div class="infotainment-card-body">
                    <div class="infotainment-card-icon ${iconClass}"><i data-lucide="${icon}"></i></div>
                    <div class="infotainment-card-content" style="width: 100%;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <span class="info-cat-badge">${getComponentCategoryLabel(item.category)}</span>
                            <span style="font-size: 9px; color: var(--secondary); background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.2); padding: 2px 8px; border-radius: 4px; font-weight: 700; text-transform: uppercase;">${getComponentSupplierLabel(item.supplier)}</span>
                        </div>
                        <h4>${item.title}</h4>
                        <p>${item.desc.substring(0, 140)}${item.desc.length > 140 ? '...' : ''}</p>
                        <span class="info-applied">Disponível em: <strong>${item.applied}</strong></span>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => {
                openInfotainmentDetailsModal(item);
            });

            infotainmentGridContainer.appendChild(card);
        });

        lucide.createIcons();
    };

    function openInfotainmentDetailsModal(item) {
        if (!infotainmentDetailsModal || !infoDetailsTitle || !infoDetailsSubtitle || !imgInfoDetails || !infoDetailsContent || !infoDetailsAppliedContainer) return;

        infoDetailsTitle.textContent = item.title;
        infoDetailsSubtitle.textContent = `${getComponentCategoryLabel(item.category)} | Fornecedor: ${getComponentSupplierLabel(item.supplier)}`;
        
        // Tratar imagem
        imgInfoDetails.src = item.imageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600';
        imgInfoDetails.alt = item.title;

        infoDetailsContent.innerHTML = `<p style="margin: 0; line-height: 1.7;">${item.desc}</p>`;
        infoDetailsAppliedContainer.innerHTML = `<strong>Aplicações veiculares homologadas:</strong><br><span style="color: var(--secondary); font-weight: 600;">${item.applied}</span>`;

        // Tratar ícone
        let icon = 'tablet';
        let color = 'var(--secondary)';
        let bgColor = 'rgba(6, 182, 212, 0.1)';
        let borderColor = 'rgba(6, 182, 212, 0.2)';

        if (item.category === 'audio-tela') {
            icon = 'tablet';
            color = '#3b82f6';
            bgColor = 'rgba(59, 130, 246, 0.1)';
            borderColor = 'rgba(59, 130, 246, 0.2)';
        } else {
            icon = 'wifi';
            color = '#10b981';
            bgColor = 'rgba(16, 185, 129, 0.1)';
            borderColor = 'rgba(16, 185, 129, 0.2)';
        }

        if (infoDetailsIconContainer) {
            infoDetailsIconContainer.style.background = bgColor;
            infoDetailsIconContainer.style.borderColor = borderColor;
            infoDetailsIconContainer.style.color = color;
            infoDetailsIconContainer.innerHTML = `<i data-lucide="${icon}"></i>`;
        }

        infotainmentDetailsModal.classList.add('open');
        lucide.createIcons();
    }

    function closeInfotainmentDetailsModal() {
        if (infotainmentDetailsModal) infotainmentDetailsModal.classList.remove('open');
    }

    // Modal de Cadastro
    if (btnOpenAddInfotainmentModal && addInfotainmentModal) {
        btnOpenAddInfotainmentModal.addEventListener('click', () => {
            document.getElementById('inputInfoTitle').value = '';
            // Reconstroi os selects (garante categorias/fornecedores recém-criados) e reseta o estado inline
            renderComponentCategorySelect(componentCategories[0] && componentCategories[0].value);
            renderComponentSupplierSelect(componentSuppliers[0] && componentSuppliers[0].value);
            hideAddCategoryRow();
            hideAddSupplierRow();
            document.getElementById('inputInfoApplied').value = '';
            document.getElementById('inputInfoImageUrl').value = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600';
            document.getElementById('textareaInfoDesc').value = '';
            addInfotainmentModal.classList.add('open');
        });
    }

    function closeAddInfotainmentModal() {
        if (addInfotainmentModal) addInfotainmentModal.classList.remove('open');
    }

    if (btnCancelAddInfotainmentModal) btnCancelAddInfotainmentModal.addEventListener('click', closeAddInfotainmentModal);
    if (btnCloseAddInfotainmentModal) btnCloseAddInfotainmentModal.addEventListener('click', closeAddInfotainmentModal);
    
    if (btnCloseInfoDetailsModal) btnCloseInfoDetailsModal.addEventListener('click', closeInfotainmentDetailsModal);
    if (btnCancelInfoDetailsModal) btnCancelInfoDetailsModal.addEventListener('click', closeInfotainmentDetailsModal);

    if (addInfotainmentModal) {
        addInfotainmentModal.addEventListener('click', (e) => {
            if (e.target === addInfotainmentModal) closeAddInfotainmentModal();
        });
    }
    if (infotainmentDetailsModal) {
        infotainmentDetailsModal.addEventListener('click', (e) => {
            if (e.target === infotainmentDetailsModal) closeInfotainmentDetailsModal();
        });
    }

    if (btnSaveNewInfotainment) {
        btnSaveNewInfotainment.addEventListener('click', () => {
            const title = document.getElementById('inputInfoTitle').value.trim();
            const category = document.getElementById('selectInfoCategory').value;
            const supplier = document.getElementById('selectInfoSupplier').value;
            const applied = document.getElementById('inputInfoApplied').value.trim();
            const imageUrl = document.getElementById('inputInfoImageUrl').value.trim();
            const desc = document.getElementById('textareaInfoDesc').value.trim();

            if (!title || !applied || !desc) {
                alert('Por favor, preencha todos os campos obrigatórios (Nome, Aplicações e Descrição)!');
                return;
            }

            if (category === '__add_category__') {
                alert('Confirme o cadastro da nova categoria (botão OK) antes de salvar o componente.');
                return;
            }
            if (supplier === '__add_supplier__') {
                alert('Confirme o cadastro do novo fornecedor (botão OK) antes de salvar o componente.');
                return;
            }

            const newInfo = {
                id: `info-${Date.now()}`,
                title: title,
                category: category,
                supplier: supplier,
                applied: applied,
                imageUrl: imageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600',
                desc: desc
            };

            infotainmentComponents.push(newInfo);
            localStorage.setItem('stellantis_infotainment', JSON.stringify(infotainmentComponents));

            closeAddInfotainmentModal();
            renderInfotainment();

            // Gamificação de XP
            if (typeof userXp !== 'undefined') {
                userXp += 50;
                localStorage.setItem('stellantis_user_xp', userXp);
                if (typeof updateProfileUI === 'function') updateProfileUI();
            }

            // Timeline do Perfil
            let currentIdeas = [];
            try {
                currentIdeas = JSON.parse(localStorage.getItem('stellantis_ideas')) || [];
            } catch(e) { currentIdeas = []; }

            const nowStr = new Date().toLocaleString('pt-BR');
            currentIdeas.push({
                title: title,
                type: 'geral',
                desc: `Adicionou o componente de infotainment "${title}" com imagem na base de tecnologias.`,
                date: nowStr
            });
            localStorage.setItem('stellantis_ideas', JSON.stringify(currentIdeas));

            alert(`🎉 Componente "${title}" adicionado com sucesso!\nVocê ganhou +50 XP por contribuir com a base de tecnologias!`);
        });
    }

    // ----------------------------------------------------------------
    // UI inline para cadastrar Categoria / Fornecedor no modal
    // ----------------------------------------------------------------
    function showAddCategoryRow() {
        const row = document.getElementById('rowAddCategory');
        const input = document.getElementById('inputNewCategory');
        if (row) row.style.display = 'flex';
        if (input) { input.value = ''; input.focus(); }
    }
    function hideAddCategoryRow() {
        const row = document.getElementById('rowAddCategory');
        if (row) row.style.display = 'none';
    }
    function showAddSupplierRow() {
        const row = document.getElementById('rowAddSupplier');
        const input = document.getElementById('inputNewSupplier');
        if (row) row.style.display = 'flex';
        if (input) { input.value = ''; input.focus(); }
    }
    function hideAddSupplierRow() {
        const row = document.getElementById('rowAddSupplier');
        if (row) row.style.display = 'none';
    }

    const selInfoCategory = document.getElementById('selectInfoCategory');
    if (selInfoCategory) {
        selInfoCategory.addEventListener('change', () => {
            if (selInfoCategory.value === '__add_category__') {
                showAddCategoryRow();
            } else {
                hideAddCategoryRow();
            }
        });
    }
    const selInfoSupplier = document.getElementById('selectInfoSupplier');
    if (selInfoSupplier) {
        selInfoSupplier.addEventListener('change', () => {
            if (selInfoSupplier.value === '__add_supplier__') {
                showAddSupplierRow();
            } else {
                hideAddSupplierRow();
            }
        });
    }

    function confirmNewCategory() {
        const input = document.getElementById('inputNewCategory');
        const name = input ? input.value.trim() : '';
        if (!name) { alert('Informe o nome da nova categoria.'); return; }
        const value = addComponentCategory(name);
        if (!value) { alert('Nome de categoria inválido.'); return; }
        hideAddCategoryRow();
    }
    function confirmNewSupplier() {
        const input = document.getElementById('inputNewSupplier');
        const name = input ? input.value.trim() : '';
        if (!name) { alert('Informe o nome do novo fornecedor.'); return; }
        const value = addComponentSupplier(name);
        if (!value) { alert('Nome de fornecedor inválido.'); return; }
        hideAddSupplierRow();
    }

    const btnConfirmNewCategory = document.getElementById('btnConfirmNewCategory');
    const btnCancelNewCategory = document.getElementById('btnCancelNewCategory');
    const inputNewCategory = document.getElementById('inputNewCategory');
    if (btnConfirmNewCategory) btnConfirmNewCategory.addEventListener('click', confirmNewCategory);
    if (btnCancelNewCategory) btnCancelNewCategory.addEventListener('click', () => {
        hideAddCategoryRow();
        renderComponentCategorySelect(componentCategories[0] && componentCategories[0].value);
    });
    if (inputNewCategory) inputNewCategory.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); confirmNewCategory(); }
    });

    const btnConfirmNewSupplier = document.getElementById('btnConfirmNewSupplier');
    const btnCancelNewSupplier = document.getElementById('btnCancelNewSupplier');
    const inputNewSupplier = document.getElementById('inputNewSupplier');
    if (btnConfirmNewSupplier) btnConfirmNewSupplier.addEventListener('click', confirmNewSupplier);
    if (btnCancelNewSupplier) btnCancelNewSupplier.addEventListener('click', () => {
        hideAddSupplierRow();
        renderComponentSupplierSelect(componentSuppliers[0] && componentSuppliers[0].value);
    });
    if (inputNewSupplier) inputNewSupplier.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); confirmNewSupplier(); }
    });

    // ----------------------------------------------------------------
    // Modal CRUD do Showcase de Fornecedores
    // ----------------------------------------------------------------
    const addSupplierModal = document.getElementById('addSupplierModal');
    const btnOpenAddSupplierModal = document.getElementById('btnOpenAddSupplierModal');
    const btnCloseAddSupplierModal = document.getElementById('btnCloseAddSupplierModal');
    const btnCancelAddSupplierModal = document.getElementById('btnCancelAddSupplierModal');
    const btnSaveNewSupplier = document.getElementById('btnSaveNewSupplier');

    function closeAddSupplierModal() {
        if (addSupplierModal) addSupplierModal.classList.remove('open');
    }
    if (btnOpenAddSupplierModal && addSupplierModal) {
        btnOpenAddSupplierModal.addEventListener('click', () => {
            ['inputSupplierName','inputSupplierArea','textareaSupplierDesc','inputSupplierLogo','textareaSupplierHistory','textareaSupplierPartnership'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            addSupplierModal.classList.add('open');
        });
    }
    if (btnCloseAddSupplierModal) btnCloseAddSupplierModal.addEventListener('click', closeAddSupplierModal);
    if (btnCancelAddSupplierModal) btnCancelAddSupplierModal.addEventListener('click', closeAddSupplierModal);
    if (addSupplierModal) {
        addSupplierModal.addEventListener('click', (e) => {
            if (e.target === addSupplierModal) closeAddSupplierModal();
        });
    }
    if (btnSaveNewSupplier) {
        btnSaveNewSupplier.addEventListener('click', () => {
            const name = (document.getElementById('inputSupplierName').value || '').trim();
            const area = (document.getElementById('inputSupplierArea').value || '').trim();
            const desc = (document.getElementById('textareaSupplierDesc').value || '').trim();
            const logo = (document.getElementById('inputSupplierLogo').value || '').trim();
            const history = (document.getElementById('textareaSupplierHistory').value || '').trim();
            const partnership = (document.getElementById('textareaSupplierPartnership').value || '').trim();
            if (!name) { alert('Informe o nome do fornecedor.'); return; }
            const value = addComponentSupplier(name, { area, desc, logo, history, partnership });
            if (!value) { alert('Nome de fornecedor inválido.'); return; }
            closeAddSupplierModal();
            renderSuppliersShowcase();
            alert(`Fornecedor "${name}" adicionado ao catálogo!\nJá disponível também no cadastro de Componentes.`);
        });
    }

    // Modal de detalhes do Fornecedor: fechar
    const supplierDetailsModal = document.getElementById('supplierDetailsModal');
    function closeSupplierDetailsModal() {
        if (supplierDetailsModal) supplierDetailsModal.classList.remove('open');
    }
    const btnCloseSupplierDetailsModal = document.getElementById('btnCloseSupplierDetailsModal');
    const btnCloseSupplierDetailsModalFooter = document.getElementById('btnCloseSupplierDetailsModalFooter');
    if (btnCloseSupplierDetailsModal) btnCloseSupplierDetailsModal.addEventListener('click', closeSupplierDetailsModal);
    if (btnCloseSupplierDetailsModalFooter) btnCloseSupplierDetailsModalFooter.addEventListener('click', closeSupplierDetailsModal);
    if (supplierDetailsModal) {
        supplierDetailsModal.addEventListener('click', (e) => {
            if (e.target === supplierDetailsModal) closeSupplierDetailsModal();
        });
    }

    // Inicializar renderizações de Informações
    renderSpecialists();
    renderComponentCategorySelect();
    renderComponentSupplierSelect();
    renderComponentFilterCheckboxes();
    updateComponentFilters(); // sincroniza activeCategories/activeSuppliers e renderiza a grade
    renderSuppliersShowcase();

    // ========================================================
    // 21. GERENCIAMENTO DINÂMICO DE HIERARQUIA (ORGANIZAR)
    // ========================================================
    window.isOrgManagementActive = false;
    let selectedNodeIdForEdit = null;
    let selectedNodeIdForAdd = null;

    const btnManageHierarchy = document.getElementById('btnManageHierarchy');
    
    // Modais e inputs de Edição
    const modalEditOrgNode = document.getElementById('modalEditOrgNode');
    const btnCloseEditOrgNodeModal = document.getElementById('btnCloseEditOrgNodeModal');
    const btnCancelEditOrgNodeModal = document.getElementById('btnCancelEditOrgNodeModal');
    const btnSaveEditOrgNode = document.getElementById('btnSaveEditOrgNode');
    const inputEditOrgName = document.getElementById('inputEditOrgName');
    const inputEditOrgRole = document.getElementById('inputEditOrgRole');
    const inputEditOrgAvatar = document.getElementById('inputEditOrgAvatar');
    const selectEditOrgLocation = document.getElementById('selectEditOrgLocation');

    // Modais e inputs de Adição
    const modalAddOrgNode = document.getElementById('modalAddOrgNode');
    const btnCloseAddOrgNodeModal = document.getElementById('btnCloseAddOrgNodeModal');
    const btnCancelAddOrgNodeModal = document.getElementById('btnCancelAddOrgNodeModal');
    const btnSaveAddOrgNode = document.getElementById('btnSaveAddOrgNode');
    const inputAddOrgName = document.getElementById('inputAddOrgName');
    const inputAddOrgRole = document.getElementById('inputAddOrgRole');
    const inputAddOrgAvatar = document.getElementById('inputAddOrgAvatar');
    const selectAddOrgLocation = document.getElementById('selectAddOrgLocation');

    // Toggle do modo de organização
    if (btnManageHierarchy) {
        btnManageHierarchy.addEventListener('click', () => {
            window.isOrgManagementActive = !window.isOrgManagementActive;
            if (window.isOrgManagementActive) {
                btnManageHierarchy.innerHTML = `<i data-lucide="x"></i> Concluir Organização`;
                btnManageHierarchy.style.background = 'rgba(239, 68, 68, 0.1)';
                btnManageHierarchy.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                btnManageHierarchy.style.color = '#ef4444';
            } else {
                btnManageHierarchy.innerHTML = `<i data-lucide="settings"></i> Organizar Hierarquia`;
                btnManageHierarchy.style.background = 'rgba(6, 182, 212, 0.1)';
                btnManageHierarchy.style.borderColor = 'rgba(6, 182, 212, 0.2)';
                btnManageHierarchy.style.color = 'var(--secondary)';
            }
            lucide.createIcons();
            renderTree();
        });
    }

    // Modal de Edição: Abrir
    window.openEditOrgNodeModal = function(nodeId) {
        const node = findNodeById(orgHierarchy, nodeId);
        if (!node) return;

        selectedNodeIdForEdit = nodeId;
        inputEditOrgName.value = node.name || '';
        inputEditOrgRole.value = node.role || '';
        inputEditOrgAvatar.value = node.avatar || '';
        selectEditOrgLocation.value = node.location || 'sa';

        if (modalEditOrgNode) modalEditOrgNode.classList.add('open');
    };

    function closeEditOrgNodeModal() {
        if (modalEditOrgNode) modalEditOrgNode.classList.remove('open');
        selectedNodeIdForEdit = null;
    }

    if (btnCloseEditOrgNodeModal) btnCloseEditOrgNodeModal.addEventListener('click', closeEditOrgNodeModal);
    if (btnCancelEditOrgNodeModal) btnCancelEditOrgNodeModal.addEventListener('click', closeEditOrgNodeModal);

    if (modalEditOrgNode) {
        modalEditOrgNode.addEventListener('click', (e) => {
            if (e.target === modalEditOrgNode) closeEditOrgNodeModal();
        });
    }

    // Modal de Edição: Salvar
    if (btnSaveEditOrgNode) {
        btnSaveEditOrgNode.addEventListener('click', () => {
            if (!selectedNodeIdForEdit) return;
            const node = findNodeById(orgHierarchy, selectedNodeIdForEdit);
            if (!node) return;

            const name = inputEditOrgName.value.trim();
            const role = inputEditOrgRole.value.trim();
            const avatar = inputEditOrgAvatar.value.trim().toUpperCase();
            const location = selectEditOrgLocation.value;

            if (!name || !role || !avatar) {
                alert('Por favor, preencha todos os campos!');
                return;
            }

            node.name = name;
            node.role = role;
            node.avatar = avatar;
            node.location = location;

            localStorage.setItem('stellantis_hierarchy', JSON.stringify(orgHierarchy));
            closeEditOrgNodeModal();
            renderTree();

            // Gamificação
            if (typeof userXp !== 'undefined') {
                userXp += 50;
                localStorage.setItem('stellantis_user_xp', userXp);
                if (typeof updateProfileUI === 'function') updateProfileUI();
            }

            // Registrar na timeline do Perfil
            let currentIdeas = [];
            try {
                currentIdeas = JSON.parse(localStorage.getItem('stellantis_ideas')) || [];
            } catch(e) { currentIdeas = []; }

            const nowStr = new Date().toLocaleString('pt-BR');
            currentIdeas.push({
                title: name,
                type: 'geral',
                desc: `Editou as informações de "${name}" (${role}) na árvore hierárquica organizacional.`,
                date: nowStr
            });
            localStorage.setItem('stellantis_ideas', JSON.stringify(currentIdeas));

            alert(`🎉 Dados de "${name}" atualizados com sucesso!\nVocê ganhou +50 XP por organizar a estrutura da equipe.`);
        });
    }

    // Modal de Adição: Abrir
    window.openAddOrgNodeModal = function(nodeId) {
        selectedNodeIdForAdd = nodeId;
        inputAddOrgName.value = '';
        inputAddOrgRole.value = '';
        inputAddOrgAvatar.value = '';
        selectAddOrgLocation.value = 'sa';

        if (modalAddOrgNode) modalAddOrgNode.classList.add('open');
    };

    function closeAddOrgNodeModal() {
        if (modalAddOrgNode) modalAddOrgNode.classList.remove('open');
        selectedNodeIdForAdd = null;
    }

    if (btnCloseAddOrgNodeModal) btnCloseAddOrgNodeModal.addEventListener('click', closeAddOrgNodeModal);
    if (btnCancelAddOrgNodeModal) btnCancelAddOrgNodeModal.addEventListener('click', closeAddOrgNodeModal);

    if (modalAddOrgNode) {
        modalAddOrgNode.addEventListener('click', (e) => {
            if (e.target === modalAddOrgNode) closeAddOrgNodeModal();
        });
    }

    // Modal de Adição: Salvar
    if (btnSaveAddOrgNode) {
        btnSaveAddOrgNode.addEventListener('click', () => {
            if (!selectedNodeIdForAdd) return;
            const parentNode = findNodeById(orgHierarchy, selectedNodeIdForAdd);
            if (!parentNode) return;

            const name = inputAddOrgName.value.trim();
            const role = inputAddOrgRole.value.trim();
            const avatar = inputAddOrgAvatar.value.trim().toUpperCase();
            const location = selectAddOrgLocation.value;

            if (!name || !role || !avatar) {
                alert('Por favor, preencha todos os campos!');
                return;
            }

            // Descobrir level aproximado do filho
            let level = 'N-6';
            if (parentNode.level === 'N-2') level = 'N-3';
            else if (parentNode.level === 'N-3') level = 'N-4';
            else if (parentNode.level === 'N-4') level = 'N-5';
            else if (parentNode.level === 'N-5') level = 'N-6 Group';
            else if (parentNode.level && parentNode.level.includes('Group')) level = 'N-6';

            const newChild = {
                id: `node-${Date.now()}`,
                name: name,
                role: role,
                avatar: avatar,
                location: location,
                level: level,
                reports: []
            };

            if (!parentNode.reports) parentNode.reports = [];
            parentNode.reports.push(newChild);

            localStorage.setItem('stellantis_hierarchy', JSON.stringify(orgHierarchy));
            closeAddOrgNodeModal();
            renderTree();

            // Gamificação
            if (typeof userXp !== 'undefined') {
                userXp += 50;
                localStorage.setItem('stellantis_user_xp', userXp);
                if (typeof updateProfileUI === 'function') updateProfileUI();
            }

            // Registrar na timeline do Perfil
            let currentIdeas = [];
            try {
                currentIdeas = JSON.parse(localStorage.getItem('stellantis_ideas')) || [];
            } catch(e) { currentIdeas = []; }

            const nowStr = new Date().toLocaleString('pt-BR');
            currentIdeas.push({
                title: name,
                type: 'geral',
                desc: `Adicionou o subordinado "${name}" sob a supervisão de "${parentNode.name}" na estrutura hierárquica.`,
                date: nowStr
            });
            localStorage.setItem('stellantis_ideas', JSON.stringify(currentIdeas));

            alert(`🎉 Integrante "${name}" adicionado com sucesso!\nVocê ganhou +50 XP por expandir a estrutura do time.`);
        });
    }

    // Ação de Excluir Nó
    window.deleteOrgNode = function(nodeId) {
        if (nodeId === 'heiko') {
            alert('Não é possível excluir o diretor global raiz da árvore!');
            return;
        }

        const parent = findParentNode(orgHierarchy, nodeId);
        const node = findNodeById(orgHierarchy, nodeId);
        if (!parent || !node) {
            alert('Nó pai não encontrado. Não é possível excluir.');
            return;
        }

        // Remover da lista de reports do pai
        parent.reports = parent.reports.filter(child => child.id !== nodeId);

        // Se o nó focado atual for excluído, redirecionar o foco para o pai
        if (currentFocusedNodeId === nodeId) {
            currentFocusedNodeId = parent.id;
        }

        localStorage.setItem('stellantis_hierarchy', JSON.stringify(orgHierarchy));
        renderTree();

        // Gamificação
        if (typeof userXp !== 'undefined') {
            userXp += 50;
            localStorage.setItem('stellantis_user_xp', userXp);
            if (typeof updateProfileUI === 'function') updateProfileUI();
        }

        // Registrar na timeline do Perfil
        let currentIdeas = [];
        try {
            currentIdeas = JSON.parse(localStorage.getItem('stellantis_ideas')) || [];
        } catch(e) { currentIdeas = []; }

        const nowStr = new Date().toLocaleString('pt-BR');
        currentIdeas.push({
            title: node.name,
            type: 'geral',
            desc: `Excluiu o integrante "${node.name}" (${node.role}) da estrutura organizacional.`,
            date: nowStr
        });
        localStorage.setItem('stellantis_ideas', JSON.stringify(currentIdeas));

        alert(`🗑️ Integrante "${node.name}" e seus subordinados foram removidos da hierarquia!\nVocê ganhou +50 XP.`);
    };

    // ========================================================
    // 22. PROJETOS ATIVOS STELLANTIS (DINÂMICO)
    // ========================================================
    const defaultProjects = [
        {
            id: 'proj-1',
            code: 'DEMO1',
            name: "Jeep Compass 2026/2027",
            desc: "SUV líder de categoria, agora com propulsão híbrida flex Bio-Hybrid integrada.",
            platform: "Small Wide LWB",
            powertrain: "T270 / Hurricane 4",
            status: "Produção",
            imageUrl: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=600&q=80"
        },
        {
            id: 'proj-2',
            code: 'DEMO2',
            name: "Ram Rampage 2026",
            desc: "Picape intermediária premium projetada e desenvolvida no Brasil.",
            platform: "Small Wide LWB",
            powertrain: "Hurricane 4 / TD380",
            status: "Produção",
            imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80"
        },
        {
            id: 'proj-3',
            code: 'DEMO3',
            name: "Jeep Commander 2026",
            desc: "D-SUV de 7 lugares desenvolvido sob a arquitetura alongada LWB.",
            platform: "Small Wide LWB",
            powertrain: "T270 / Hurricane 4",
            status: "Produção",
            imageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80"
        }
    ];

    let projects = [];
    try {
        projects = JSON.parse(localStorage.getItem('stellantis_projects')) || defaultProjects;
    } catch(e) {
        projects = [...defaultProjects];
    }

    const projectsGridContainer = document.getElementById('projectsGridContainer');
    const btnOpenAddProjectModal = document.getElementById('btnOpenAddProjectModal');
    const addProjectModal = document.getElementById('addProjectModal');
    const btnCancelAddProjectModal = document.getElementById('btnCancelAddProjectModal');
    const btnSaveNewProject = document.getElementById('btnSaveNewProject');
    const btnCloseAddProjectModal = document.getElementById('btnCloseAddProjectModal');

    function renderProjects() {
        if (!projectsGridContainer) return;
        projectsGridContainer.innerHTML = '';

        projects.forEach(proj => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.setAttribute('data-id', proj.id);

            // Determinar classe de status
            let statusClass = 'active';
            if (proj.status === 'Desenvolvimento') statusClass = 'pending';
            else if (proj.status === 'Homologado') statusClass = 'homologated';

            card.innerHTML = `
                <div class="project-image-container">
                    <img src="${proj.imageUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600'}" alt="${proj.name} ${proj.code}" class="project-image" onerror="this.src='https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600'">
                    <span class="project-code-badge">${proj.code}</span>
                </div>
                <div class="project-card-info">
                    <h4>${proj.name}</h4>
                    <p class="project-desc">${proj.desc}</p>
                    <table class="project-info-table">
                        <tr>
                            <td><strong>Status:</strong></td>
                            <td><span class="status-indicator ${statusClass}">${proj.status}</span></td>
                        </tr>
                    </table>
                </div>
            `;
            projectsGridContainer.appendChild(card);
        });
    }

    // Modal de Projetos
    function openAddProjectModal() {
        if (addProjectModal) addProjectModal.classList.add('open');
    }

    function closeAddProjectModal() {
        if (addProjectModal) addProjectModal.classList.remove('open');
    }

    if (btnOpenAddProjectModal) btnOpenAddProjectModal.addEventListener('click', openAddProjectModal);
    if (btnCancelAddProjectModal) btnCancelAddProjectModal.addEventListener('click', closeAddProjectModal);
    if (btnCloseAddProjectModal) btnCloseAddProjectModal.addEventListener('click', closeAddProjectModal);

    if (addProjectModal) {
        addProjectModal.addEventListener('click', (e) => {
            if (e.target === addProjectModal) closeAddProjectModal();
        });
    }

    if (btnSaveNewProject) {
        btnSaveNewProject.addEventListener('click', () => {
            const code = document.getElementById('inputProjectCode').value.trim();
            const name = document.getElementById('inputProjectName').value.trim();
            const status = document.getElementById('selectProjectStatus').value;
            const imageUrl = document.getElementById('inputProjectImageUrl').value.trim();
            const desc = document.getElementById('textareaProjectDesc').value.trim();

            if (!code || !name || !desc) {
                alert('Por favor, preencha todos os campos do projeto!');
                return;
            }

            const newProj = {
                id: `proj-${Date.now()}`,
                code: code.toUpperCase(),
                name: name,
                status: status,
                imageUrl: imageUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600',
                desc: desc
            };

            projects.push(newProj);
            localStorage.setItem('stellantis_projects', JSON.stringify(projects));

            closeAddProjectModal();
            renderProjects();

            // Gamificação de XP
            if (typeof userXp !== 'undefined') {
                userXp += 50;
                localStorage.setItem('stellantis_user_xp', userXp);
                if (typeof updateProfileUI === 'function') updateProfileUI();
            }

            // Timeline do Perfil
            let currentIdeas = [];
            try {
                currentIdeas = JSON.parse(localStorage.getItem('stellantis_ideas')) || [];
            } catch(e) { currentIdeas = []; }

            const nowStr = new Date().toLocaleString('pt-BR');
            currentIdeas.push({
                title: name,
                type: 'geral',
                desc: `Adicionou o projeto veicular "${name}" (Código: ${code.toUpperCase()}) na base ativa de engenharia.`,
                date: nowStr
            });
            localStorage.setItem('stellantis_ideas', JSON.stringify(currentIdeas));

            alert(`🎉 Projeto "${name}" adicionado com sucesso!\nVocê ganhou +50 XP por cadastrar o novo projeto!`);
        });
    }

    // Inicializar renderizações dinâmicas
    renderProjects();

    // ========================================================
    // 23. AUTOMAÇÕES & INTELIGÊNCIA ARTIFICIAL (DINÂMICO)
    // ========================================================
    const defaultAutomations = [
        {
            id: 'auto-1',
            projId: 'stellantisgpt',
            name: 'StellantisGPT',
            category: 'bot',
            categoryText: 'IA Conversacional',
            icon: 'bot',
            iconStyle: 'color: var(--secondary); width: 18px; height: 18px;',
            badgeStyle: 'background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.2); color: var(--secondary);',
            desc: 'Assistente técnico baseado em LLM corporativa para apoio ao time de engenharia de infotainment.',
            responsible: 'Engª Ana Martins'
        },
        {
            id: 'auto-2',
            projId: 'testgenai',
            name: 'TestGen-AI',
            category: 'code',
            categoryText: 'Automação de QA',
            icon: 'code',
            iconStyle: 'color: var(--accent); width: 18px; height: 18px;',
            badgeStyle: 'background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); color: var(--accent);',
            desc: 'Geração automática de scripts de teste para Android Automotive OS a partir de requisitos do Confluence.',
            responsible: 'Breno Teixeira'
        },
        {
            id: 'auto-3',
            projId: 'cananalyzer',
            name: 'CAN-Analyzer AI',
            category: 'cpu',
            categoryText: 'Análise de Hardware',
            icon: 'cpu',
            iconStyle: 'color: var(--accent-red); width: 18px; height: 18px;',
            badgeStyle: 'background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: var(--accent-red);',
            desc: 'Detecção inteligente de anomalias e erros de comunicação em tempo real na rede CAN dos protótipos.',
            responsible: 'Dr. Enzo Nogueira'
        },
        {
            id: 'auto-4',
            projId: 'poweroptai',
            name: 'PowerOpt-AI',
            category: 'zap',
            categoryText: 'Otimização Preditiva',
            icon: 'zap',
            iconStyle: 'color: #a855f7; width: 18px; height: 18px;',
            badgeStyle: 'background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.2); color: #a855f7;',
            desc: 'Modelo de aprendizado por reforço para otimizar os fluxos de consumo e regeneração do Bio-Hybrid 48V.',
            responsible: 'Engª Ana Martins'
        }
    ];

    let automations = [];
    try {
        automations = JSON.parse(localStorage.getItem('stellantis_automations')) || defaultAutomations;
    } catch(e) {
        automations = [...defaultAutomations];
    }

    const automationsGridContainer = document.getElementById('automationsGridContainer');
    const btnOpenAddAutomationModal = document.getElementById('btnOpenAddAutomationModal');
    const addAutomationModal = document.getElementById('addAutomationModal');
    const btnCancelAddAutomationModal = document.getElementById('btnCancelAddAutomationModal');
    const btnSaveNewAutomation = document.getElementById('btnSaveNewAutomation');
    const btnCloseAddAutomationModal = document.getElementById('btnCloseAddAutomationModal');

    function renderAutomations() {
        if (!automationsGridContainer) return;
        automationsGridContainer.innerHTML = '';

        automations.forEach(auto => {
            const card = document.createElement('div');
            card.className = 'automation-card';
            card.setAttribute('data-projid', auto.projId);
            card.style.background = 'var(--glass-bg)';
            card.style.border = '1px solid var(--glass-border)';
            card.style.backdropFilter = 'blur(12px)';
            card.style.borderRadius = '16px';
            card.style.padding = '24px';
            card.style.cursor = 'pointer';
            card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.justifyContent = 'space-between';
            card.style.height = '100%';

            card.innerHTML = `
                <div>
                    <div class="card-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; background: transparent; border: none; padding: 0;">
                        <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; ${auto.badgeStyle} padding: 4px 10px; border-radius: 6px;">
                            <i data-lucide="${auto.icon}" style="width: 10px; height: 10px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i> ${auto.categoryText}
                        </span>
                        <i data-lucide="sparkles" style="color: var(--secondary); width: 18px; height: 18px;"></i>
                    </div>
                    <h4 style="font-size: 18px; font-weight: 700; color: var(--text-main); margin-bottom: 8px; font-family: var(--font-heading);">${auto.name}</h4>
                    <p style="font-size: 12px; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px;">${auto.desc}</p>
                </div>
                <div style="font-size: 11px; color: var(--text-dark); display: flex; align-items: center; gap: 6px;">
                    <i data-lucide="user" style="width: 12px; height: 12px;"></i>
                    <span>Responsável: ${auto.responsible}</span>
                </div>
            `;

            // Clique do card para abrir detalhes no chat IA ou pop-up
            card.addEventListener('click', () => {
                const chatMenuBtn = document.querySelector('.nav-btn[data-target="chat"]');
                if (chatMenuBtn) chatMenuBtn.click();
                const chatInput = document.getElementById('chatInput');
                if (chatInput) {
                    chatInput.value = `Como funciona o projeto de IA/Automação "${auto.name}" e quem é ${auto.responsible}?`;
                    chatInput.focus();
                }
            });

            automationsGridContainer.appendChild(card);
        });
        lucide.createIcons();
    }

    // Modal de Automação
    function openAddAutomationModal() {
        if (addAutomationModal) addAutomationModal.classList.add('open');
    }

    function closeAddAutomationModal() {
        if (addAutomationModal) addAutomationModal.classList.remove('open');
    }

    if (btnOpenAddAutomationModal) btnOpenAddAutomationModal.addEventListener('click', openAddAutomationModal);
    if (btnCancelAddAutomationModal) btnCancelAddAutomationModal.addEventListener('click', closeAddAutomationModal);
    if (btnCloseAddAutomationModal) btnCloseAddAutomationModal.addEventListener('click', closeAddAutomationModal);

    if (addAutomationModal) {
        addAutomationModal.addEventListener('click', (e) => {
            if (e.target === addAutomationModal) closeAddAutomationModal();
        });
    }

    if (btnSaveNewAutomation) {
        btnSaveNewAutomation.addEventListener('click', () => {
            const name = document.getElementById('inputAutoName').value.trim();
            const category = document.getElementById('selectAutoCategory').value;
            const responsible = document.getElementById('inputAutoResponsible').value.trim();
            const desc = document.getElementById('textareaAutoDesc').value.trim();

            if (!name || !responsible || !desc) {
                alert('Por favor, preencha todos os campos da automação!');
                return;
            }

            // Definir ícone, categoria em texto e badges com base no tipo
            let categoryText = 'IA Conversacional';
            let icon = 'bot';
            let badgeStyle = 'background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.2); color: var(--secondary);';
            let iconStyle = 'color: var(--secondary); width: 18px; height: 18px;';

            if (category === 'code') {
                categoryText = 'Automação de QA';
                icon = 'code';
                badgeStyle = 'background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); color: var(--accent);';
                iconStyle = 'color: var(--accent); width: 18px; height: 18px;';
            } else if (category === 'cpu') {
                categoryText = 'Análise de Hardware';
                icon = 'cpu';
                badgeStyle = 'background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: var(--accent-red);';
                iconStyle = 'color: var(--accent-red); width: 18px; height: 18px;';
            } else if (category === 'zap') {
                categoryText = 'Otimização Preditiva';
                icon = 'zap';
                badgeStyle = 'background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.2); color: #a855f7;';
                iconStyle = 'color: #a855f7; width: 18px; height: 18px;';
            }

            const newAuto = {
                id: `auto-${Date.now()}`,
                projId: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
                name: name,
                category: category,
                categoryText: categoryText,
                icon: icon,
                iconStyle: iconStyle,
                badgeStyle: badgeStyle,
                desc: desc,
                responsible: responsible
            };

            automations.push(newAuto);
            localStorage.setItem('stellantis_automations', JSON.stringify(automations));

            closeAddAutomationModal();
            renderAutomations();

            // Gamificação de XP
            if (typeof userXp !== 'undefined') {
                userXp += 50;
                localStorage.setItem('stellantis_user_xp', userXp);
                if (typeof updateProfileUI === 'function') updateProfileUI();
            }

            // Timeline do Perfil
            let currentIdeas = [];
            try {
                currentIdeas = JSON.parse(localStorage.getItem('stellantis_ideas')) || [];
            } catch(e) { currentIdeas = []; }

            const nowStr = new Date().toLocaleString('pt-BR');
            currentIdeas.push({
                title: name,
                type: 'geral',
                desc: `Criou a ferramenta de IA/Automação "${name}" na base técnica.`,
                date: nowStr
            });
            localStorage.setItem('stellantis_ideas', JSON.stringify(currentIdeas));

            alert(`🎉 Automação "${name}" adicionada com sucesso!\nVocê ganhou +50 XP por cocriar uma ferramenta técnica!`);
        });
    }

    // Inicializar renderizações dinâmicas
    renderProjects();
    renderAutomations();
});
