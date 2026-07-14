# T04b — Refinamentos pendentes (retomar daqui)

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

Observação: manter o modelo trocável (auto-escala/enquadramento já existe) e a
licença do `.glb` sob responsabilidade de quem forneceu (ver `prototypes/ASSETS.md`).
