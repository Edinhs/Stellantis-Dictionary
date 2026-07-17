/* ==========================================
   STELLANTIS DICTIONARY - INTERATIVIDADE DO CARRO & 3D (THREE.JS)
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ========================================================
    // 1. HOTSPOTS DA PÁGINA INICIAL (SIMULADOR DO PRINT JEEP)
    // ========================================================
    const hotspots = document.querySelectorAll('.hotspot');
    const hotspotInfoCard = document.getElementById('hotspotInfoCard');
    const hotspotTitle = document.getElementById('hotspotTitle');
    const hotspotDesc = document.getElementById('hotspotDesc');
    const btnCloseCard = document.getElementById('btnCloseCard');
    const btnHotspotDict = document.getElementById('btn-hotspot-dict');
    const btnHotspotIdea = document.getElementById('btn-hotspot-idea');
    
    let activeHotspotId = null;
    let activeHotspotTitle = "";

    hotspots.forEach(hotspot => {
        hotspot.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const id = hotspot.getAttribute('data-id');
            const title = hotspot.getAttribute('data-title');
            const desc = hotspot.getAttribute('data-desc');
            
            activeHotspotId = id;
            activeHotspotTitle = title;
            
            // Atualizar conteúdo do Card
            hotspotTitle.textContent = title;
            hotspotDesc.textContent = desc;
            
            // Posicionar o card próximo ao hotspot clicado
            const rect = hotspot.getBoundingClientRect();
            const parentRect = hotspot.parentElement.getBoundingClientRect();
            
            // Posicionamento relativo elegante
            const topPercent = parseFloat(hotspot.style.top);
            const leftPercent = parseFloat(hotspot.style.left);
            
            // Ajustar o card para aparecer logo abaixo ou ao lado
            hotspotInfoCard.style.top = `${topPercent + 6}%`;
            hotspotInfoCard.style.left = `${Math.min(leftPercent - 20, 60)}%`;
            
            // Exibir o card
            hotspotInfoCard.classList.add('active');
        });
    });

    // Fechar Card
    if (btnCloseCard) {
        btnCloseCard.addEventListener('click', () => {
            hotspotInfoCard.classList.remove('active');
        });
    }

    // Fechar card ao clicar fora
    document.addEventListener('click', (e) => {
        if (hotspotInfoCard && !hotspotInfoCard.contains(e.target) && !e.target.classList.contains('hotspot')) {
            hotspotInfoCard.classList.remove('active');
        }
    });

    // Botão "Ver no Dicionário" do Card
    if (btnHotspotDict) {
        btnHotspotDict.addEventListener('click', () => {
            hotspotInfoCard.classList.remove('active');
            
            // Ir para a aba Dicionário
            const navLinkDicionario = document.querySelector('.nav-link[data-target="dicionario"]');
            if (navLinkDicionario) {
                navLinkDicionario.click();
            }
            
            // Filtrar termo no dicionário
            const searchInput = document.getElementById('searchTerms');
            if (searchInput) {
                // Remove termos como "Jeep" ou "ADAS" adicionais para busca limpa
                const cleanSearch = activeHotspotId === 'grid' ? 'Grade' : 
                                    activeHotspotId === 'dashboard' ? 'ADAS' : 'Suspensão';
                searchInput.value = cleanSearch;
                // Disparar evento para atualizar a lista
                searchInput.dispatchEvent(new Event('input'));
            }
        });
    }

    // Botão "Inserir Ideia Aqui" do Card (Abre o Modal Localizado)
    const modalIdea = document.getElementById('modalIdea');
    if (btnHotspotIdea) {
        btnHotspotIdea.addEventListener('click', () => {
            hotspotInfoCard.classList.remove('active');
            if (window.openIdeaModal) {
                window.openIdeaModal(activeHotspotTitle);
            }
        });
    }

    // Botão para alternar para a visualização 3D Real
    const btnToggle3dMode = document.getElementById('btn-toggle-3d-mode');
    if (btnToggle3dMode) {
        btnToggle3dMode.addEventListener('click', () => {
            const navLinkExplorador = document.querySelector('.nav-link[data-target="explorador"]');
            if (navLinkExplorador) {
                navLinkExplorador.click();
            }
        });
    }


    // ========================================================
    // 2. MODAL DE INSERÇÃO DE NOTAS DE IDEIAS
    // ========================================================
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnCancelModal = document.getElementById('btnCancelModal');
    const btnSaveModalIdea = document.getElementById('btnSaveModalIdea');
    const modalComponentTarget = document.getElementById('modalComponentTarget');

    function closeModal() {
        if (modalIdea) {
            modalIdea.classList.remove('open');
        }
    }

    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);
    
    // Salvar Ideia do Modal Localizado
    if (btnSaveModalIdea) {
        btnSaveModalIdea.addEventListener('click', () => {
            const titleInput = document.getElementById('modalIdeaTitle');
            const descInput = document.getElementById('modalIdeaDesc');
            
            const component = modalComponentTarget.textContent;
            const title = titleInput.value.trim();
            const desc = descInput.value.trim();
            
            if (title === '' || desc === '') {
                alert('Por favor, preencha todos os campos!');
                return;
            }

            // Acessa a lógica global para salvar a ideia
            const fullTitle = `Nota sobre ${component}: ${title}`;
            
            // Simular envio de evento ou salvar direto
            const ideas = JSON.parse(localStorage.getItem('stellantis_ideas')) || [];
            const date = new Date().toLocaleString('pt-BR');
            ideas.push({ 
                type: 'hotspot', 
                title: fullTitle, 
                desc: desc, 
                date: date 
            });
            localStorage.setItem('stellantis_ideas', JSON.stringify(ideas));
            
            // Recarregar os contadores/listas no app.js caso existam
            const ideaCountBadges = document.querySelectorAll('#ideaCount');
            ideaCountBadges.forEach(b => b.textContent = ideas.length);
            
            const savedIdeasList = document.getElementById('savedIdeasList');
            if (savedIdeasList) {
                // Aciona renderização atualizada no app.js de forma simplificada
                const customEvent = new CustomEvent('ideaAdded');
                document.dispatchEvent(customEvent);
                // Também atualiza o painel local diretamente caso o evento não propague
                location.reload(); // Recarrega para persistir visualmente tudo perfeitamente
            }

            closeModal();
            titleInput.value = '';
            descInput.value = '';
        });
    }


    // ========================================================
    // 3. RENDERIZADOR 3D REAL COM CARREGAMENTO GLTF (THREE.JS)
    // ========================================================
    const canvas3dContainer = document.getElementById('canvas3dContainer');
    let scene, camera, renderer, carGroup, controls;
    let exploradorSceneData = null;
    let homeSceneData = null;
    let isWireframeMode = false; // Começa sólido/realista por padrão

    // Injetar estilo de animação de rotação infinita para o spinner de carregamento
    if (!document.getElementById('style-spin-animation')) {
        const style = document.createElement('style');
        style.id = 'style-spin-animation';
        style.innerHTML = `
            @keyframes spin-loader {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    // Componentes e suas definições para exibição
    const componentData = {
        chassi: {
            title: "Chassi Inteligente & Estrutura Híbrida",
            desc: "Monobloco de aço de ultra-alta resistência integrado com travessas deformáveis. Projetado para acoplar tanto tanques de combustível tradicionais quanto o motor elétrico auxiliar do sistema Bio-Hybrid."
        },
        rodas: {
            title: "Rodas Aerodinâmicas & e-Motors",
            desc: "Rodas leves de liga de 19 polegadas com calotas aerodinâmicas para diminuição do arrasto. Nos eixos, sensores de regeneração convertem frenagem em eletricidade para o bloco de baterias de 48V."
        },
        sensores: {
            title: "Módulo de Sensores ADAS (LiDAR/Radar)",
            desc: "Conjunto ótico inteligente no topo do para-brisa e grade. Realiza varreduras constantes da via a até 150 metros, fornecendo inputs em milissegundos para o piloto automático adaptativo."
        },
        bateria: {
            title: "Bloco de Baterias de Lítio (48V)",
            desc: "Conjunto compacto de baterias de íons de lítio localizado sob o piso da cabine para manter o centro de gravidade baixo. Alimenta a rede auxiliar e o e-Motor no sistema híbrido flex."
        }
    };

    // Inicializador genérico de cenários Three.js (Home e Explorador)
    function initCarScene(container, isHome) {
        if (!container) return null;

        const targetScene = new THREE.Scene();
        targetScene.fog = new THREE.FogExp2(0x02050c, 0.015);

        // Prevenir canvas de 0px de dimensão na Home/Explorador
        const width = container.clientWidth || 600;
        const height = container.clientHeight || 400;

        // Câmera
        const targetCamera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
        if (isHome) {
            targetCamera.position.set(4, 2, 4);
        } else {
            targetCamera.position.set(5, 3, 5);
        }

        // Renderizador com canal alfa (transparente) para fundir com o fundo glassmorphic do site
        const targetRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        targetRenderer.setSize(width, height);
        targetRenderer.setClearColor(0x000000, 0);
        targetRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        targetRenderer.shadowMap.enabled = true;
        targetRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Injetar Canvas no container de forma absoluta no fundo
        const canvasElement = targetRenderer.domElement;
        canvasElement.style.position = 'absolute';
        canvasElement.style.top = '0';
        canvasElement.style.left = '0';
        canvasElement.style.width = '100%';
        canvasElement.style.height = '100%';
        canvasElement.style.zIndex = '1';
        container.appendChild(canvasElement);

        // Subir z-index de outros elementos irmãos no container (hotspots, etc.)
        const siblings = container.children;
        for (let i = 0; i < siblings.length; i++) {
            if (siblings[i] !== canvasElement) {
                siblings[i].style.position = 'absolute';
                siblings[i].style.zIndex = '10';
            }
        }

        // Controles de câmera (OrbitControls)
        const targetControls = new THREE.OrbitControls(targetCamera, targetRenderer.domElement);
        targetControls.enableDamping = true;
        targetControls.dampingFactor = 0.05;
        targetControls.maxPolarAngle = Math.PI / 2 - 0.05;
        targetControls.minDistance = 3;
        targetControls.maxDistance = 12;
        if (isHome) {
            targetControls.enableZoom = false; // Evita interferência no scroll na Home
        }

        // Luzes ambientais e direcionais premium
        const ambientLight = new THREE.AmbientLight(0x0a1e3f, 2.0);
        targetScene.add(ambientLight);

        const dirLight1 = new THREE.DirectionalLight(0x3b82f6, 3.0); // Azul
        dirLight1.position.set(5, 5, 2);
        dirLight1.castShadow = true;
        targetScene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 2.5); // Ciano
        dirLight2.position.set(-5, 3, -2);
        targetScene.add(dirLight2);

        const spotLight = new THREE.SpotLight(0xffffff, 4); // Destaque de teto
        spotLight.position.set(0, 8, 0);
        spotLight.angle = Math.PI / 4;
        spotLight.penumbra = 0.5;
        targetScene.add(spotLight);

        // Grupo do carro
        const targetCarGroup = new THREE.Group();
        targetScene.add(targetCarGroup);

        // Criar indicador de carregamento dinâmico e ocultar imagem estática de imediato
        let loadingIndicator = document.createElement('div');
        loadingIndicator.style.position = 'absolute';
        loadingIndicator.style.top = '50%';
        loadingIndicator.style.left = '50%';
        loadingIndicator.style.transform = 'translate(-50%, -50%)';
        loadingIndicator.style.zIndex = '20';
        loadingIndicator.style.display = 'flex';
        loadingIndicator.style.flexDirection = 'column';
        loadingIndicator.style.alignItems = 'center';
        loadingIndicator.style.gap = '12px';
        loadingIndicator.innerHTML = `
            <div style="width: 32px; height: 32px; border: 3px solid rgba(6,182,212,0.15); border-top-color: var(--secondary); border-radius: 50%; animation: spin-loader 1s linear infinite;"></div>
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--secondary);">Carregando Modelo 3D...</span>
        `;
        container.appendChild(loadingIndicator);

        if (isHome) {
            const carImage = document.getElementById('carImage');
            if (carImage) carImage.style.display = 'none';
            const toggleBtn = document.getElementById('btn-toggle-3d-mode');
            if (toggleBtn) toggleBtn.style.display = 'none';
        }

        // Carregar o modelo real Jeep GLTF de forma segura
        let loader = null;
        if (typeof THREE.GLTFLoader === 'function') {
            loader = new THREE.GLTFLoader();
        } else if (typeof GLTFLoader === 'function') {
            loader = new GLTFLoader();
        }

        if (loader) {
            // Escapar espaços no caminho da pasta ('Carro 3D' -> 'Carro%203D')
            loader.load(
                'Carro%203D/2021_jeep_grand_commander_k8.glb',
                function(gltf) {
                    // Remover o indicador de carregamento
                    if (loadingIndicator && loadingIndicator.parentNode) {
                        loadingIndicator.parentNode.removeChild(loadingIndicator);
                    }

                    const model = gltf.scene;

                    // Centralizar e escalonar perfeitamente baseado no Bounding Box
                    const box = new THREE.Box3().setFromObject(model);
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scale = (isHome ? 2.5 : 2.8) / maxDim;
                    model.scale.set(scale, scale, scale);

                    const center = box.getCenter(new THREE.Vector3());
                    model.position.set(
                        -center.x * scale, 
                        -center.y * scale + (isHome ? 0.2 : 0.3), 
                        -center.z * scale
                    );

                    model.traverse(node => {
                        if (node.isMesh) {
                            node.castShadow = true;
                            node.receiveShadow = true;
                            if (node.material) {
                                node.material.wireframe = isWireframeMode;
                                if (!isWireframeMode) {
                                    node.material.metalness = 0.85;
                                    node.material.roughness = 0.15;
                                    if (node.name.toLowerCase().includes('glass') || node.name.toLowerCase().includes('window')) {
                                        node.material.transparent = true;
                                        node.material.opacity = 0.4;
                                    }
                                }
                            }
                        }
                    });

                    targetCarGroup.add(model);
                },
                undefined,
                function(error) {
                    console.warn('Erro ou CORS ao carregar o carro GLTF (.glb), aplicando fallback procedural:', error);
                    if (loadingIndicator && loadingIndicator.parentNode) {
                        loadingIndicator.parentNode.removeChild(loadingIndicator);
                    }
                    buildFallbackCar(targetCarGroup);
                }
            );
        } else {
            console.warn('GLTFLoader não encontrado, aplicando fallback de imediato.');
            if (loadingIndicator && loadingIndicator.parentNode) {
                loadingIndicator.parentNode.removeChild(loadingIndicator);
            }
            buildFallbackCar(targetCarGroup);
        }

        // Adicionar partículas flutuantes
        buildSceneParticles(targetScene);

        // Loop de renderização local
        function animateScene() {
            requestAnimationFrame(animateScene);

            if (targetCarGroup && !targetControls.state === -1) {
                targetCarGroup.rotation.y += 0.003;
            }

            targetControls.update();
            targetRenderer.render(targetScene, targetCamera);
        }
        animateScene();

        // Escutador de redimensionamento
        window.addEventListener('resize', () => {
            const newWidth = container.clientWidth || 600;
            const newHeight = container.clientHeight || 400;
            targetCamera.aspect = newWidth / newHeight;
            targetCamera.updateProjectionMatrix();
            targetRenderer.setSize(newWidth, newHeight);
        });

        return { scene: targetScene, camera: targetCamera, renderer: targetRenderer, carGroup: targetCarGroup, controls: targetControls };
    }

    function buildSceneParticles(targetScene) {
        const particleCount = 150;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 15;
            positions[i + 1] = Math.random() * 5;
            positions[i + 2] = (Math.random() - 0.5) * 15;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0x06b6d4,
            size: 0.04,
            transparent: true,
            opacity: 0.5
        });

        const particles = new THREE.Points(geometry, material);
        targetScene.add(particles);
    }

    function buildFallbackCar(group) {
        const chassiMat = new THREE.MeshStandardMaterial({
            color: 0x1e3a8a,
            wireframe: isWireframeMode,
            transparent: true,
            opacity: 0.8,
            roughness: 0.2,
            metalness: 0.9
        });

        const detailMat = new THREE.MeshStandardMaterial({
            color: 0x06b6d4,
            wireframe: isWireframeMode,
            emissive: 0x0891b2,
            emissiveIntensity: 0.5
        });

        const bodyGeom = new THREE.BoxGeometry(3, 0.8, 1.4);
        const bodyMesh = new THREE.Mesh(bodyGeom, chassiMat);
        bodyMesh.position.y = 0.5;
        group.add(bodyMesh);

        const cabGeom = new THREE.BoxGeometry(1.6, 0.6, 1.2);
        const cabMesh = new THREE.Mesh(cabGeom, new THREE.MeshStandardMaterial({
            color: 0x3b82f6,
            wireframe: isWireframeMode,
            transparent: true,
            opacity: 0.4
        }));
        cabMesh.position.set(-0.2, 1.1, 0);
        group.add(cabMesh);

        const wheelGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        const wheelMat = new THREE.MeshStandardMaterial({
            color: 0x111827,
            wireframe: isWireframeMode,
            roughness: 0.5
        });

        const wheelPositions = [
            { x: 1, y: 0.4, z: 0.75 },
            { x: 1, y: 0.4, z: -0.75 },
            { x: -1, y: 0.4, z: 0.75 },
            { x: -1, y: 0.4, z: -0.75 }
        ];

        wheelPositions.forEach((pos) => {
            const wheel = new THREE.Mesh(wheelGeom, wheelMat);
            wheel.position.set(pos.x, pos.y, pos.z);
            wheel.rotation.x = Math.PI / 2;
            
            const rimGeom = new THREE.RingGeometry(0.2, 0.35, 16);
            const rimMesh = new THREE.Mesh(rimGeom, detailMat);
            rimMesh.position.y = 0.16;
            rimMesh.rotation.x = -Math.PI / 2;
            wheel.add(rimMesh);

            group.add(wheel);
        });

        const gridGeom = new THREE.BoxGeometry(0.1, 0.4, 1.2);
        const gridMesh = new THREE.Mesh(gridGeom, detailMat);
        gridMesh.position.set(1.5, 0.5, 0);
        group.add(gridMesh);
    }

    // 4. INTERATIVIDADE DA UI DO CANVAS 3D
    const btn3dWireframe = document.getElementById('btn-3d-wireframe');
    const btn3dReset = document.getElementById('btn-3d-reset');
    const compButtons = document.querySelectorAll('.comp-3d-btn');
    const inspectedInfo = document.getElementById('inspectedInfo');

    if (btn3dWireframe) {
        // Inicializar texto do botão conforme modo
        btn3dWireframe.innerHTML = isWireframeMode 
            ? '<i data-lucide="layout-grid"></i> Estilo Digital' 
            : '<i data-lucide="box"></i> Estilo Sólido';
        lucide.createIcons();

        btn3dWireframe.addEventListener('click', () => {
            isWireframeMode = !isWireframeMode;
            
            const toggleWireframe = (targetCarGroup) => {
                if (!targetCarGroup) return;
                targetCarGroup.traverse(node => {
                    if (node.isMesh && node.material) {
                        node.material.wireframe = isWireframeMode;
                        if (!isWireframeMode) {
                            node.material.metalness = 0.85;
                            node.material.roughness = 0.15;
                        }
                    }
                });
            };

            // Alternar wireframe nas duas instâncias se estiverem ativas
            if (exploradorSceneData) toggleWireframe(exploradorSceneData.carGroup);
            if (homeSceneData) toggleWireframe(homeSceneData.carGroup);
            
            // Trocar estilo do botão
            btn3dWireframe.innerHTML = isWireframeMode 
                ? '<i data-lucide="layout-grid"></i> Estilo Digital' 
                : '<i data-lucide="box"></i> Estilo Sólido';
            lucide.createIcons();
        });
    }

    if (btn3dReset) {
        btn3dReset.addEventListener('click', () => {
            if (exploradorSceneData && exploradorSceneData.controls) {
                exploradorSceneData.controls.reset();
                exploradorSceneData.camera.position.set(5, 3, 5);
            }
            if (homeSceneData && homeSceneData.controls) {
                homeSceneData.controls.reset();
                homeSceneData.camera.position.set(4, 2, 4);
            }
        });
    }

    compButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            compButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const componentKey = btn.getAttribute('data-comp');
            const data = componentData[componentKey];
            
            if (inspectedInfo && data) {
                inspectedInfo.innerHTML = `
                    <h4>${data.title}</h4>
                    <p>${data.desc}</p>
                    <button class="btn-card-action" style="margin-top: 12px; width: 100%;" onclick="openIdeaModal('${data.title}')">
                        💡 Anotar Ideia sobre esta parte
                    </button>
                `;
            }

            // Mover a câmera do Explorador para inspecionar a parte clicada
            if (exploradorSceneData && exploradorSceneData.carGroup) {
                exploradorSceneData.carGroup.rotation.y = 0;
                if (componentKey === 'bateria') {
                    exploradorSceneData.camera.position.set(0, 1.5, 4);
                } else if (componentKey === 'sensores') {
                    exploradorSceneData.camera.position.set(0, 3, 3);
                } else {
                    exploradorSceneData.camera.position.set(3, 2, 3);
                }
            }
        });
    });

    // Iniciar Three.js ao entrar na aba Explorador
    const linkExplorador = document.querySelector('.nav-link[data-target="explorador"]');
    if (linkExplorador) {
        linkExplorador.addEventListener('click', () => {
            setTimeout(() => {
                if (!exploradorSceneData) {
                    exploradorSceneData = initCarScene(canvas3dContainer, false);
                    
                    // Sincronizar variáveis globais legado para compatibilidade eventual
                    if (exploradorSceneData) {
                        scene = exploradorSceneData.scene;
                        camera = exploradorSceneData.camera;
                        renderer = exploradorSceneData.renderer;
                        carGroup = exploradorSceneData.carGroup;
                        controls = exploradorSceneData.controls;
                    }
                }
            }, 100);
        });
    }

    // Inicializar visualizador 3D do Jeep automaticamente no carregamento da página inicial (Home)
    const carViewBox = document.getElementById('carViewBox');
    if (carViewBox) {
        // Inicializa com um pequeno delay sutil
        setTimeout(() => {
            if (!homeSceneData) {
                homeSceneData = initCarScene(carViewBox, true);
            }
        }, 300);
    }
});
