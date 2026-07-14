# core — Infraestrutura transversal

Fundação usada por todos os módulos de feature. **Não** contém regra de negócio
de produto. Ver `docs/13-arquitetura-modular.md` §4.1 e §7.

Subpastas:
- `config/` — leitura tipada de variáveis de ambiente (Twelve-Factor III). Nenhum
  segredo hardcoded; tudo vem do ambiente / `.env`.
- `db/` — pool do Postgres e helper de transação. É a única camada que abre
  conexão; repositórios de módulos a consomem.
- `logging/` — logger estruturado (JSON, um evento por linha) com `request_id`
  de correlação. Nunca loga segredos/senhas/tokens.
- `audit/` — gravação de `audit_log` (append-only): quem fez o quê, quando.
- `errors/` — classes de erro e handler central de erros HTTP.
- `http/` — tipos de rota e envelope padrão de resposta/erro.
- `authz/` — resolvedor central `can(user, permission)` (SPEC `09` §2.1). Toda
  autorização passa por aqui; nunca `if role == 'admin'`.

Fronteiras: `core` **não importa** nada de `modules/`. Não conhece features.
