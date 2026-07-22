-- users + role_permissions — SPEC 02 §3.1/§4, SPEC 09 §2/§6.1.
--
-- Cargos: abordagem A da SPEC 09 §6.1 (enum simples em `users.role` +
-- `role_permissions` como dado semente). A abordagem B (tabelas `roles` +
-- `user_roles` N:N) fica deliberadamente FORA desta migração — só entra se
-- surgirem cargos dinâmicos (SPEC 09 §6.1, "não fazer agora").
--
-- Autorização: SEMPRE via `can(user, permission)` resolvendo
-- role -> role_permissions -> permission (SPEC 09 §2.1). Nunca `if role == `.

CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  email         text NOT NULL,
  password_hash text NOT NULL, -- hash argon2/bcrypt; nunca texto puro (SPEC 02 §3.1)
  role          text NOT NULL DEFAULT 'user'
                  CHECK (role IN ('user', 'coordinator', 'admin')),
  -- Desativação de conta (não é soft-delete de conteúdo): usuário desativado
  -- não autentica mais, mas o registro permanece para preservar a integridade
  -- referencial de autoria (terms.created_by, contributions.author_id, etc.)
  -- e o histórico de auditoria.
  active        boolean NOT NULL DEFAULT true,
  metadata      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- E-mail corporativo é o identificador de login; unicidade case-insensitive.
CREATE UNIQUE INDEX users_email_key ON users (lower(email));

COMMENT ON COLUMN users.role IS
  'Default ''user'' no cadastro (RN-01). Só coordinator/admin atribuem cargo a '
  'outros (RN-04); ninguém altera o próprio cargo; coordinator não promove a '
  'admin. Toda mudança de cargo é registrada em audit_log (SPEC 09 §3).';

-- Matriz de permissões por cargo (dado semente, editável sem migração —
-- ver seeds/role_permissions.json). Nomenclatura de permissão: `<area>.<acao>`
-- (doc 25 §5), ex.: 'dictionary.approve', 'project.create', 'role.assign'.
CREATE TABLE role_permissions (
  role        text NOT NULL CHECK (role IN ('user', 'coordinator', 'admin')),
  permission  text NOT NULL,
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (role, permission)
);
