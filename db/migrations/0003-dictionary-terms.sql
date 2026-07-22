-- terms — dicionário de siglas/termos (núcleo do produto). SPEC 02 §3.2/§4.
--
-- `category` fixa a taxonomia canônica decidida pelo CEO em 2026-07-19
-- ("o protótipo manda"): {motorizacao, tecnologia, componentes, plataformas}
-- (doc 21 RF-002/RF-006; doc 26 R10). CHECK em vez de tabela de lookup porque
-- é um conjunto pequeno e estável por decisão formal, não editável por
-- cocriação — se isso mudar, é uma migração nova (mesma disciplina de
-- "mudança = nova migração", db/README.md).
CREATE TABLE terms (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text NOT NULL UNIQUE, -- elo estável (RAG, hotspots 3D, links) — SPEC 02 §4
  term         text NOT NULL,
  definition   text NOT NULL,
  category     text NOT NULL
                 CHECK (category IN ('motorizacao', 'tecnologia', 'componentes', 'plataformas')),
  synonyms     text[] NOT NULL DEFAULT '{}',
  source_type  text NOT NULL DEFAULT 'manual' CHECK (source_type IN ('manual', 'document')),
  source_ref   text, -- referência ao documento de origem quando source_type='document' (fase 2 de ingestão)
  status       text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  -- Soft delete (RN-09): exclusão de coordinator é soft (active=false); hard
  -- delete só admin (SPEC 09 §6.5), resolvido na camada de serviço via
  -- permissões distintas (dictionary.delete vs dictionary.delete.hard).
  active       boolean NOT NULL DEFAULT true,
  created_by   uuid REFERENCES users(id),
  metadata     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX terms_category_idx ON terms (category) WHERE active;
CREATE INDEX terms_synonyms_gin_idx ON terms USING gin (synonyms);
-- Busca textual fallback (SPEC 02 §3.2: "quando o chat não é necessário").
CREATE INDEX terms_term_trgm_idx ON terms USING gin (term gin_trgm_ops);
CREATE INDEX terms_definition_trgm_idx ON terms USING gin (definition gin_trgm_ops);

-- cockpit_hotspots — Explorador 3D (SPEC 02 §3.5). O .glb é asset estático do
-- frontend; aqui só a configuração de pontos clicáveis, ligados ao dicionário
-- por term_slug (fonte única da verdade — nunca duplica texto do verbete).
CREATE TABLE cockpit_hotspots (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id    text NOT NULL DEFAULT 'default', -- identifica o asset .glb (multi-modelo é extensão futura)
  label       text NOT NULL,
  term_slug   text NOT NULL REFERENCES terms(slug),
  position_x  double precision NOT NULL,
  position_y  double precision NOT NULL,
  position_z  double precision NOT NULL,
  active      boolean NOT NULL DEFAULT true,
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX cockpit_hotspots_term_slug_idx ON cockpit_hotspots (term_slug);
CREATE INDEX cockpit_hotspots_model_id_idx ON cockpit_hotspots (model_id) WHERE active;
