-- Cocriação com histórico: contributions + content_revisions + audit_log.
-- SPEC 09 §4/§6.2/§6.3/§6.4 (D16 do PDR).
--
-- `target_type` é polimórfico por desenho (RN-21, SPEC 09 §8): nenhuma tabela
-- nova de histórico/moderação é criada quando um módulo novo entra em escopo.
-- Deliberadamente SEM CHECK constraint de enum aqui — validação de valores
-- válidos é responsabilidade da camada de serviço (permite adicionar
-- 'workflow'/'person'/'org_node'/'automation'/... depois, sem migração,
-- doc 25 §5). No MVP (D20) os valores em uso são apenas:
--   'term' | 'project' | 'component'
CREATE TABLE contributions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id    uuid NOT NULL REFERENCES users(id),
  target_type  text NOT NULL,
  target_id    uuid, -- nulo quando action='create'
  action       text NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  payload      jsonb NOT NULL DEFAULT '{}'::jsonb, -- estado proposto
  status       text NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  review_note  text, -- obrigatório no serviço quando status='rejected' (SPEC 09 §4)
  reviewed_by  uuid REFERENCES users(id),
  reviewed_at  timestamptz,
  metadata     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Fila de moderação (SPEC 09 §6.4).
CREATE INDEX contributions_status_target_type_idx ON contributions (status, target_type);
CREATE INDEX contributions_author_idx ON contributions (author_id, created_at DESC);

-- Rollback = nova revisão com o snapshot de uma anterior; nunca apaga
-- histórico (SPEC 09 §6.3). Só coordinator/admin.
CREATE TABLE content_revisions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type     text NOT NULL,
  target_id       uuid NOT NULL,
  revision_number int NOT NULL,
  snapshot        jsonb NOT NULL, -- estado COMPLETO da entidade após a mudança
  change_summary  text,
  edited_by       uuid NOT NULL REFERENCES users(id),
  contribution_id uuid REFERENCES contributions(id),
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (target_type, target_id, revision_number)
);

CREATE INDEX content_revisions_target_idx ON content_revisions (target_type, target_id, revision_number);

-- Trilha de auditoria transversal, append-only (RN-10). Responde "quem fez a
-- ação e quando" (login sensível, mudança de cargo, rejeição, delete), ao
-- passo que content_revisions responde "qual era o conteúdo e como volto"
-- (SPEC 09 §6.4). A aplicação NUNCA faz UPDATE/DELETE nesta tabela; reforçar
-- via permissão de banco dedicada ao usuário de aplicação fica para a fase de
-- hardening (Segurança/DevOps).
CREATE TABLE audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid REFERENCES users(id),
  action      text NOT NULL, -- 'role.assign', 'contribution.approve', 'term.delete', ...
  target_type text,
  target_id   text,
  before      jsonb,
  after       jsonb,
  ip          inet,
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_log_actor_created_idx ON audit_log (actor_id, created_at DESC);
CREATE INDEX audit_log_target_idx ON audit_log (target_type, target_id);
