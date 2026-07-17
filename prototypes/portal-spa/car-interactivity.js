/* ==========================================
   STELLANTIS DICTIONARY - INTERATIVIDADE DO CARRO & 3D (THREE.JS)
   ------------------------------------------------------------------
   Arquitetura (T04b — aprovada pelo CEO):
   - INÍCIO (#sec-home): carro 3D REAL como herói central, leve e rápido.
     Modelo Draco (~1,7 MB), auto-fit por Box3, gira sozinho quando ocioso,
     arrasta p/ girar SEM travar a rolagem da página, hotspots ancorados nas
     peças que levam ao verbete do dicionário. Init preguiçoso (lazy) e o loop
     de render pausa ao sair da Início.
   - EXPLORADOR 3D (#sec-explorador): superfície de interação profunda (futura).
     Preservado; ganchos // TODO (futuro) marcados. Reaproveita o config CARS.
   - Config declarativo CARS = model-agnostic: adicionar/trocar carro = só
     acrescentar item ao array (câmera/escala se auto-ajustam).
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ========================================================
    // 1. HOTSPOTS 2D (SIMULADOR / FALLBACK SEM WebGL)
    //    Estes hotspots sobre a imagem estática são o caminho de FALLBACK
    //    (image-map) quando WebGL não está disponível. Quando o 3D carrega,
    //    a imagem e estes hotspots ficam ocultos (ver HomeStage.init).
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

            hotspotTitle.textContent = title;
            hotspotDesc.textContent = desc;

            const topPercent = parseFloat(hotspot.style.top);
            const leftPercent = parseFloat(hotspot.style.left);

            hotspotInfoCard.style.top = `${topPercent + 6}%`;
            hotspotInfoCard.style.left = `${Math.min(leftPercent - 20, 60)}%`;

            hotspotInfoCard.classList.add('active');
        });
    });

    if (btnCloseCard) {
        btnCloseCard.addEventListener('click', () => {
            hotspotInfoCard.classList.remove('active');
        });
    }

    document.addEventListener('click', (e) => {
        if (hotspotInfoCard && !hotspotInfoCard.contains(e.target) && !e.target.classList.contains('hotspot')) {
            hotspotInfoCard.classList.remove('active');
        }
    });

    if (btnHotspotDict) {
        btnHotspotDict.addEventListener('click', () => {
            hotspotInfoCard.classList.remove('active');

            const navLinkDicionario = document.querySelector('.nav-link[data-target="dicionario"]');
            if (navLinkDicionario) {
                navLinkDicionario.click();
            }

            const searchInput = document.getElementById('searchTerms');
            if (searchInput) {
                const cleanSearch = activeHotspotId === 'grid' ? 'Grade' :
                                    activeHotspotId === 'dashboard' ? 'ADAS' : 'Suspensão';
                searchInput.value = cleanSearch;
                searchInput.dispatchEvent(new Event('input'));
            }
        });
    }

    const modalIdea = document.getElementById('modalIdea');
    if (btnHotspotIdea) {
        btnHotspotIdea.addEventListener('click', () => {
            hotspotInfoCard.classList.remove('active');
            if (window.openIdeaModal) {
                window.openIdeaModal(activeHotspotTitle);
            }
        });
    }

    // Botão legado "Ativar 3D Real" -> agora o 3D é padrão na Início; o botão
    // apenas leva ao Explorador (mantém compatibilidade se estiver visível).
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

            const fullTitle = `Nota sobre ${component}: ${title}`;

            const ideas = JSON.parse(localStorage.getItem('stellantis_ideas')) || [];
            const date = new Date().toLocaleString('pt-BR');
            ideas.push({
                type: 'hotspot',
                title: fullTitle,
                desc: desc,
                date: date
            });
            localStorage.setItem('stellantis_ideas', JSON.stringify(ideas));

            const ideaCountBadges = document.querySelectorAll('#ideaCount');
            ideaCountBadges.forEach(b => b.textContent = ideas.length);

            const savedIdeasList = document.getElementById('savedIdeasList');
            if (savedIdeasList) {
                const customEvent = new CustomEvent('ideaAdded');
                document.dispatchEvent(customEvent);
                location.reload();
            }

            closeModal();
            titleInput.value = '';
            descInput.value = '';
        });
    }


    // ========================================================
    // 3. CONFIG DECLARATIVO DE VEÍCULOS (MODEL-AGNOSTIC)
    // --------------------------------------------------------
    // >>> PONTO DE EXTENSÃO <<< Para adicionar/trocar um carro, basta
    // acrescentar um item a CARS: a câmera e a escala se AUTO-AJUSTAM via Box3.
    // Cada hotspot referencia um `slug` (= id do termo no dicionário) — FONTE
    // ÚNICA DA VERDADE: nome/definição vêm dos termos reais (window.stellantisGetTerm),
    // nunca duplicados aqui. nx,ny,nz são frações do bounding box do carro
    // (nx,nz em [-0.5..0.5], 0=centro; ny=0 meia-altura, +0.5 topo, -0.5 base).
    // Frente do Jeep = +Z, laterais = ±X, topo = +Y.
    // ========================================================
    const CARS = [
        {
            id: 'grand-commander',
            nome: 'Jeep Grand Commander',
            // Início prioriza a versão Draco (~1,7 MB) p/ carga rápida; se o decoder
            // Draco falhar, cai para o .glb completo (~19 MB) sem quebrar.
            url: 'assets/models/jeep.draco.glb',
            urlFallback: 'Carro%203D/2021_jeep_grand_commander_k8.glb',
            fitScale: 2.6,
            hotspots: [
                { slug: 'grid-jeep',       label: 'Grade Frontal & Faróis', nx: 0.10, ny: -0.04, nz: 0.50, w: 122, h: 60 },
                { slug: 'adas',            label: 'Sensores ADAS',          nx: 0.00, ny: 0.30,  nz: 0.22, w: 120, h: 56 },
                { slug: 'cluster-digital', label: 'Cluster Digital',        nx: 0.48, ny: 0.10,  nz: 0.02, w: 110, h: 56 },
                { slug: 'stla-medium',     label: 'Plataforma & Rodas',     nx: 0.50, ny: -0.26, nz: 0.28, w: 88,  h: 88 },
                { slug: 't270',            label: 'Motorização Turbo Flex', nx: 0.14, ny: 0.02,  nz: -0.44, w: 112, h: 56 }
            ]
        }
        // Ex.: adicionar outro carro no futuro (sem tocar no resto do código):
        // { id: 'compass', nome: 'Jeep Compass', url: 'assets/models/compass.glb',
        //   fitScale: 2.6, hotspots: [ { slug:'adas', label:'...', nx:0, ny:0.3, nz:0.2, w:120, h:56 } ] }
    ];
    let activeCarId = 'grand-commander';
    function getActiveCar() { return CARS.find(c => c.id === activeCarId) || CARS[0]; }

    // ---- WebGL disponível? (fallback de primeira classe se não) ----
    function webglAvailable() {
        try {
            const c = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
        } catch (e) { return false; }
    }

    // ---- GLTFLoader com suporte a Draco (decoder local em lib/draco/gltf/) ----
    function makeGltfLoader() {
        let loader = null;
        if (typeof THREE.GLTFLoader === 'function') loader = new THREE.GLTFLoader();
        else if (typeof GLTFLoader === 'function') loader = new GLTFLoader();
        if (loader && typeof THREE.DRACOLoader === 'function') {
            try {
                const draco = new THREE.DRACOLoader();
                draco.setDecoderPath('lib/draco/gltf/'); // draco_wasm_wrapper.js + .wasm locais
                loader.setDRACOLoader(draco);
            } catch (e) { /* segue sem Draco; usará o .glb completo */ }
        }
        return loader;
    }

    // Carrega o modelo do carro: Draco primeiro, .glb completo como rede de segurança.
    function loadCarModel(car, onLoad, onProgress, onError) {
        const loader = makeGltfLoader();
        if (!loader) { if (onError) onError(new Error('GLTFLoader indisponível')); return; }
        loader.load(car.url, onLoad, onProgress, function () {
            if (car.urlFallback) {
                const l2 = makeGltfLoader();
                l2.load(car.urlFallback, onLoad, onProgress, onError);
            } else if (onError) {
                onError(new Error('Falha ao carregar ' + car.url));
            }
        });
    }


    // ========================================================
    //  HOME STAGE — carro 3D herói da Início (estilo T04b)
    // ========================================================
    const HomeStage = (function () {
        const box = document.getElementById('carViewBox');
        let inited = false, running = false, failed = false, rafId = null, ready = false;
        let renderer, scene, camera, carPivot, carModel, canvas, loaderEl, hotspotLayer;
        let hotspots = [];
        let modelSize = null, targetY = 0;
        let spinning = true, reduceMotion = false, needsRender = true, hoverPause = false;
        let dragging = false, lastX = 0, downX = 0, downY = 0, dragMoved = false, velocity = 0;
        let ro = null;
        const _v = new THREE.Vector3();
        const _n = new THREE.Vector3();
        const _cam = new THREE.Vector3();

        function reduced() {
            try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
            catch (e) { return false; }
        }

        // Fallback: revela imagem estática + hotspots 2D (image-map) e some com o 3D
        function showFallback() {
            failed = true;
            const img = document.getElementById('carImage'); if (img) img.style.display = '';
            if (box) box.querySelectorAll('.hotspot').forEach(h => { h.style.display = ''; });
            if (canvas) canvas.style.display = 'none';
            if (hotspotLayer) hotspotLayer.style.display = 'none';
            if (loaderEl && loaderEl.parentNode) loaderEl.parentNode.removeChild(loaderEl);
        }

        function init() {
            if (inited) return;
            inited = true;
            if (!box || !window.THREE || !webglAvailable()) { showFallback(); return; }

            reduceMotion = reduced();
            spinning = !reduceMotion; // prefers-reduced-motion: começa parado (sem auto-rotação)

            // esconde o simulador 2D (imagem + hotspots + botão toggle): vira fallback
            const img = document.getElementById('carImage'); if (img) img.style.display = 'none';
            box.querySelectorAll('.hotspot').forEach(h => { h.style.display = 'none'; });
            const toggle = document.getElementById('btn-toggle-3d-mode'); if (toggle) toggle.style.display = 'none';

            canvas = document.createElement('canvas');
            canvas.className = 'home3d-canvas';
            canvas.setAttribute('aria-label', 'Carro 3D interativo — ' + getActiveCar().nome);
            // pan-y: rolagem vertical continua funcionando; arraste horizontal gira o carro
            canvas.style.touchAction = 'pan-y';
            box.appendChild(canvas);

            hotspotLayer = document.createElement('div');
            hotspotLayer.className = 'home3d-hotspots';
            box.appendChild(hotspotLayer);

            loaderEl = document.createElement('div');
            loaderEl.className = 'home3d-loader';
            loaderEl.innerHTML = '<div class="home3d-spinner" aria-hidden="true"></div><span>Carregando o veículo 3D…</span>';
            box.appendChild(loaderEl);

            const w = box.clientWidth || 600, h = box.clientHeight || 400;
            try {
                renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
            } catch (e) { showFallback(); return; }
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setSize(w, h, false);
            renderer.setClearColor(0x000000, 0);
            if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
            if (THREE.ACESFilmicToneMapping) { renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; }

            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(42, w / h, 0.01, 100);

            scene.add(new THREE.HemisphereLight(0xbfd4ff, 0x0a1020, 0.75));
            const key = new THREE.DirectionalLight(0xffffff, 2.0); key.position.set(4, 6, 3); scene.add(key);
            const fill = new THREE.DirectionalLight(0x6fa8ff, 0.7); fill.position.set(-5, 2, -3); scene.add(fill);
            const rim = new THREE.DirectionalLight(0x8fd0ff, 1.0); rim.position.set(-2, 3.5, -6); scene.add(rim);

            carPivot = new THREE.Group();
            scene.add(carPivot);

            loadCarModel(getActiveCar(), onModel, onProgress, onLoadError);

            canvas.addEventListener('pointerdown', onDown);
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
            window.addEventListener('pointercancel', onUp);

            if (window.ResizeObserver) { ro = new ResizeObserver(onResize); ro.observe(box); }
            window.addEventListener('resize', onResize);
        }

        function onModel(gltf) {
            carModel = gltf.scene;

            // auto-fit por Box3: centraliza e escala qualquer .glb
            const car = getActiveCar();
            const b = new THREE.Box3().setFromObject(carModel);
            const size = b.getSize(new THREE.Vector3());
            const center = b.getCenter(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z) || 1;
            const scale = (car.fitScale || 2.6) / maxDim;
            carModel.position.sub(center);
            carModel.scale.setScalar(scale);
            carModel.updateMatrixWorld(true);

            // re-medir após escala; aterra no y=0 e centraliza x/z (pivô de giro limpo)
            const b2 = new THREE.Box3().setFromObject(carModel);
            modelSize = b2.getSize(new THREE.Vector3());
            const c2 = b2.getCenter(new THREE.Vector3());
            carModel.position.x -= c2.x;
            carModel.position.z -= c2.z;
            carModel.position.y -= b2.min.y;

            carPivot.add(carModel);

            // enquadramento que nunca corta o carro em nenhuma rotação
            const fitDim = Math.max(Math.hypot(modelSize.x, modelSize.z), modelSize.y);
            targetY = modelSize.y * 0.5;
            const vFov = camera.fov * Math.PI / 180;
            const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
            const fov = Math.min(vFov, hFov);
            const dist = (fitDim / 2) / Math.tan(fov / 2) * 1.16;
            const dir = new THREE.Vector3(2.6, 1.4, 3.2).normalize().multiplyScalar(dist);
            camera.position.set(dir.x, dir.y + targetY, dir.z);
            camera.lookAt(0, targetY, 0);

            buildHotspots(car);
            ready = true;
            needsRender = true;
            if (loaderEl && loaderEl.parentNode) loaderEl.parentNode.removeChild(loaderEl);
        }

        function onProgress(xhr) {
            if (loaderEl && xhr && xhr.total) {
                const pct = Math.round((xhr.loaded / xhr.total) * 100);
                const s = loaderEl.querySelector('span');
                if (s) s.textContent = 'Carregando o veículo 3D… ' + pct + '%';
            }
        }
        function onLoadError() { showFallback(); }

        // Constrói os hotspots ancorados. Texto (nome/prévia) vem do TERMO REAL
        // (window.stellantisGetTerm) — fonte única da verdade; label do config é
        // apenas rótulo curto do marcador.
        function buildHotspots(car) {
            hotspots = [];
            (car.hotspots || []).forEach(h => {
                const term = (window.stellantisGetTerm && window.stellantisGetTerm(h.slug)) || null;
                const name = term ? term.title : h.label;
                const preview = term ? truncate(term.def, 120) : '';

                const el = document.createElement('button');
                el.type = 'button';
                el.className = 'home3d-hotspot occluded';
                el.setAttribute('aria-label', 'Peça: ' + name + ' — abrir no dicionário');
                el.innerHTML =
                    '<span class="hs-zone" aria-hidden="true" style="width:' + h.w + 'px;height:' + h.h + 'px;"></span>' +
                    '<span class="hs-mark" aria-hidden="true"></span>' +
                    '<span class="hs-tip"><b>' + name + '</b>' +
                    (preview ? '<span class="hs-d">' + preview + '</span>' : '') +
                    '<span class="hs-go">Abrir no dicionário →</span></span>';

                // Encaminhamento do drag: um pointerdown que começa SOBRE o hotspot
                // arma a mesma máquina de arraste do canvas (onDown). Se virar arraste,
                // o carro gira; se for tap curto, o 'click' navega (ver guarda dragMoved).
                el.addEventListener('pointerdown', onDown);
                el.addEventListener('click', function (ev) {
                    ev.stopPropagation();
                    // se o gesto virou arraste (girou o carro), NÃO navega
                    if (dragMoved) { ev.preventDefault(); return; }
                    if (window.stellantisNavigateToTerm) window.stellantisNavigateToTerm(h.slug);
                });
                // hover/foco pausam a rotação (facilita clicar e evita que o hotspot
                // focado por teclado "fuja" com a tooltip); ao sair, retoma a intenção.
                el.addEventListener('mouseenter', function () { hoverPause = true; });
                el.addEventListener('mouseleave', function () { hoverPause = false; needsRender = true; });
                el.addEventListener('focusin', function () { hoverPause = true; needsRender = true; });
                el.addEventListener('focusout', function () { hoverPause = false; needsRender = true; });

                // âncora local (espaço do carro, y a partir do chão) + normal externa aprox.
                h._anchor = new THREE.Vector3(h.nx * modelSize.x, h.ny * modelSize.y + modelSize.y * 0.5, h.nz * modelSize.z);
                h._normal = new THREE.Vector3(h.nx, 0, h.nz);
                if (h._normal.lengthSq() < 1e-6) h._normal.set(h.nx, h.ny, h.nz);
                h._normal.normalize();
                h._el = el;
                hotspotLayer.appendChild(el);
                hotspots.push(h);
            });
        }

        function truncate(s, n) { return s && s.length > n ? s.slice(0, n - 1).trim() + '…' : (s || ''); }

        function updateHotspots() {
            if (!ready || !hotspotLayer) return;
            const w = box.clientWidth, hh = box.clientHeight;
            carPivot.updateMatrixWorld();
            for (let i = 0; i < hotspots.length; i++) {
                const h = hotspots[i];
                _v.copy(h._anchor).applyMatrix4(carPivot.matrixWorld);
                _n.copy(h._normal).applyQuaternion(carPivot.quaternion);
                _cam.copy(_v).sub(camera.position).normalize();
                const facingAway = _n.dot(_cam) > 0.2;
                _v.project(camera);
                const behind = _v.z > 1;
                if (facingAway || behind) {
                    h._el.classList.add('occluded');
                } else {
                    const x = (_v.x * 0.5 + 0.5) * w;
                    const y = (-_v.y * 0.5 + 0.5) * hh;
                    h._el.classList.remove('occluded');
                    h._el.style.left = x + 'px';
                    h._el.style.top = y + 'px';
                    h._el.classList.toggle('tip-below', y < 118);
                }
            }
        }

        // ---- Interação: arraste horizontal gira; NÃO chama preventDefault no toque
        // (rolagem vertical preservada via touch-action: pan-y). ----
        function onDown(e) {
            dragging = true; dragMoved = false;
            lastX = downX = e.clientX; downY = e.clientY;
            spinning = false; velocity = 0;
        }
        function onMove(e) {
            if (!dragging) return;
            const dx = e.clientX - lastX;
            lastX = e.clientX;
            if (Math.abs(e.clientX - downX) > 5 || Math.abs(e.clientY - downY) > 5) dragMoved = true;
            if (carPivot) { carPivot.rotation.y += dx * 0.01; velocity = dx * 0.01; }
        }
        function onUp(e) {
            if (!dragging) return;
            dragging = false;
            // clique "limpo" no carro (mouse) alterna girar/parar (como no T04b)
            if (!dragMoved && e && e.pointerType === 'mouse' && !reduceMotion) {
                spinning = !spinning;
            }
            needsRender = true;
        }

        function onResize() {
            if (!renderer || !box) return;
            const w = box.clientWidth, h = box.clientHeight;
            if (!w || !h) return;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            needsRender = true;
        }

        function frame() {
            if (!running) { rafId = null; return; }
            let moved = false;
            if (carPivot) {
                if (spinning && !hoverPause && !dragging && !reduceMotion) { carPivot.rotation.y += 0.0032; moved = true; }
                else if (Math.abs(velocity) > 0.0002) { carPivot.rotation.y += velocity; velocity *= 0.94; moved = true; }
            }
            // economia de bateria (mobile): só renderiza quando algo muda de fato.
            if (moved || dragging || needsRender) {
                updateHotspots();
                renderer.render(scene, camera);
                needsRender = false;
            }
            rafId = requestAnimationFrame(frame);
        }

        return {
            start: function () {
                if (failed) return;
                if (!inited) init();
                if (failed) return;
                if (!running) { running = true; needsRender = true; if (!rafId) rafId = requestAnimationFrame(frame); }
            },
            stop: function () {
                running = false;
                if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
            }
        };
    })();


    // ========================================================
    //  EXPLORADOR 3D — superfície de interação profunda (preservado)
    //  Reaproveita CARS + loader Draco. Loop pausa quando a aba não está ativa
    //  (evita dois renderers rodando ao mesmo tempo que a Início).
    // ========================================================
    const canvas3dContainer = document.getElementById('canvas3dContainer');
    let exploradorSceneData = null;
    let exploradorActive = false;
    let exploradorRAF = null;
    let isWireframeMode = false;

    if (!document.getElementById('style-spin-animation')) {
        const style = document.createElement('style');
        style.id = 'style-spin-animation';
        style.innerHTML = `@keyframes spin-loader {0% { transform: rotate(0deg); }100% { transform: rotate(360deg); }}`;
        document.head.appendChild(style);
    }

    // Definições de componentes do painel de inspeção do Explorador (UI legada).
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

    function initExploradorScene(container) {
        if (!container) return null;
        if (!window.THREE || !webglAvailable()) return null;

        const targetScene = new THREE.Scene();
        targetScene.fog = new THREE.FogExp2(0x02050c, 0.015);

        const width = container.clientWidth || 600;
        const height = container.clientHeight || 400;

        const targetCamera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
        targetCamera.position.set(5, 3, 5);

        const targetRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        targetRenderer.setSize(width, height);
        targetRenderer.setClearColor(0x000000, 0);
        targetRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        targetRenderer.shadowMap.enabled = true;
        targetRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

        const canvasElement = targetRenderer.domElement;
        canvasElement.style.position = 'absolute';
        canvasElement.style.top = '0';
        canvasElement.style.left = '0';
        canvasElement.style.width = '100%';
        canvasElement.style.height = '100%';
        canvasElement.style.zIndex = '1';
        container.appendChild(canvasElement);

        const siblings = container.children;
        for (let i = 0; i < siblings.length; i++) {
            if (siblings[i] !== canvasElement) {
                siblings[i].style.position = 'absolute';
                siblings[i].style.zIndex = '10';
            }
        }

        const targetControls = new THREE.OrbitControls(targetCamera, targetRenderer.domElement);
        targetControls.enableDamping = true;
        targetControls.dampingFactor = 0.05;
        targetControls.maxPolarAngle = Math.PI / 2 - 0.05;
        targetControls.minDistance = 3;
        targetControls.maxDistance = 12;

        targetScene.add(new THREE.AmbientLight(0x0a1e3f, 2.0));
        const dirLight1 = new THREE.DirectionalLight(0x3b82f6, 3.0);
        dirLight1.position.set(5, 5, 2); dirLight1.castShadow = true; targetScene.add(dirLight1);
        const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 2.5);
        dirLight2.position.set(-5, 3, -2); targetScene.add(dirLight2);
        const spotLight = new THREE.SpotLight(0xffffff, 4);
        spotLight.position.set(0, 8, 0); spotLight.angle = Math.PI / 4; spotLight.penumbra = 0.5; targetScene.add(spotLight);

        const targetCarGroup = new THREE.Group();
        targetScene.add(targetCarGroup);

        const loadingIndicator = document.createElement('div');
        loadingIndicator.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:20;display:flex;flex-direction:column;align-items:center;gap:12px;';
        loadingIndicator.innerHTML = `
            <div style="width:32px;height:32px;border:3px solid rgba(6,182,212,0.15);border-top-color:var(--secondary);border-radius:50%;animation:spin-loader 1s linear infinite;"></div>
            <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--secondary);">Carregando Modelo 3D...</span>`;
        container.appendChild(loadingIndicator);

        // Carrega via config CARS (mesmo Draco da Início) — model-agnostic.
        loadCarModel(getActiveCar(), function (gltf) {
            if (loadingIndicator.parentNode) loadingIndicator.parentNode.removeChild(loadingIndicator);
            const model = gltf.scene;
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2.8 / maxDim;
            model.scale.set(scale, scale, scale);
            const center = box.getCenter(new THREE.Vector3());
            model.position.set(-center.x * scale, -center.y * scale + 0.3, -center.z * scale);
            model.traverse(node => {
                if (node.isMesh) {
                    node.castShadow = true; node.receiveShadow = true;
                    if (node.material) {
                        node.material.wireframe = isWireframeMode;
                        if (!isWireframeMode) {
                            node.material.metalness = 0.85; node.material.roughness = 0.15;
                            if (node.name.toLowerCase().includes('glass') || node.name.toLowerCase().includes('window')) {
                                node.material.transparent = true; node.material.opacity = 0.4;
                            }
                        }
                    }
                }
            });
            targetCarGroup.add(model);
        }, undefined, function (error) {
            console.warn('Falha ao carregar o carro no Explorador, aplicando fallback procedural:', error);
            if (loadingIndicator.parentNode) loadingIndicator.parentNode.removeChild(loadingIndicator);
            buildFallbackCar(targetCarGroup);
        });

        buildSceneParticles(targetScene);

        window.addEventListener('resize', () => {
            if (!exploradorSceneData) return;
            const newWidth = container.clientWidth || 600;
            const newHeight = container.clientHeight || 400;
            targetCamera.aspect = newWidth / newHeight;
            targetCamera.updateProjectionMatrix();
            targetRenderer.setSize(newWidth, newHeight);
        });

        // TODO (futuro): reaproveitar os hotspots ancorados do config CARS aqui
        //                (mesma projeção usada no HomeStage.updateHotspots).
        // TODO (futuro): vista explodida (separar peças pelo eixo normal).
        // TODO (futuro): entrar no interior/cockpit (carregar .glb de cabine).
        // TODO (futuro): medir peça (raycast + escala real do Box3).
        // TODO (futuro): alternar carro do config (setar activeCarId e recarregar).

        return { scene: targetScene, camera: targetCamera, renderer: targetRenderer, carGroup: targetCarGroup, controls: targetControls };
    }

    function exploradorLoop() {
        if (!exploradorActive || !exploradorSceneData) { exploradorRAF = null; return; }
        const d = exploradorSceneData;
        if (d.carGroup) d.carGroup.rotation.y += 0.003;
        d.controls.update();
        d.renderer.render(d.scene, d.camera);
        exploradorRAF = requestAnimationFrame(exploradorLoop);
    }
    function startExplorador() {
        if (!exploradorSceneData) {
            exploradorSceneData = initExploradorScene(canvas3dContainer);
        }
        if (exploradorSceneData && !exploradorActive) {
            exploradorActive = true;
            if (!exploradorRAF) exploradorRAF = requestAnimationFrame(exploradorLoop);
        }
    }
    function stopExplorador() {
        exploradorActive = false;
        if (exploradorRAF) { cancelAnimationFrame(exploradorRAF); exploradorRAF = null; }
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
        const material = new THREE.PointsMaterial({ color: 0x06b6d4, size: 0.04, transparent: true, opacity: 0.5 });
        targetScene.add(new THREE.Points(geometry, material));
    }

    function buildFallbackCar(group) {
        const chassiMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, wireframe: isWireframeMode, transparent: true, opacity: 0.8, roughness: 0.2, metalness: 0.9 });
        const detailMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, wireframe: isWireframeMode, emissive: 0x0891b2, emissiveIntensity: 0.5 });
        const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(3, 0.8, 1.4), chassiMat);
        bodyMesh.position.y = 0.5; group.add(bodyMesh);
        const cabMesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 1.2), new THREE.MeshStandardMaterial({ color: 0x3b82f6, wireframe: isWireframeMode, transparent: true, opacity: 0.4 }));
        cabMesh.position.set(-0.2, 1.1, 0); group.add(cabMesh);
        const wheelGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, wireframe: isWireframeMode, roughness: 0.5 });
        [{ x: 1, y: 0.4, z: 0.75 }, { x: 1, y: 0.4, z: -0.75 }, { x: -1, y: 0.4, z: 0.75 }, { x: -1, y: 0.4, z: -0.75 }].forEach((pos) => {
            const wheel = new THREE.Mesh(wheelGeom, wheelMat);
            wheel.position.set(pos.x, pos.y, pos.z); wheel.rotation.x = Math.PI / 2;
            const rimMesh = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.35, 16), detailMat);
            rimMesh.position.y = 0.16; rimMesh.rotation.x = -Math.PI / 2; wheel.add(rimMesh);
            group.add(wheel);
        });
        const gridMesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 1.2), detailMat);
        gridMesh.position.set(1.5, 0.5, 0); group.add(gridMesh);
    }


    // ========================================================
    // 4. INTERATIVIDADE DA UI DO EXPLORADOR (wireframe/reset/componentes)
    //    Atua só no Explorador (a Início é o palco herói, sem esses controles).
    // ========================================================
    const btn3dWireframe = document.getElementById('btn-3d-wireframe');
    const btn3dReset = document.getElementById('btn-3d-reset');
    const compButtons = document.querySelectorAll('.comp-3d-btn');
    const inspectedInfo = document.getElementById('inspectedInfo');

    if (btn3dWireframe) {
        btn3dWireframe.innerHTML = isWireframeMode ? '<i data-lucide="layout-grid"></i> Estilo Digital' : '<i data-lucide="box"></i> Estilo Sólido';
        if (window.lucide) lucide.createIcons();
        btn3dWireframe.addEventListener('click', () => {
            isWireframeMode = !isWireframeMode;
            if (exploradorSceneData && exploradorSceneData.carGroup) {
                exploradorSceneData.carGroup.traverse(node => {
                    if (node.isMesh && node.material) {
                        node.material.wireframe = isWireframeMode;
                        if (!isWireframeMode) { node.material.metalness = 0.85; node.material.roughness = 0.15; }
                    }
                });
            }
            btn3dWireframe.innerHTML = isWireframeMode ? '<i data-lucide="layout-grid"></i> Estilo Digital' : '<i data-lucide="box"></i> Estilo Sólido';
            if (window.lucide) lucide.createIcons();
        });
    }

    if (btn3dReset) {
        btn3dReset.addEventListener('click', () => {
            if (exploradorSceneData && exploradorSceneData.controls) {
                exploradorSceneData.controls.reset();
                exploradorSceneData.camera.position.set(5, 3, 5);
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
                    </button>`;
            }
            // TODO (futuro): mover a câmera para focar a peça via Box3 da malha clicada.
            if (exploradorSceneData && exploradorSceneData.carGroup) {
                exploradorSceneData.carGroup.rotation.y = 0;
                if (componentKey === 'bateria') exploradorSceneData.camera.position.set(0, 1.5, 4);
                else if (componentKey === 'sensores') exploradorSceneData.camera.position.set(0, 3, 3);
                else exploradorSceneData.camera.position.set(3, 2, 3);
            }
        });
    });


    // ========================================================
    // 5. CONTROLE DE CICLO DE VIDA POR SEÇÃO ATIVA
    //    Um só renderer roda por vez: observa a classe .active das seções e
    //    (re)inicia/pausa Início e Explorador conforme a aba visível.
    // ========================================================
    const homeSection = document.getElementById('sec-home');
    const exploradorSection = document.getElementById('sec-explorador');

    function syncActiveScenes() {
        const homeActive = homeSection && homeSection.classList.contains('active');
        const expActive = exploradorSection && exploradorSection.classList.contains('active');
        if (homeActive) HomeStage.start(); else HomeStage.stop();
        if (expActive) startExplorador(); else stopExplorador();
    }

    if (window.MutationObserver) {
        const obs = new MutationObserver(syncActiveScenes);
        [homeSection, exploradorSection].forEach(sec => {
            if (sec) obs.observe(sec, { attributes: true, attributeFilter: ['class'] });
        });
    }
    // fallback extra: clique de navegação também sincroniza
    document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => setTimeout(syncActiveScenes, 60)));

    // Estado inicial (Início é a seção ativa por padrão).
    setTimeout(syncActiveScenes, 250);
});
