# cockpit-3d — Backend do Explorador 3D

Config/seed de hotspots (`cockpit_hotspots`) ligando pontos do modelo a `term_slug`. O asset `.glb` é servido pelo frontend (módulo `threed`); aqui só o dado dos hotspots. Ref.: SPEC `02` §3.5.

**Camadas** (ver `docs/13-arquitetura-modular.md` §3.1). Só `index.ts` é
importável por outros módulos (contrato público); `routes`/`service`/`repository`
são internos.

- `cockpit3d.routes.ts` — camada ROTA: HTTP, validação de entrada, chama o serviço.
- `cockpit3d.service.ts` — camada SERVIÇO: regra de negócio; chama `can()` e o repo.
- `cockpit3d.repository.ts` — camada REPOSITÓRIO: acesso a dados (SQL); sem HTTP.
- `index.ts` — registra rotas e exporta o serviço público do módulo.

Esta fase entrega apenas o esqueleto: os arquivos são placeholders, sem lógica
de produção.
