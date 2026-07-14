# users — Usuários, cargos e permissões

Perfil, cargos `user`/`coordinator`/`admin` (`users.role`, default `user`), `role_permissions` e regras de atribuição de cargo (anti-escalonamento: coordenador não cria `admin`; ninguém muda o próprio cargo). Provê os dados que `core/authz.can()` resolve. Ref.: SPEC `09` §2/§3/§6.1.

**Camadas** (ver `docs/13-arquitetura-modular.md` §3.1). Só `index.ts` é
importável por outros módulos (contrato público); `routes`/`service`/`repository`
são internos.

- `users.routes.ts` — camada ROTA: HTTP, validação de entrada, chama o serviço.
- `users.service.ts` — camada SERVIÇO: regra de negócio; chama `can()` e o repo.
- `users.repository.ts` — camada REPOSITÓRIO: acesso a dados (SQL); sem HTTP.
- `index.ts` — registra rotas e exporta o serviço público do módulo.

Esta fase entrega apenas o esqueleto: os arquivos são placeholders, sem lógica
de produção.
