# Créditos e licenças dos assets (protótipo)

Estes arquivos são de terceiros, usados apenas no protótipo (`main-3d-explorer.html`).

## Modelo 3D — `assets/jeep.glb`
- Veículo: **Jeep Grand Commander** (marca pertencente à Stellantis).
- Origem: **fornecido pelo usuário** (upload).
- Licença: **de responsabilidade de quem forneceu o modelo.** Deve ser
  confirmada antes de qualquer uso em produção ou distribuição.
- Troca: qualquer `.glb` pode substituí-lo; a escala e o enquadramento da câmera
  se ajustam automaticamente no código.

## Cena de interior (cockpit) — PLACEHOLDER procedural
- Origem: **own-work** — geometria simples gerada em three.js na função
  `buildInterior()` de `main-3d-explorer.html` (sem arquivo binário externo).
- Licença: **livre por construção** (código próprio, MIT como o restante do protótipo).
- Substituível por um `.glb` real de cockpit **de licença livre** (CC0/CC-BY); há um
  ponto de troca fácil no código. Nada oficial da Stellantis. Ver `docs/06`.

## Biblioteca 3D — `lib/three.min.js`, `OrbitControls.js`, `GLTFLoader.js`, `RoomEnvironment.js`
- Origem: **three.js** r128 — https://threejs.org
- Licença: **MIT**

> Observação: nada aqui é redistribuído para fora do repositório; são dependências
> locais para o protótipo funcionar offline.
