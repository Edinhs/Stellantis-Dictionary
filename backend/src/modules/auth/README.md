# auth — Autenticação

Cadastro, login, JWT (access + refresh), hash de senha (argon2), refresh em cookie `httpOnly`/`secure`/`sameSite=strict`. Ref.: SPEC `02` §3.1. Dono da entidade `users` no que toca a credenciais.

**Camadas** (ver `docs/13-arquitetura-modular.md` §3.1). Só `index.ts` é
importável por outros módulos (contrato público); `routes`/`service`/`repository`
são internos.

- `auth.routes.ts` — camada ROTA: HTTP, validação de entrada, chama o serviço.
- `auth.service.ts` — camada SERVIÇO: regra de negócio; chama `can()` e o repo.
- `auth.repository.ts` — camada REPOSITÓRIO: acesso a dados (SQL); sem HTTP.
- `index.ts` — registra rotas e exporta o serviço público do módulo.

Esta fase entrega apenas o esqueleto: os arquivos são placeholders, sem lógica
de produção.
