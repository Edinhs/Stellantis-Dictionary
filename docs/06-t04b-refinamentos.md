# T04b — Refinamentos pendentes (retomar daqui)

> **Status (implementado nesta sessão):** itens 1–5 concluídos em `prototypes/main-3d-explorer.html` — enquadramento responsivo (esfera envolvente), limites de zoom, barra de zoom curvada com alça, hotspots configuráveis via `window.STELLANTIS_HOTSPOTS`, e clique no carro alternando girar/parar. Testado em headless (desktop e retrato).

Estado atual: `prototypes/main-3d-explorer.html` com Jeep Grand Commander
(`assets/jeep.glb`, fornecido pelo usuário), giro 360°, hotspots com realce
vermelho no hover. Versão tudo-em-um (data-URI) foi enviada para teste.

Feedback do usuário (14/07/2026) — implementar na próxima sessão:

1. **Carro sempre visível (não pode sumir nem ser cortado).**
   - Ao dar zoom/redimensionar a janela, o carro deve continuar 100% dentro do
     palco, ocupando o espaço de forma **proporcional** (fit responsivo).
   - Reenquadrar a câmera com base no bounding box + aspect do `.stage`
     (ajustar distância/`fov` no `resize()` para o carro caber sempre).
   - Revisar o `.stage`/hero para não cortar o modelo em telas largas/estreitas
     nem em diferentes níveis de zoom do navegador.

2. **Limites de zoom (mín. e máx.).**
   - Definir `controls.minDistance` e `controls.maxDistance` coerentes com o
     tamanho do carro, de modo que nunca "entre" demais nem afaste ao ponto de
     sumir. (Hoje: min 2.2 / max 8 — revalidar após o fit responsivo.)

3. **Barra de zoom CURVADA com alça deslizante.**
   - Criar um controle visual em **arco/curva** (ex.: SVG de trilho curvo) com
     uma alça que desliza para aumentar/diminuir o zoom.
   - Sincronizar bidirecionalmente com o zoom da câmera (arrastar a alça altera
     a distância da câmera; zoom por scroll/pinch move a alça).
   - Respeitar os limites mín./máx. do item 2.

4. **Hotspots = deixar EM ABERTO/configuráveis.**
   - Marcar peças foi bom, mas o usuário ainda vai definir **onde marcar** e **o
     que é o quê** no futuro.
   - Manter a lista `HOTSPOTS` como configuração externa/fácil de editar; não
     fixar posições/labels definitivos agora. Ideal: permitir carregar as
     marcações de um JSON de sementes (`admin` edita depois — ver SPEC §3.5).

5. **Clique no veículo alterna girar/parar (toggle).**
   - Clicar 1x no carro → **para** a auto-rotação; clicar de novo → **volta a
     girar**.
   - Atenção para não conflitar com: (a) clique em hotspot (que navega ao
     dicionário — não deve alternar a rotação); (b) o arrastar para girar
     manualmente. Distinguir clique "limpo" de arrasto (ex.: só alternar se o
     ponteiro quase não se moveu entre mousedown/mouseup e o alvo não é hotspot).

---
## Rodada 2 (14/07/2026) — refinamentos concretos aplicados

Aplicados em `prototypes/main-3d-explorer.html` (validado por screenshot headless
com WebGL/swiftshader — `prototypes/screenshots/t04b-desktop.png`):

- [x] **Botão visível girar/pausar** (canto sup. direito, minimalista, casa com a
  dica). Antes o toggle só existia escondido (clique no carro). Estado unificado
  numa função `setSpinning()` — botão, clique no carro e dica ficam sincronizados.
  `aria-pressed` + label "Girando/Parado".
- [x] **`prefers-reduced-motion` respeitado no JS** (não só no CSS): inicia parado
  para quem pediu menos movimento (item do checklist do skill `3d-cockpit`).
- [x] **Tooltip do hotspot não é mais cortado no topo**: quando o hotspot está na
  faixa superior do palco (`overflow:hidden`), o rótulo abre PARA BAIXO
  (classe `.tip-below` aplicada dinamicamente). Melhora legibilidade.
- [x] **Iluminação/ambiente mais premium**: adicionada luz de contorno (rim) fria
  por trás, que separa o carro do fundo escuro; sombra de contato radial "falsa"
  sob o carro (canvas texture) reforçando o apoio no chão, dimensionada ao
  footprint do modelo.

### Novos pontos de refino para o CEO decidir (rodada 3)
- Mobile: a dica (topo-esq.) e o botão girar/pausar (topo-dir.) ficam próximos em
  telas ~390px; a dica é levemente encoberta. Avaliar encurtar a dica ou empilhar.
- Sombra de contato pouco visível sob carro claro em fundo escuro — avaliar
  intensidade ou trocar por AO baked.
- Hotspots ainda são 5 genéricos de exterior (para-brisa, grade, rodas, lanternas,
  carroceria). Doc 05 lista peças de cockpit interno (`hud`, `cluster-digital`…) —
  decidir se o MVP marca exterior (modelo atual) ou aguarda modelo com interior.
- Carregar `.glb` com Draco para reduzir os 19MB atuais (tempo de carga no mobile).
- Prévia do hotspot ainda é texto hardcoded (`def`); no sistema real virá da API
  por `term_slug` (fonte única da verdade).

---
---
## Rodada 2 de refinamento (14/07/2026) — 3D/WebGL Engineer

Três frentes priorizadas pelo CEO. Aplicadas em `prototypes/main-3d-explorer.html`
sem quebrar o que já funcionava. Verificado em Chromium headless (swiftshader) a
1440px, 768px e 390px — **0 erros de console, WebGL renderizou (sem fallback)**.

### Frente 1 — Ajustes visuais mobile
- **Sobreposição dica × botão girar/pausar resolvida** (novo `@media (max-width:480px)`
  e `@media (max-width:360px)`): a dica (topo-esq.) passa a quebrar em 2 linhas com
  `max-width: calc(100% - 132px)` e fonte 11px; o botão (topo-dir.) fica compacto
  (`max-width:118px`). Em telas < 360px o rótulo textual do botão some (fica só o
  ícone, `aria-label` preservado). Confirmado por screenshot: não se encobrem mais.
- **Sombra de contato mais visível**: `ShadowMaterial` opacity 0.34 → 0.5; disco
  radial "falso" com mais estágios e alpha maior (core 0.55 → 0.82, meio 0.45);
  footprint ampliado (x*1.85, z*1.5). Não some mais em fundo escuro.
- Responsividade conferida a 390px e 768px (carro inteiro, controles legíveis).

### Frente 2 — Compressão Draco (FEITA)
- `jeep.glb` **19.31 MB → `jeep.draco.glb` 1.73 MB (~91% menor)**. Original mantido.
- Comando usado (gltf-transform, geometria Draco + texturas WebP — o grosso dos
  19MB eram texturas, não geometria):
  ```
  npx @gltf-transform/cli optimize prototypes/assets/jeep.glb \
      prototypes/assets/jeep.draco.glb --compress draco --texture-compress webp
  ```
- Loader ajustado: `DRACOLoader` local (`lib/DRACOLoader.js` + decoder em
  `lib/draco/gltf/` — offline, sem CDN). Carrega `jeep.draco.glb` primeiro; se o
  decoder falhar, **cai automaticamente** para `jeep.glb` (não quebra).

### Frente 3 — Hotspots do interior (VEREDITO: precisa de modelo com interior)
- **`jeep.glb` é EXTERIOR-only**. Inspeção do `.glb`: 20 meshes, todas de
  carroceria/vidros/rodas (CarPaint, black, windows, Plastic). Sem geometria de
  painel, cluster, volante ou console. (Bancos aparecem vagamente pelos vidros,
  mas não há cockpit interno navegável.)
- **Não inventamos interior.** Alinhamos ao doc 05 o que faz sentido no exterior:
  o hotspot do para-brisa passou a referenciar o `term_slug` **`hud`** (doc 05:
  "Projeção de informações no para-brisa"). Os demais seguem termos de exterior
  (`grade-farois`, `rodas`, `lanternas`, `carroceria`).
- Config externalizada em semente versionada `prototypes/assets/cockpit_hotspots.json`
  (futura tabela `cockpit_hotspots`); o HTML ainda aceita `window.STELLANTIS_HOTSPOTS`.

#### DECISÃO PENDENTE PARA O CEO
Marcar peças de **cockpit INTERNO** (`cluster-digital`, `central-display`,
`comandos-volante`, `audio-sistema`, `phone-mirroring`, `cloud`) exige um modelo
com interior. Opções propostas:
1. **Obter um `.glb` de licença livre com interior** (ex.: Sketchfab CC/CC0,
   Poly Pizza) — mantém a mesma cena/câmera (auto-escala já existe). Simples, mas
   não será o Jeep exato.
2. **Cena separada de interior** (segundo `.glb` ou câmera "entra" no cockpit) com
   seu próprio conjunto de hotspots internos — mais trabalho, melhor didática.
Recomendação do 3D/WebGL Engineer: opção 1 para o MVP (placeholder de interior de
licença livre) e evoluir para a opção 2 depois.

### Verificação (screenshots atualizados)
- `prototypes/screenshots/t04b-desktop.png` (1440×900)
- `prototypes/screenshots/t04b-mobile.png` (390×844)
- `prototypes/screenshots/t04b-tablet.png` (768×1024)
- Console: **0 erros**; loader escondeu (modelo Draco renderizou); fallback WebGL
  não foi acionado.

### Entrega
Para **QA**: validar interação (hover/clique nos hotspots, toggle girar/parar,
zoom) e o fallback sem WebGL; conferir a não-sobreposição no mobile real.
Para **Segurança**: `jeep.draco.glb` é asset estático sem dado sensível; libs e
decoder Draco locais (sem CDN/código externo).

---
## Rodada 3 (14/07/2026) — Cena separada de INTERIOR (decisão do CEO: opção 2)

Decisão do CEO sobre a pendência da rodada 2: **criar uma cena separada de
interior**, mantendo o exterior atual intocado. Implementado em
`prototypes/main-3d-explorer.html` sem quebrar zoom, girar/pausar, slider ou
hotspots existentes. Verificado em Chromium headless (Playwright, ANGLE/swiftshader)
a 1440×900 e 390×844 — **0 erros de console, WebGL renderizou (sem fallback)**.

### (a) Alternador Exterior ⇄ Interior
- Segmentado de 2 botões (`#viewExterior` / `#viewInterior`) com ícones, posicionado
  **acima da barra de zoom** (não colide com a dica no topo-esq. nem o botão
  girar/pausar no topo-dir.; testado a 390px).
- A11y: `role="group"` + `aria-label`; cada botão usa `aria-pressed` (true/false) que
  alterna na troca; foco visível (`:focus-visible`). O `aria-label` do palco muda
  entre "vista externa" e "vista interna".
- Troca de vista = esconde carro+chão+sombra e mostra `interiorGroup` (e vice-versa),
  troca o conjunto de hotspots e **reenquadra** a cena ativa via `frameObject()`
  (reaproveita os limites de zoom e o slider — nada de código duplicado).
- Exterior permanece **exatamente** como estava (mesma câmera/hotspots/comportamento).

### (b) Origem do modelo de interior — PLACEHOLDER (licença livre, own-work)
- **Não foi baixado modelo externo.** Dentro do timebox e do guardrail "só licença
  livre / sem código externo", optou-se por um **placeholder procedural** construído
  em three.js (`buildInterior()`): geometria simples (painel, borda, para-brisa,
  cluster, HUD, central multimídia, console, volante+comandos, alto-falante, 2 bancos,
  retrovisor). É **own-work → licença livre por construção**, offline, leve (sem asset
  binário novo). Marcado no código como **PLACEHOLDER** com **PONTO DE TROCA FÁCIL**:
  para um `.glb` real de cockpit CC0/CC-BY, basta carregá-lo com `gltfLoader` e
  substituir `interiorGroup` por `gltf.scene` — a câmera/enquadramento se auto-ajusta.
- Regra mantida: nada de asset oficial da Stellantis; qualquer modelo real futuro deve
  ser de licença livre e registrado em `prototypes/ASSETS.md`.

### (c) Hotspots de interior criados (8, doc 05, ligados por term_slug)
`hud`, `cluster-digital`, `central-display`, `comandos-volante`, `audio-sistema`,
`phone-mirroring`, `cloud`, `cockpit`. Ancorados em coordenadas absolutas (px,py,pz)
das peças do placeholder. Externalizados em `prototypes/assets/cockpit_hotspots.json`
— arquivo reestruturado em duas seções: **`exterior`** (5, inalterados) e **`interior`**
(8). Fonte única da verdade preservada: `def` é só prévia provisória; no sistema real
vem da API pelo `term_slug`. Sobrescrevível via `window.STELLANTIS_HOTSPOTS_INTERIOR`.
Oclusão: no interior desliga-se o teste de "normal externa" (válido só p/ carro
convexo) e mantém-se só o teste de "atrás da câmera".

### (d) Screenshots (Playwright, /opt/pw-browsers)
- `prototypes/screenshots/t04c-exterior-desktop.png` (1440×900)
- `prototypes/screenshots/t04c-interior-desktop.png` (1440×900)
- `prototypes/screenshots/t04c-exterior-mobile.png` (390×844)
- `prototypes/screenshots/t04c-interior-mobile.png` (390×844)
  (os `t04b-*.png` anteriores foram mantidos.)

### (e) Verificação / console
- **0 erros de console** nas 4 combinações; `aria-pressed` alterna corretamente
  (ext↔int); `fallback` não acionado (WebGL OK); hotspots visíveis = 5 (exterior)
  e 8 (interior). Fallback sem WebGL mantido (esconde tabs/dica/botão girar).

### (f) Pendências para o CEO
1. **Trocar o placeholder por um `.glb` de cockpit de licença livre** (CC0/CC-BY)
   quando aprovado — o ponto de troca já está pronto; falta escolher/baixar o modelo
   e registrar a licença. O placeholder é intencionalmente esquemático.
2. **Fallback sem WebGL do interior**: hoje o fallback é o genérico (mensagem). Falta
   um image-map específico do cockpit (mesmos `term_slug`) — fase posterior.
3. **Posições finais dos hotspots internos** dependem do modelo real; as atuais casam
   com a geometria do placeholder.
4. Confirmar se o interior deve ter **auto-rotação** (hoje herda o estado girar/parar
   do exterior) ou câmera "de dentro" fixa olhando o painel.

---
## Rodada 4 (14/07/2026) — MODELO REAL de interior (decisão do CEO)

Decisão do CEO: substituir o **placeholder procedural** do interior por um **`.glb`
REAL de cockpit/interior de licença livre** (entendido como temporário, a trocar
depois pelo cockpit definitivo). Exterior **intocado**; câmera do interior **herda
girar/parar** (não mudou). Implementado em `prototypes/main-3d-explorer.html`.
Verificado em Chromium headless (Playwright, ANGLE/swiftshader) a 1440×900 e 390×844
— **0 erros de console**, WebGL renderizou (sem fallback), 8 hotspots de interior.

### (a) Modelo obtido — SIM, real e de licença livre verificável
- **"Car Concept"** (concept car com interior completo: dashboard, cluster, volante,
  central, pedais, bancos, portas, pilares). **Não é asset da Stellantis.**
- Autor/owner: **Eric Chadwick / © 2024 Darmstadt Graphics Group GmbH**. Derivado de
  um modelo **CC0** ("Free Concept Car 004" de "Unity Fan", Sketchfab).
- Fonte/URL: **Khronos glTF Sample Assets** —
  `https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept`.
- Licença: **CC BY 4.0** (verificável no `LICENSE.md`/`metadata.json`). Contém logos
  da Khronos (marca, "non-copyrightable logo") — nenhum logo/marca da Stellantis.
- **Atribuição registrada** em `prototypes/ASSETS.md` (string CC-BY exigida).
- Só o **asset** (.glb) foi baixado — nenhum executável/código externo. Decoder Draco
  segue **local** (`lib/draco/gltf/`).

Fontes pesquisadas antes de escolher: Khronos glTF-Sample-Assets (acessível, CC0/CC-BY),
Poly Haven (CC0, mas só props/mobília — sem cockpit), Sketchfab (rico em cockpits, mas
download exige OAuth — inviável aqui), Poly Pizza (API exige chave — 401). O CarConcept
da Khronos foi o único **realmente baixável + licença livre verificável + com interior
modelado**.

### (b) Tamanho antes/depois da compressão
- `CarConcept.glb` **11.78 MB → `cockpit-interior.draco.glb` ~1.6 MB (~86% menor)**.
- Comando: `@gltf-transform/cli optimize CarConcept.glb cockpit-interior.draco.glb
  --compress draco --texture-compress webp --join false`.
- **`--join false` é essencial**: a 1ª compressão (com `join` padrão) fundiu meshes
  por material (viraram `Interior1`, `Dashboard`…), destruindo os nomes de peça; sem
  `join` os nomes originais (`InteriorSteeringWheel0x`, `InteriorDashMid`…) sobrevivem
  e permitem ancorar os hotspots nas peças reais. Custo: ~0.3 MB a mais (1.32→1.6 MB),
  aceitável.

### (c) Hotspots — ancorados nas PEÇAS reais do modelo
- Os 8 hotspots do interior (`hud`, `cluster-digital`, `central-display`,
  `comandos-volante`, `audio-sistema`, `phone-mirroring`, `cloud`, `cockpit`) agora
  **ancoram por nome de mesh** do `.glb` (campo `mesh` em `cockpit_hotspots.json`):
  o runtime calcula o centro da(s) peça(s) e aplica ajuste fino `ox/oy/oz`. Mapeamento:
  hud→`InteriorSteeringDashColumn` (elevado p/ para-brisa), cluster→`InteriorSteeringDash`,
  central→`InteriorDashMid`, comandos→`InteriorSteeringWheel/Handle`, áudio→`InteriorDoorL`,
  phone-mirroring→`InteriorDashMid` (abaixo), cloud→`BodyRoofPanel`, cockpit→`InteriorFloor`.
- `px/py/pz` viram **fallback/documentação** (valores já calculados do modelo real),
  usados só se a peça não existir (ex.: placeholder). Fonte única da verdade preservada:
  `def` é só prévia; no sistema real vem da API pelo `term_slug`.
- Enquadramento do interior: com o teto (`Roof`) escondido, câmera numa vista 3/4
  frontal-elevada olhando **para dentro** do cockpit (foco calculado do modelo:
  dashboard↔bancos). Zoom/slider e girar/parar reaproveitados (sem código duplicado).

### (d) Screenshots (Playwright, /opt/pw-browsers)
- `prototypes/screenshots/t04d-exterior-desktop.png` (1440×900) — Jeep intacto
- `prototypes/screenshots/t04d-interior-desktop.png` (1440×900) — cockpit real
- `prototypes/screenshots/t04d-interior-mobile.png` (390×844)
- `prototypes/screenshots/t04d-exterior-mobile.png` (390×844)

### (e) Verificação / console
- **0 erros** de console (desktop e mobile); WebGL OK (fallback não acionado); 8
  hotspots de interior visíveis; exterior inalterado. Único aviso é a depreciação de
  swiftshader do próprio headless (ambiente, não do código). O `.glb` usa extensões
  KHR que o three r128 não conhece (variants/iridescence/emissive_strength) — geram no
  máximo *warnings* silenciosos, sem erro nem quebra.
- **Fallback resiliente**: se `cockpit-interior.draco.glb` falhar, cai no placeholder
  procedural own-work (`buildInteriorPlaceholder()`), sem quebrar a vista de interior.

### (f) Pendências para o CEO
1. **Modelo é temporário/genérico** (concept car CC-BY, não o cockpit oficial da
   Stellantis). Trocar pelo cockpit definitivo quando houver asset próprio/licenciado —
   o ponto de troca (`loadInterior`/`MODEL_INTERIOR`) e a ancoragem por mesh já estão
   prontos. Manter a atribuição CC-BY enquanto este modelo for usado.
2. **Exterior (Jeep) x interior (Car Concept) são carros diferentes** — inconsistência
   assumida no placeholder. Ideal futuro: um único veículo com exterior+interior.
3. **Oclusão dos hotspots do interior** ainda é aproximada (só teste "atrás da câmera");
   ao girar para trás, hotspots do painel podem "vazar" pela carroceria. Melhorar com
   raycast/teste de profundidade numa fase posterior.
4. **Fallback sem WebGL do interior** segue genérico (mensagem); falta o image-map
   específico do cockpit (mesmos `term_slug`) — fase posterior.
5. Confirmar se o interior deve manter o teto escondido (revelação 3/4) ou virar uma
   vista "de dentro" (POV do motorista).

---
### Prompt de retomada
Quando o usuário disser **"continuar T04b"** (ou "continuar T04bo"), implementar
os itens 1–5 acima em `prototypes/main-3d-explorer.html`, testar via headless
(file:// e responsivo), commitar e reenviar a versão tudo-em-um para teste.

Observação: manter o modelo trocável (auto-escala/enquadramento já existe) e a
licença do `.glb` sob responsabilidade de quem forneceu (ver `prototypes/ASSETS.md`).
