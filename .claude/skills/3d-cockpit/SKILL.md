---
name: 3d-cockpit
description: >-
  Use ao trabalhar no Explorador 3D do cockpit da página principal do
  Stellantis-Dictionary. Aplica quando envolve renderizar modelo glTF/.glb com
  three.js (ou <model-viewer>), orbit controls, posicionar hotspots ligados a
  term_slug, tooltip/painel de prévia, navegação para /dicionario/{slug} e
  fallback sem WebGL (image-map). Gatilhos: "hotspot", "modelo 3D", ".glb",
  "three.js", "câmera/orbit", "cockpit", "fallback WebGL".
---

# 3D Cockpit — Explorador 3D

Fonte da verdade: `docs/02-spec.md` (§3.5), `docs/05-cockpit-3d-reference.md`, e o
protótipo funcional `prototypes/main-3d-explorer.html` (three.js + `assets/jeep.glb`,
libs locais em `prototypes/lib/`). Reusa a mesma paleta/skill `ui-design-system`.

## Princípio central: fonte única da verdade

- Cada hotspot referencia um `term` do dicionário por **`term_slug`** e **não
  duplica texto**. Nome e prévia vêm do verbete (via API), nunca hardcoded no 3D.
- Config de hotspots (posição no modelo + `term_slug`) fica em JSON de sementes
  versionado no MVP; tabela `cockpit_hotspots` editável pelo admin em fase posterior.

## Renderização

- Formato **glTF/.glb**, servido como **asset estático** pelo frontend — nenhum
  dado confidencial embarcado no modelo, sem execução de código externo.
- MVP usa modelo **placeholder/genérico** (o `jeep.glb` do protótipo; qualquer
  `.glb` pode substituir — câmera e escala se auto-ajustam). Sem depender de asset
  oficial da Stellantis.
- Otimizar tamanho: **compressão Draco**; carregar assíncrono com indicador de
  progresso. Servir por HTTP (carregar `.glb` via `file://` é bloqueado).
- three.js (controle total sobre hotspots/câmera) é a escolha do protótipo;
  `<model-viewer>` é alternativa de MVP rápido. Manter libs **locais** (offline),
  como já está em `prototypes/lib/`.

## Interação

- Orbit controls: rotacionar com o mouse; auto-rotação quando ocioso; zoom/pan
  opcionais. Respeitar `prefers-reduced-motion` (parar auto-rotação e pulsar).
- **Hotspots** ancorados em peças do cockpit. Sementes iniciais (doc 05):
  `hud`, `cluster-digital`, `central-display`, `comandos-volante`, `audio-sistema`,
  `phone-mirroring`, `cloud`, `cockpit`.
- Hover/clique no hotspot → tooltip/painel lateral com **nome da peça** + **prévia
  curta** (primeiras linhas do verbete, buscadas via API pelo `term_slug`).
- Clique no termo dentro da prévia → navega para **`/dicionario/{slug}`** (verbete
  completo + RAG). Painel pode oferecer "Falar com o especialista" (rota do doc 08).

## Ancoragem de hotspots (three.js)

- Hotspot = posição 3D (`position_x/y/z` no espaço do modelo) projetada para 2D a
  cada frame (overlay HTML posicionado, ou sprite). Esconder hotspot ocluído
  (atrás da geometria) via raycast/teste de profundidade para não "vazar".
- Manter `term_slug` como identidade do hotspot; a posição é ajustável sem tocar
  no dado do dicionário.

## Fallback sem WebGL (obrigatório — a11y/dispositivos fracos)

- Detectar ausência de WebGL e exibir **imagem estática com áreas clicáveis**
  (image-map) apontando para os **mesmos** `term_slug` → mesmas rotas
  `/dicionario/{slug}`. Nenhuma peça deve ficar inacessível sem 3D.
- O fallback é caminho de primeira classe, não erro: teclado-navegável, com
  `alt`/labels nas áreas.

## Desempenho / segurança

- Alvo: carregamento rápido mesmo em máquina fraca (risco do PDR). Draco, modelo
  leve, `dispose()` de geometrias/texturas ao sair da tela.
- Sem código externo, sem CDN obrigatória (libs locais). Canvas redimensiona ao
  viewport; cede espaço no mobile.

## Checklist antes de entregar

- [ ] Hotspot linka por `term_slug`; texto vem da API, não hardcoded.
- [ ] Clique navega para `/dicionario/{slug}`.
- [ ] Config de hotspots em JSON de sementes (ou `cockpit_hotspots`), versionada.
- [ ] `.glb` estático, sem dado confidencial; Draco; carga assíncrona com progresso.
- [ ] Hotspot ocluído não aparece; overlay acompanha a câmera.
- [ ] Fallback sem WebGL funcional, teclado-navegável, mesmos termos.
- [ ] `prefers-reduced-motion` respeitado; libs locais (offline).
- [ ] Revisado por QA Lead (interação, fallback) e alinhado com `ui-design-system`.
