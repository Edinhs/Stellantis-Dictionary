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
### Prompt de retomada
Quando o usuário disser **"continuar T04b"** (ou "continuar T04bo"), implementar
os itens 1–5 acima em `prototypes/main-3d-explorer.html`, testar via headless
(file:// e responsivo), commitar e reenviar a versão tudo-em-um para teste.

Observação: manter o modelo trocável (auto-escala/enquadramento já existe) e a
licença do `.glb` sob responsabilidade de quem forneceu (ver `prototypes/ASSETS.md`).
