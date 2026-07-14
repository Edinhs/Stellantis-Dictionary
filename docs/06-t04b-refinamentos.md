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
### Prompt de retomada
Quando o usuário disser **"continuar T04b"** (ou "continuar T04bo"), implementar
os itens 1–5 acima em `prototypes/main-3d-explorer.html`, testar via headless
(file:// e responsivo), commitar e reenviar a versão tudo-em-um para teste.

Observação: manter o modelo trocável (auto-escala/enquadramento já existe) e a
licença do `.glb` sob responsabilidade de quem forneceu (ver `prototypes/ASSETS.md`).
