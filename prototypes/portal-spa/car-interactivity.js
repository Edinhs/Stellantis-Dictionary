/* ==========================================================================
   STELLANTIS DICTIONARY — MOTOR 3D (portado de T04b: main-3d-explorer.html)
   --------------------------------------------------------------------------
   Substitui a implementação 3D anterior pelo MOTOR aprovado pelo CEO (T04b):
   three.js LOCAL + Jeep real (.glb Draco) + OrbitControls + auto-rotação com
   toggle + barra de zoom + alternador Exterior/Interior + hotspots vermelhos
   projetados com tooltip (nome/prévia do TERMO real) e ações "Ver no dicionário"
   / "Inserir ideia".

   O MESMO motor (fábrica createCarEngine) é montado em DUAS superfícies:
     - HERO da Início  → #carViewBox  (init preguiçoso; loop pausa ao sair)
     - Explorador 3D   → #canvas3dContainer

   PONTE (contrato imutável, definido em app.js):
     window.stellantisGetTerm(slug)        → termo cujo id === slug (ou null)
     window.stellantisNavigateToTerm(slug) → vai ao Dicionário e abre o verbete
     window.openIdeaModal(title)           → abre o modal de ideia

   FONTE ÚNICA DA VERDADE: cada hotspot referencia um `slug` = id do termo no
   dicionário. Nome/prévia da tooltip vêm de stellantisGetTerm(slug); o `label`
   do config (texto do T04b) é apenas rótulo curto / rede de segurança.

   Assets/libs LOCAIS (offline; servir por HTTP, NUNCA file://):
     lib/three.min.js, OrbitControls.js, GLTFLoader.js, DRACOLoader.js,
     RoomEnvironment.js ; lib/draco/gltf/* ; assets/models/jeep.draco.glb
     (fallback assets/models/jeep.glb).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ========================================================
    // 1. HOTSPOTS 2D (FALLBACK SEM WebGL) + INFO CARD
    //    Sobre a imagem estática do hero: caminho de fallback (image-map)
    //    quando WebGL não está disponível. Com o 3D ativo, imagem e estes
    //    hotspots ficam ocultos (ver heroEngine.onFallback / init).
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
            // mapeia os ids do fallback 2D para slugs reais do dicionário
            const slug = activeHotspotId === 'grid' ? 'grid-jeep' :
                         activeHotspotId === 'dashboard' ? 'adas' : 'stla-medium';
            if (window.stellantisNavigateToTerm) window.stellantisNavigateToTerm(slug);
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

    // Botão legado "Ativar 3D Real": com o 3D já padrão na Início, apenas leva ao
    // Explorador (só fica visível no fallback sem WebGL).
    const btnToggle3dMode = document.getElementById('btn-toggle-3d-mode');
    if (btnToggle3dMode) {
        btnToggle3dMode.addEventListener('click', () => {
            const navLinkExplorador = document.querySelector('.nav-link[data-target="explorador"]');
            if (navLinkExplorador) navLinkExplorador.click();
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
        if (modalIdea) modalIdea.classList.remove('open');
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
            ideas.push({ type: 'hotspot', title: fullTitle, desc: desc, date: date });
            localStorage.setItem('stellantis_ideas', JSON.stringify(ideas));

            const ideaCountBadges = document.querySelectorAll('#ideaCount');
            ideaCountBadges.forEach(b => b.textContent = ideas.length);

            const savedIdeasList = document.getElementById('savedIdeasList');
            if (savedIdeasList) {
                document.dispatchEvent(new CustomEvent('ideaAdded'));
                location.reload();
            }

            closeModal();
            titleInput.value = '';
            descInput.value = '';
        });
    }


    // ========================================================
    // 3. CONFIG DE VEÍCULO + HOTSPOTS (semente cockpit_hotspots.json)
    // --------------------------------------------------------
    // EXTERIOR — posição normalizada nx,ny,nz no bounding box do carro
    //   (nx,nz em [-0.5..0.5], 0=centro; ny=0 meia-altura, +0.5 topo, -0.5 base;
    //    frente do Jeep = +Z, laterais = ±X, topo = +Y).
    // INTERIOR — posição absoluta px,py,pz no grupo do cockpit (placeholder).
    //
    // *** MAPEAMENTO DURO DE SLUG (requisito de paridade) ***
    // Os slugs do T04b (hud, grade-farois, rodas, lanternas, carroceria) NÃO
    // existem no dicionário. Mantemos os LABELS do T04b, mas cada `slug` aponta
    // para um id REAL do dicionário (resolve via stellantisGetTerm), preservando
    // o conjunto que já funcionava: grid-jeep, adas, cluster-digital, stla-medium,
    // t270. Idem no interior (mapeado para termos de cockpit existentes).
    // ========================================================
    const CAR = {
        id: 'grand-commander',
        nome: 'Jeep Grand Commander',
        url: 'assets/models/jeep.draco.glb',       // Draco (~1,7 MB): carga rápida
        urlFallback: 'assets/models/jeep.glb',      // .glb completo: rede de segurança
        fitScale: 2.6,
        exterior: [
            { slug: 'adas',            label: 'Head-Up Display (HUD)',  nx: 0.00, ny: 0.30,  nz: 0.22, w: 128, h: 66 },
            { slug: 'grid-jeep',       label: 'Grade & Faróis',         nx: 0.18, ny: -0.02, nz: 0.48, w: 120, h: 62 },
            { slug: 'stla-medium',     label: 'Rodas & Pneus',          nx: 0.50, ny: -0.26, nz: 0.26, w: 88,  h: 88 },
            { slug: 't270',            label: 'Lanternas / Traseira',   nx: 0.14, ny: 0.04,  nz: -0.49, w: 110, h: 66 },
            { slug: 'cluster-digital', label: 'Carroceria',             nx: 0.50, ny: 0.14,  nz: -0.02, w: 150, h: 92 }
        ],
        interior: [
            { slug: 'adas',            label: 'Head-Up Display (HUD)',    px: -0.55, py: 1.22, pz: 0.52, w: 96,  h: 46 },
            { slug: 'cluster-digital', label: 'Cluster / Painel Digital', px: -0.55, py: 1.04, pz: 0.44, w: 100, h: 58 },
            { slug: 'cluster-digital', label: 'Central Multimídia',       px: 0.02,  py: 1.04, pz: 0.47, w: 92,  h: 66 },
            { slug: 'adas',            label: 'Comandos do Volante',      px: -0.55, py: 0.88, pz: 0.34, w: 82,  h: 82 },
            { slug: 'etcu',            label: 'Console / Eletrônica',     px: 0.00,  py: 0.90, pz: 0.24, w: 74,  h: 60 }
        ]
    };

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
    // Draco primeiro; .glb completo como rede de segurança.
    function loadModel(onLoad, onProgress, onError) {
        const loader = makeGltfLoader();
        if (!loader) { if (onError) onError(new Error('GLTFLoader indisponível')); return; }
        loader.load(CAR.url, onLoad, onProgress, function () {
            const l2 = makeGltfLoader();
            if (!l2) { if (onError) onError(new Error('GLTFLoader indisponível')); return; }
            l2.load(CAR.urlFallback, onLoad, onProgress, onError);
        });
    }

    function truncate(s, n) { return s && s.length > n ? s.slice(0, n - 1).trim() + '…' : (s || ''); }
    function hsName(h) { const t = window.stellantisGetTerm && window.stellantisGetTerm(h.slug); return t ? t.title : h.label; }
    function hsPreview(h) { const t = window.stellantisGetTerm && window.stellantisGetTerm(h.slug); return t ? truncate(t.def, 120) : (h.def || ''); }
    function reducedMotion() {
        try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
        catch (e) { return false; }
    }


    // ========================================================
    // 4. FÁBRICA DO MOTOR 3D (T04b) — montável em qualquer container
    // --------------------------------------------------------
    //   opts: { showHint, showViewTabs, showZoom, showRotBtn, onFallback,
    //           onReady, label }
    //   Retorna API: { start, stop, isFailed, setWireframe, resetCamera,
    //                  focusComponent }
    // ========================================================
    function createCarEngine(stage, opts) {
        opts = opts || {};
        let inited = false, running = false, failed = false, rafId = null, carReady = false;
        let renderer, scene, camera, controls, canvas, loaderEl, fallbackEl;
        let carRoot = null, interiorGroup = null, ground = null, contactShadow = null;
        let carSize = new THREE.Vector3();
        let fitCenter = new THREE.Vector3();
        // Enquadramento POR EIXO (corrige o vazio vertical do "diagonal no eixo mais apertado"):
        //   fitW = maior silhueta HORIZONTAL do carro em 360° (hypot(x,z)) → limitada pela FOV horizontal
        //   fitH = altura do carro (y)                                    → limitada pela FOV vertical
        // frameDist = distância que enquadra bem (câmera inicial / reset / troca de vista).
        // minDistance/maxDistance ficam ABAIXO/ACIMA dela → dá pra APROXIMAR (zoom in) e afastar.
        let fitW = 3, fitH = 2, frameDist = 3;
        const FRAME_MARGIN = 1.06;   // folga pequena p/ o carro não encostar nas bordas
        const ZOOM_IN_FACTOR = 0.5;  // zoom-in máximo = metade do enquadramento (carro ~2x maior)
        const ZOOM_OUT_FACTOR = 1.9; // zoom-out máximo
        let currentView = 'exterior';
        let extHotspots = [], intHotspots = [], activeHotspots = [];
        let spinning = true, reduceMotion = false, wireframe = false;
        let ro = null, resizeHandler = null;
        const EXT_DIR = new THREE.Vector3(3.4, 1.8, 4.2);
        const INT_DIR = new THREE.Vector3(0.28, 0.34, -1);
        const _v = new THREE.Vector3(), _camDir = new THREE.Vector3(), _n = new THREE.Vector3();

        // ---- elementos de UI (namespaced c3d-*) ----
        let rotbtn = null, rotbtnLabel = null, hintEl = null;
        let viewExtBtn = null, viewIntBtn = null;
        let zSvg = null, zHandle = null, zDragging = false;

        function showFallback() {
            failed = true;
            if (canvas) canvas.style.display = 'none';
            if (loaderEl && loaderEl.parentNode) loaderEl.parentNode.removeChild(loaderEl);
            [rotbtn, hintEl].forEach(el => { if (el) el.style.display = 'none'; });
            const vt = stage.querySelector('.c3d-viewtabs'); if (vt) vt.style.display = 'none';
            const zc = stage.querySelector('.c3d-zoomctl'); if (zc) zc.style.display = 'none';
            if (opts.onFallback) opts.onFallback();
            else if (fallbackEl) fallbackEl.classList.add('show');
        }

        function init() {
            if (inited) return;
            inited = true;
            if (!stage || !window.THREE || !webglAvailable()) { showFallback(); return; }

            reduceMotion = reducedMotion();
            spinning = !reduceMotion;

            canvas = document.createElement('canvas');
            canvas.className = 'home3d-canvas';
            canvas.setAttribute('aria-label', 'Carro 3D interativo — ' + (opts.label || CAR.nome));
            canvas.style.touchAction = 'none';
            stage.appendChild(canvas);

            loaderEl = document.createElement('div');
            loaderEl.className = 'home3d-loader';
            loaderEl.innerHTML = '<div class="home3d-spinner" aria-hidden="true"></div><span>Carregando o veículo 3D…</span>';
            stage.appendChild(loaderEl);

            const w = stage.clientWidth || 600, h = stage.clientHeight || 400;
            try {
                renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
            } catch (e) { showFallback(); return; }
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setSize(w, h, false);
            renderer.setClearColor(0x000000, 0);
            if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
            if (THREE.ACESFilmicToneMapping) { renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; }
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(42, w / h, 0.01, 100);
            camera.position.set(3.4, 1.8, 4.2);

            // ambiente (reflexos na pintura)
            try {
                if (THREE.RoomEnvironment) {
                    const pmrem = new THREE.PMREMGenerator(renderer);
                    scene.environment = pmrem.fromScene(new THREE.RoomEnvironment(renderer), 0.04).texture;
                }
            } catch (e) {}

            scene.add(new THREE.HemisphereLight(0xbfd4ff, 0x0a1020, 0.55));
            const key = new THREE.DirectionalLight(0xffffff, 2.0);
            key.position.set(4, 6, 3); key.castShadow = true;
            key.shadow.mapSize.set(1024, 1024);
            key.shadow.camera.near = 0.5; key.shadow.camera.far = 30;
            key.shadow.camera.left = -4; key.shadow.camera.right = 4; key.shadow.camera.top = 4; key.shadow.camera.bottom = -4;
            key.shadow.bias = -0.0005; scene.add(key);
            const fill = new THREE.DirectionalLight(0x6fa8ff, 0.7); fill.position.set(-5, 2, -3); scene.add(fill);
            const rim = new THREE.DirectionalLight(0x8fd0ff, 1.1); rim.position.set(-2, 3.5, -6); scene.add(rim);

            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.08;
            controls.enablePan = false;
            controls.autoRotate = spinning;
            controls.autoRotateSpeed = 1.1;
            controls.minDistance = 2.2;
            controls.maxDistance = 8;
            controls.minPolarAngle = 0.15;
            controls.maxPolarAngle = Math.PI * 0.52;
            controls.addEventListener('start', () => { controls.autoRotate = false; });
            controls.addEventListener('end', () => { controls.autoRotate = spinning; });

            // chão com sombra de contato
            ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.5 }));
            ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
            buildContactShadow();

            buildControlsUI();

            loadModel(onModel, onProgress, onLoadError);

            resizeHandler = resize;
            if (window.ResizeObserver) { ro = new ResizeObserver(resize); ro.observe(stage); }
            window.addEventListener('resize', resizeHandler);
        }

        function buildContactShadow() {
            const c = document.createElement('canvas'); c.width = c.height = 256;
            const ctx = c.getContext('2d');
            const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 128);
            g.addColorStop(0, 'rgba(0,0,0,0.82)'); g.addColorStop(0.45, 'rgba(0,0,0,0.45)');
            g.addColorStop(0.75, 'rgba(0,0,0,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
            const tex = new THREE.CanvasTexture(c);
            const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
            contactShadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
            contactShadow.rotation.x = -Math.PI / 2; contactShadow.position.y = 0.002; scene.add(contactShadow);
        }

        function onModel(gltf) {
            const car = gltf.scene; carRoot = car;
            let box = new THREE.Box3().setFromObject(car);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z) || 1;
            const scale = (CAR.fitScale || 2.6) / maxDim;
            car.position.sub(center); car.scale.setScalar(scale); car.updateMatrixWorld(true);

            const box2 = new THREE.Box3().setFromObject(car);
            box2.getSize(carSize);
            const c2 = box2.getCenter(new THREE.Vector3());
            car.position.x -= c2.x; car.position.z -= c2.z; car.position.y -= box2.min.y;
            car.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
            scene.add(car);

            const fb = new THREE.Box3().setFromObject(car);
            fb.getSize(carSize);
            const sph = fb.getBoundingSphere(new THREE.Sphere());
            fitCenter.copy(sph.center);
            fitW = Math.hypot(carSize.x, carSize.z); fitH = carSize.y;
            if (contactShadow) {
                contactShadow.scale.set(carSize.x * 1.85, carSize.z * 1.5, 1);
                contactShadow.position.x = fitCenter.x; contactShadow.position.z = fitCenter.z;
            }
            controls.target.copy(fitCenter);
            applyZoomLimits();
            let dir0 = camera.position.clone().sub(fitCenter);
            if (dir0.lengthSq() < 1e-6) dir0.set(3.4, 1.8, 4.2);
            dir0.setLength(frameDist); // parte no enquadramento (permite zoom in E out a partir dele)
            camera.position.copy(fitCenter).add(dir0);
            controls.update();

            buildInterior();
            extHotspots = buildHotspots(CAR.exterior, 'exterior');
            intHotspots = buildHotspots(CAR.interior, 'interior');
            activeHotspots = extHotspots;
            syncHandle();
            carReady = true;
            if (loaderEl && loaderEl.parentNode) loaderEl.parentNode.removeChild(loaderEl);
            if (opts.onReady) opts.onReady();
        }

        function onProgress(xhr) {
            if (loaderEl && xhr && xhr.total) {
                const pct = Math.round((xhr.loaded / xhr.total) * 100);
                const s = loaderEl.querySelector('span');
                if (s) s.textContent = 'Carregando o veículo 3D… ' + pct + '%';
            }
        }
        function onLoadError() { showFallback(); }

        // ---- Hotspots ancorados (marcador vermelho + tooltip com 2 ações) ----
        function buildHotspots(list, mode) {
            const arr = [];
            const hidden = mode !== currentView;
            (list || []).forEach(h => {
                const name = hsName(h), preview = hsPreview(h);
                const el = document.createElement('div');
                el.className = 'home3d-hotspot occluded c3d-' + mode + (hidden ? ' c3d-hidden' : '');
                el.innerHTML =
                    '<span class="hs-zone" aria-hidden="true" style="width:' + h.w + 'px;height:' + h.h + 'px;"></span>' +
                    '<button class="hs-mark" type="button" aria-label="' + name + ' — abrir no dicionário"></button>' +
                    '<div class="hs-tip" role="group" aria-label="' + name + '">' +
                        '<b>' + name + '</b>' +
                        (preview ? '<span class="hs-d">' + preview + '</span>' : '') +
                        '<span class="hs-actions">' +
                            '<button type="button" class="hs-go">Ver no dicionário →</button>' +
                            '<button type="button" class="hs-idea">Inserir ideia</button>' +
                        '</span>' +
                    '</div>';

                const mark = el.querySelector('.hs-mark');
                const go = el.querySelector('.hs-go');
                const idea = el.querySelector('.hs-idea');
                function navigate(ev) { if (ev) ev.stopPropagation(); if (window.stellantisNavigateToTerm) window.stellantisNavigateToTerm(h.slug); }
                function insertIdea(ev) { if (ev) ev.stopPropagation(); if (window.openIdeaModal) window.openIdeaModal(name); }
                mark.addEventListener('click', navigate);
                go.addEventListener('click', navigate);
                idea.addEventListener('click', insertIdea);
                el.addEventListener('mouseenter', () => { controls.autoRotate = false; });
                el.addEventListener('mouseleave', () => { controls.autoRotate = spinning; });
                el.addEventListener('focusin', () => { controls.autoRotate = false; });
                el.addEventListener('focusout', () => { controls.autoRotate = spinning; });

                if (mode === 'interior') {
                    h._pos = new THREE.Vector3(h.px, h.py, h.pz);
                } else {
                    h._pos = new THREE.Vector3(h.nx * carSize.x, h.ny * carSize.y + carSize.y * 0.5, h.nz * carSize.z);
                }
                h._mode = mode; h._el = el;
                stage.appendChild(el);
                arr.push(h);
            });
            return arr;
        }

        // ---- Cena de INTERIOR (placeholder procedural, licença livre / own work) ----
        function buildInterior() {
            interiorGroup = new THREE.Group();
            interiorGroup.name = 'cockpit-interior-placeholder';
            const matPlastic = new THREE.MeshStandardMaterial({ color: 0x141a30, roughness: 0.9, metalness: 0.05 });
            const matDark = new THREE.MeshStandardMaterial({ color: 0x0c1020, roughness: 0.8 });
            const matScreen = new THREE.MeshStandardMaterial({ color: 0x0a1638, emissive: 0x24408f, emissiveIntensity: 0.7, roughness: 0.35 });
            const matHud = new THREE.MeshStandardMaterial({ color: 0x9fd8ff, emissive: 0x6fa8ff, emissiveIntensity: 1.0, transparent: true, opacity: 0.9 });
            const matGlass = new THREE.MeshStandardMaterial({ color: 0x8fb4ff, transparent: true, opacity: 0.10, roughness: 0.1 });
            const matMetal = new THREE.MeshStandardMaterial({ color: 0x2a3048, roughness: 0.4, metalness: 0.7 });
            const matSeat = new THREE.MeshStandardMaterial({ color: 0x1a1f36, roughness: 1.0 });
            const matAccent = new THREE.MeshStandardMaterial({ color: 0xff3b3b, emissive: 0x661010, emissiveIntensity: 0.4, roughness: 0.5 });
            function box(w, h, d, mat, x, y, z, rx) {
                const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
                m.position.set(x, y, z); if (rx) m.rotation.x = rx;
                m.castShadow = true; m.receiveShadow = true; interiorGroup.add(m); return m;
            }
            box(2.2, 0.05, 2.0, matDark, 0, 0.55, 0.0);
            box(2.0, 0.34, 0.5, matPlastic, 0, 0.98, 0.62);
            box(2.0, 0.06, 0.18, matDark, 0, 1.16, 0.5);
            box(2.0, 0.6, 0.02, matGlass, 0, 1.35, 0.78, -0.5);
            box(2.0, 0.05, 0.05, matPlastic, 0, 1.62, 0.5);
            box(0.42, 0.22, 0.02, matScreen, -0.55, 1.02, 0.42, -0.15);
            box(0.30, 0.12, 0.01, matHud, -0.55, 1.20, 0.50, -0.4);
            box(0.34, 0.26, 0.02, matScreen, 0.02, 1.02, 0.45, -0.2);
            box(0.36, 0.30, 0.9, matPlastic, 0.0, 0.72, 0.05);
            box(0.28, 0.02, 0.2, matAccent, 0.0, 0.90, 0.24);
            const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.03, 12, 32), matMetal);
            wheel.position.set(-0.55, 0.9, 0.30); wheel.rotation.x = Math.PI / 2 - 0.5; wheel.castShadow = true; interiorGroup.add(wheel);
            box(0.12, 0.08, 0.04, matDark, -0.55, 0.9, 0.30, -0.5);
            box(0.05, 0.03, 0.02, matAccent, -0.63, 0.86, 0.33, -0.5);
            box(0.05, 0.03, 0.02, matAccent, -0.47, 0.86, 0.33, -0.5);
            const spk = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 20), matDark);
            spk.position.set(-1.0, 0.85, 0.1); spk.rotation.z = Math.PI / 2; interiorGroup.add(spk);
            box(0.5, 0.5, 0.2, matSeat, -0.5, 0.85, -0.55);
            box(0.5, 0.1, 0.5, matSeat, -0.5, 0.62, -0.4);
            box(0.5, 0.5, 0.2, matSeat, 0.5, 0.85, -0.55);
            box(0.5, 0.1, 0.5, matSeat, 0.5, 0.62, -0.4);
            box(0.22, 0.07, 0.04, matDark, 0.0, 1.5, 0.5);
            interiorGroup.visible = false;
            scene.add(interiorGroup);
        }

        function frameObject(obj, dir) {
            const fb = new THREE.Box3().setFromObject(obj);
            const sz = fb.getSize(new THREE.Vector3());
            const sph = fb.getBoundingSphere(new THREE.Sphere());
            fitCenter.copy(sph.center);
            fitW = Math.hypot(sz.x, sz.z); fitH = sz.y;
            controls.target.copy(fitCenter);
            applyZoomLimits();
            const d = dir.clone(); if (d.lengthSq() < 1e-6) d.set(3.4, 1.8, 4.2);
            d.setLength(frameDist);
            camera.position.copy(fitCenter).add(d);
            controls.update();
        }

        function switchView(view) {
            if (view === currentView || !carReady) return;
            currentView = view;
            const toInterior = view === 'interior';
            if (carRoot) carRoot.visible = !toInterior;
            if (ground) ground.visible = !toInterior;
            if (contactShadow) contactShadow.visible = !toInterior;
            if (interiorGroup) interiorGroup.visible = toInterior;
            extHotspots.forEach(h => { h._el.classList.toggle('c3d-hidden', toInterior); h._el.classList.add('occluded'); });
            intHotspots.forEach(h => { h._el.classList.toggle('c3d-hidden', !toInterior); h._el.classList.add('occluded'); });
            activeHotspots = toInterior ? intHotspots : extHotspots;
            frameObject(toInterior ? interiorGroup : carRoot, toInterior ? INT_DIR : EXT_DIR);
            if (viewExtBtn) viewExtBtn.setAttribute('aria-pressed', (!toInterior).toString());
            if (viewIntBtn) viewIntBtn.setAttribute('aria-pressed', toInterior.toString());
            syncHandle();
        }

        // ---- UI: hint, botão girar/parar, alternador de vista, barra de zoom ----
        function buildControlsUI() {
            if (opts.showHint) {
                hintEl = document.createElement('div');
                hintEl.className = 'c3d-hint';
                hintEl.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2"/></svg><span>Arraste para girar • clique nos pontos</span>';
                stage.appendChild(hintEl);
            }
            if (opts.showRotBtn !== false) {
                rotbtn = document.createElement('button');
                rotbtn.type = 'button';
                rotbtn.className = 'c3d-rotbtn';
                rotbtn.setAttribute('aria-pressed', 'true');
                rotbtn.setAttribute('aria-label', 'Pausar rotação automática');
                rotbtn.innerHTML = '<svg class="ico-pause" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg><svg class="ico-play" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5l12 7-12 7z"/></svg><span class="c3d-rotlabel">Girando</span>';
                rotbtnLabel = rotbtn.querySelector('.c3d-rotlabel');
                rotbtn.addEventListener('click', () => setSpinning(!spinning));
                stage.appendChild(rotbtn);
            }
            if (opts.showViewTabs !== false) {
                const vt = document.createElement('div');
                vt.className = 'c3d-viewtabs'; vt.setAttribute('role', 'group');
                vt.setAttribute('aria-label', 'Alternar entre vista externa e interna do veículo');
                vt.innerHTML =
                    '<button class="c3d-viewtab" type="button" aria-pressed="true" data-view="exterior">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 13l2-5a2 2 0 0 1 1.9-1.4h10.2A2 2 0 0 1 19 8l2 5"/><path d="M3 13h18v3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><circle cx="7" cy="13" r="1"/><circle cx="17" cy="13" r="1"/></svg>Exterior</button>' +
                    '<button class="c3d-viewtab" type="button" aria-pressed="false" data-view="interior">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 18 0"/><path d="M3 12v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/><circle cx="12" cy="12" r="2.4"/><path d="M12 5v2M6.5 7.5l1.4 1.4M17.5 7.5l-1.4 1.4"/></svg>Interior</button>';
                viewExtBtn = vt.querySelector('[data-view="exterior"]');
                viewIntBtn = vt.querySelector('[data-view="interior"]');
                viewExtBtn.addEventListener('click', () => switchView('exterior'));
                viewIntBtn.addEventListener('click', () => switchView('interior'));
                stage.appendChild(vt);
            }
            if (opts.showZoom !== false) buildZoomSlider();
            if (reduceMotion) setSpinning(false);
        }

        function setSpinning(v) {
            spinning = v;
            if (controls) controls.autoRotate = v;
            if (rotbtn) {
                rotbtn.classList.toggle('is-paused', !v);
                rotbtn.setAttribute('aria-pressed', v ? 'true' : 'false');
                rotbtn.setAttribute('aria-label', v ? 'Pausar rotação automática' : 'Retomar rotação automática');
            }
            if (rotbtnLabel) rotbtnLabel.textContent = v ? 'Girando' : 'Parado';
        }

        // ---- Barra de zoom (curvada, minimalista) ----
        const ZS = { x0: 16, x1: 204, yEnd: 22, yMid: 30, vbW: 220, vbH: 40 };
        function zPos(t) {
            const x = ZS.x0 + (ZS.x1 - ZS.x0) * t;
            const y = ZS.yEnd * ((1 - t) * (1 - t) + t * t) + 2 * (1 - t) * t * ZS.yMid;
            return { x: x, y: y };
        }
        function buildZoomSlider() {
            const NS = 'http://www.w3.org/2000/svg';
            const wrap = document.createElement('div'); wrap.className = 'c3d-zoomctl';
            zSvg = document.createElementNS(NS, 'svg');
            zSvg.setAttribute('viewBox', '0 0 ' + ZS.vbW + ' ' + ZS.vbH);
            zSvg.setAttribute('width', '200'); zSvg.setAttribute('height', '38');
            zSvg.setAttribute('role', 'slider'); zSvg.setAttribute('aria-label', 'Zoom do veículo');
            const mid = (ZS.x0 + ZS.x1) / 2;
            const track = document.createElementNS(NS, 'path'); track.setAttribute('class', 'zt');
            track.setAttribute('d', 'M ' + ZS.x0 + ' ' + ZS.yEnd + ' Q ' + mid + ' ' + ZS.yMid + ' ' + ZS.x1 + ' ' + ZS.yEnd);
            zHandle = document.createElementNS(NS, 'circle'); zHandle.setAttribute('class', 'zh'); zHandle.setAttribute('r', '8');
            const minus = document.createElementNS(NS, 'text'); minus.setAttribute('x', '8'); minus.setAttribute('y', ZS.yEnd); minus.textContent = '−';
            const plus = document.createElementNS(NS, 'text'); plus.setAttribute('x', ZS.vbW - 8); plus.setAttribute('y', ZS.yEnd); plus.textContent = '+';
            zSvg.appendChild(track); zSvg.appendChild(minus); zSvg.appendChild(plus); zSvg.appendChild(zHandle);
            wrap.appendChild(zSvg); stage.appendChild(wrap);
            function pointerToT(e) {
                const r = zSvg.getBoundingClientRect();
                const vx = (e.clientX - r.left) / r.width * ZS.vbW;
                return Math.min(Math.max((vx - ZS.x0) / (ZS.x1 - ZS.x0), 0), 1);
            }
            function applyT(t) {
                if (!carReady) return;
                const d = controls.maxDistance + t * (controls.minDistance - controls.maxDistance);
                const dir = camera.position.clone().sub(controls.target); dir.setLength(d);
                camera.position.copy(controls.target).add(dir); controls.update();
            }
            zSvg.addEventListener('pointerdown', e => { zDragging = true; try { zSvg.setPointerCapture(e.pointerId); } catch (x) {} applyT(pointerToT(e)); e.preventDefault(); });
            zSvg.addEventListener('pointermove', e => { if (zDragging) applyT(pointerToT(e)); });
            zSvg.addEventListener('pointerup', e => { zDragging = false; try { zSvg.releasePointerCapture(e.pointerId); } catch (x) {} });
            zSvg.addEventListener('pointercancel', () => { zDragging = false; });
        }
        function syncHandle() {
            if (!zHandle || !carReady) return;
            const span = controls.maxDistance - controls.minDistance;
            const d = camera.position.distanceTo(controls.target);
            let t = span > 1e-6 ? (controls.maxDistance - d) / span : 0;
            t = Math.min(Math.max(t, 0), 1);
            const pt = zPos(t);
            zHandle.setAttribute('cx', pt.x.toFixed(1));
            zHandle.setAttribute('cy', pt.y.toFixed(1));
        }

        // Distância que enquadra o carro POR EIXO: a largura (fitW) é limitada pela
        // FOV horizontal e a altura (fitH) pela FOV vertical; usa-se o maior dos dois.
        // Assim, num palco largo, a LARGURA passa a mandar (a diagonal deixa de ser
        // esticada contra o eixo vertical), o carro preenche o palco e some o vazio.
        function computeFrameDistance() {
            const vFov = camera.fov * Math.PI / 180;
            const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
            const distH = (fitW / 2) / Math.tan(hFov / 2);
            const distV = (fitH / 2) / Math.tan(vFov / 2);
            return Math.max(distH, distV) * FRAME_MARGIN;
        }
        function applyZoomLimits() {
            frameDist = computeFrameDistance();
            controls.minDistance = frameDist * ZOOM_IN_FACTOR;  // permite aproximar além do enquadramento
            controls.maxDistance = frameDist * ZOOM_OUT_FACTOR; // permite afastar
        }
        function clampDistance() {
            const dir = camera.position.clone().sub(controls.target);
            const d = dir.length();
            const cd = Math.min(Math.max(d, controls.minDistance), controls.maxDistance);
            if (cd !== d) { dir.setLength(cd); camera.position.copy(controls.target).add(dir); }
        }

        // ---- projeção 3D→2D + oclusão dos hotspots ----
        function updateHotspots() {
            if (!carReady) return;
            const w = stage.clientWidth, hh = stage.clientHeight;
            for (let i = 0; i < activeHotspots.length; i++) {
                const h = activeHotspots[i];
                _v.copy(h._pos); _v.project(camera);
                const x = (_v.x * 0.5 + 0.5) * w;
                const y = (-_v.y * 0.5 + 0.5) * hh;
                let facingAway = false;
                if (h._mode !== 'interior') {
                    _camDir.copy(h._pos).sub(camera.position).normalize();
                    _n.set(h._pos.x, 0, h._pos.z);
                    if (_n.lengthSq() < 1e-6) _n.set(h._pos.x, h._pos.y, h._pos.z);
                    _n.normalize();
                    facingAway = _n.dot(_camDir) > 0.15;
                }
                const behind = _v.z > 1;
                if (facingAway || behind) {
                    h._el.classList.add('occluded');
                } else {
                    h._el.classList.remove('occluded');
                    h._el.style.left = x + 'px';
                    h._el.style.top = y + 'px';
                    h._el.classList.toggle('tip-below', y < 132);
                }
            }
        }

        function resize() {
            if (!renderer || !stage) return;
            const w = stage.clientWidth, hh = stage.clientHeight;
            if (!w || !hh) return;
            renderer.setSize(w, hh, false);
            camera.aspect = w / hh;
            camera.updateProjectionMatrix();
            if (carReady) { applyZoomLimits(); clampDistance(); controls.update(); syncHandle(); }
        }

        function tick() {
            if (!running) { rafId = null; return; }
            controls.update();
            updateHotspots();
            syncHandle();
            renderer.render(scene, camera);
            rafId = requestAnimationFrame(tick);
        }

        // ---- API pública ----
        return {
            start: function () {
                if (failed) return;
                if (!inited) init();
                if (failed) return;
                resize();
                if (!running) { running = true; if (!rafId) rafId = requestAnimationFrame(tick); }
            },
            stop: function () {
                running = false;
                if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
            },
            isFailed: function () { return failed; },
            setWireframe: function (on) {
                wireframe = !!on;
                if (carRoot) carRoot.traverse(node => {
                    if (node.isMesh && node.material) {
                        const mats = Array.isArray(node.material) ? node.material : [node.material];
                        mats.forEach(m => { m.wireframe = wireframe; });
                    }
                });
            },
            resetCamera: function () {
                if (!carReady) return;
                switchView('exterior');
                frameObject(carRoot, EXT_DIR);
                setSpinning(!reduceMotion);
                syncHandle();
            },
            focusComponent: function (key) {
                if (!carReady) return;
                setSpinning(false);
                // aproxima a câmera de um preset por componente (reaproveita o framing)
                const presets = {
                    sensores: new THREE.Vector3(0.4, 1.4, 3.4),
                    bateria: new THREE.Vector3(2.6, 0.6, 3.0),
                    rodas: new THREE.Vector3(3.4, 0.8, 2.4),
                    chassi: new THREE.Vector3(3.2, 1.6, 3.2)
                };
                const dir = (presets[key] || EXT_DIR).clone();
                // closeup controlado: ~72% do enquadramento (respeitando o limite de zoom-in)
                dir.setLength(Math.max(controls.minDistance, frameDist * 0.72));
                camera.position.copy(controls.target).add(dir);
                controls.update(); syncHandle();
            }
        };
    }


    // ========================================================
    // 5. INSTÂNCIAS: HERO (Início) e EXPLORADOR 3D
    // ========================================================
    const carViewBox = document.getElementById('carViewBox');
    const canvas3dContainer = document.getElementById('canvas3dContainer');

    // ---- HERO ----
    let heroEngine = null;
    if (carViewBox) {
        heroEngine = createCarEngine(carViewBox, {
            label: CAR.nome,
            showHint: true, showViewTabs: true, showZoom: true, showRotBtn: true,
            onReady: function () {
                // 3D pronto: esconde imagem estática, hotspots 2D e o botão legado
                const img = document.getElementById('carImage'); if (img) img.style.display = 'none';
                carViewBox.querySelectorAll('.hotspot').forEach(h => { h.style.display = 'none'; });
                const toggle = document.getElementById('btn-toggle-3d-mode'); if (toggle) toggle.style.display = 'none';
            },
            onFallback: function () {
                // sem WebGL: revela o simulador 2D (imagem + hotspots + botão)
                const img = document.getElementById('carImage'); if (img) img.style.display = '';
                carViewBox.querySelectorAll('.hotspot').forEach(h => { h.style.display = ''; });
                const toggle = document.getElementById('btn-toggle-3d-mode'); if (toggle) toggle.style.display = '';
            }
        });
    }

    // ---- EXPLORADOR ----
    let exploradorEngine = null;
    function ensureExplorador() {
        if (exploradorEngine || !canvas3dContainer) return exploradorEngine;
        // mensagem de fallback (sem WebGL) dentro do container
        exploradorEngine = createCarEngine(canvas3dContainer, {
            label: CAR.nome,
            showHint: false, showViewTabs: true, showZoom: true, showRotBtn: true,
            onFallback: function () {
                const msg = document.createElement('div');
                msg.className = 'c3d-fallback show';
                msg.innerHTML = '<div><p><strong>Seu dispositivo não suporta WebGL.</strong></p>' +
                    '<p>O modelo 3D do veículo não pode ser exibido aqui. Consulte os termos diretamente no Dicionário.</p></div>';
                canvas3dContainer.appendChild(msg);
            }
        });
        return exploradorEngine;
    }


    // ========================================================
    // 6. UI DO EXPLORADOR (wireframe / reset / componentes)
    // ========================================================
    let isWireframeMode = false;
    const btn3dWireframe = document.getElementById('btn-3d-wireframe');
    const btn3dReset = document.getElementById('btn-3d-reset');
    const compButtons = document.querySelectorAll('.comp-3d-btn');
    const inspectedInfo = document.getElementById('inspectedInfo');

    const componentData = {
        chassi: { title: "Chassi Inteligente & Estrutura Híbrida", desc: "Monobloco de aço de ultra-alta resistência integrado com travessas deformáveis. Projetado para acoplar tanto tanques de combustível tradicionais quanto o motor elétrico auxiliar do sistema Bio-Hybrid." },
        rodas: { title: "Rodas Aerodinâmicas & e-Motors", desc: "Rodas leves de liga de 19 polegadas com calotas aerodinâmicas para diminuição do arrasto. Nos eixos, sensores de regeneração convertem frenagem em eletricidade para o bloco de baterias de 48V." },
        sensores: { title: "Módulo de Sensores ADAS (LiDAR/Radar)", desc: "Conjunto ótico inteligente no topo do para-brisa e grade. Realiza varreduras constantes da via a até 150 metros, fornecendo inputs em milissegundos para o piloto automático adaptativo." },
        bateria: { title: "Bloco de Baterias de Lítio (48V)", desc: "Conjunto compacto de baterias de íons de lítio localizado sob o piso da cabine para manter o centro de gravidade baixo. Alimenta a rede auxiliar e o e-Motor no sistema híbrido flex." }
    };

    if (btn3dWireframe) {
        btn3dWireframe.innerHTML = '<i data-lucide="box"></i> Estilo Sólido';
        if (window.lucide) lucide.createIcons();
        btn3dWireframe.addEventListener('click', () => {
            isWireframeMode = !isWireframeMode;
            if (exploradorEngine) exploradorEngine.setWireframe(isWireframeMode);
            btn3dWireframe.innerHTML = isWireframeMode ? '<i data-lucide="layout-grid"></i> Estilo Digital' : '<i data-lucide="box"></i> Estilo Sólido';
            if (window.lucide) lucide.createIcons();
        });
    }
    if (btn3dReset) {
        btn3dReset.addEventListener('click', () => { if (exploradorEngine) exploradorEngine.resetCamera(); });
    }
    compButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            compButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const componentKey = btn.getAttribute('data-comp');
            const data = componentData[componentKey];
            if (inspectedInfo && data) {
                inspectedInfo.innerHTML =
                    '<h4>' + data.title + '</h4><p>' + data.desc + '</p>' +
                    '<button class="btn-card-action" style="margin-top: 12px; width: 100%;" onclick="openIdeaModal(\'' + data.title.replace(/'/g, "\\'") + '\')">💡 Anotar Ideia sobre esta parte</button>';
            }
            if (exploradorEngine) exploradorEngine.focusComponent(componentKey);
        });
    });


    // ========================================================
    // 7. CICLO DE VIDA POR SEÇÃO ATIVA (um renderer por vez)
    // ========================================================
    const homeSection = document.getElementById('sec-home');
    const exploradorSection = document.getElementById('sec-explorador');

    function syncActiveScenes() {
        const homeActive = homeSection && homeSection.classList.contains('active');
        const expActive = exploradorSection && exploradorSection.classList.contains('active');
        if (heroEngine) { if (homeActive) heroEngine.start(); else heroEngine.stop(); }
        if (expActive) { ensureExplorador(); if (exploradorEngine) exploradorEngine.start(); }
        else if (exploradorEngine) exploradorEngine.stop();
    }

    if (window.MutationObserver) {
        const obs = new MutationObserver(syncActiveScenes);
        [homeSection, exploradorSection].forEach(sec => {
            if (sec) obs.observe(sec, { attributes: true, attributeFilter: ['class'] });
        });
    }
    document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => setTimeout(syncActiveScenes, 60)));

    setTimeout(syncActiveScenes, 250);
});
