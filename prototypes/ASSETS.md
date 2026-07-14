# Créditos e licenças dos assets (protótipo)

Estes arquivos são de terceiros, usados apenas no protótipo (`main-3d-explorer.html`).

## Modelo 3D — `assets/jeep.glb`
- Veículo: **Jeep Grand Commander** (marca pertencente à Stellantis).
- Origem: **fornecido pelo usuário** (upload).
- Licença: **de responsabilidade de quem forneceu o modelo.** Deve ser
  confirmada antes de qualquer uso em produção ou distribuição.
- Troca: qualquer `.glb` pode substituí-lo; a escala e o enquadramento da câmera
  se ajustam automaticamente no código.

## Modelo 3D — interior/cockpit — `assets/cockpit-interior.draco.glb`  (Rodada 4)
- Modelo: **"Car Concept"** — concept car com interior completo (dashboard, cluster,
  volante, central, pedais, bancos, portas). Usado como **placeholder temporário**
  do interior no MVP (decisão do CEO: modelo real de licença livre, a ser trocado
  depois pelo cockpit definitivo). **Não é asset oficial da Stellantis.**
- Autor / owner: **Eric Chadwick** — © 2024 **Darmstadt Graphics Group GmbH**.
- Derivado de: modelo **CC0 / domínio público** "Free Concept Car 004" de **"Unity Fan"**
  (Sketchfab), depois otimizado/convertido para glTF pela Khronos.
- Fonte / URL: **Khronos glTF Sample Assets** —
  https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept
  (GLB original: `.../Models/CarConcept/glTF-Binary/CarConcept.glb`).
- Licença: **CC BY 4.0** (https://creativecommons.org/licenses/by/4.0/) — verificável
  no `LICENSE.md`/`metadata.json` do modelo. Contém logos da Khronos (marca/trademark,
  "non-copyrightable logo"). **Não** há marca/logo da Stellantis.
- **Atribuição exigida (CC-BY, exibir onde os créditos do modelo aparecerem):**
  > "Car Concept" by Eric Chadwick / © Darmstadt Graphics Group GmbH, licensed under
  > CC BY 4.0, via Khronos glTF Sample Assets (derived from a CC0 model by "Unity Fan").
- Otimização: `CarConcept.glb` **11.78 MB → `cockpit-interior.draco.glb` ~1.6 MB (~86%)**
  via `@gltf-transform/cli optimize ... --compress draco --texture-compress webp
  --join false` (o `--join false` PRESERVA os nomes de mesh usados para ancorar os
  hotspots nas peças reais). Decoder Draco local em `lib/draco/gltf/` (offline).
- Integração: carregado em `loadInterior()` de `main-3d-explorer.html` no lugar do
  antigo `interiorGroup` procedural (auto-escala/centralização/apoio no chão; teto
  escondido para revelar o cockpit). Câmera do interior **herda girar/parar** do
  exterior (inalterado). Os 8 hotspots ancoram por **nome de mesh** (ver
  `assets/cockpit_hotspots.json`, seção `interior`).

## Cena de interior — PLACEHOLDER procedural (agora é FALLBACK)
- Origem: **own-work** — geometria simples gerada em three.js na função
  `buildInteriorPlaceholder()` de `main-3d-explorer.html` (sem arquivo binário externo).
- Licença: **livre por construção** (código próprio, MIT como o restante do protótipo).
- Uso atual: **fallback** — só é usado se `cockpit-interior.draco.glb` falhar ao carregar.

## Biblioteca 3D — `lib/three.min.js`, `OrbitControls.js`, `GLTFLoader.js`, `RoomEnvironment.js`
- Origem: **three.js** r128 — https://threejs.org
- Licença: **MIT**

> Observação: nada aqui é redistribuído para fora do repositório; são dependências
> locais para o protótipo funcionar offline.
