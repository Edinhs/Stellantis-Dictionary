-- Projetos veiculares (RF-043; escopo MVP D20). doc 25 §3.1: "projects
-- (slug, code, status, versions jsonb)".
--
-- Decisão de modelagem — Plataforma/Motorização: o CEO pediu para OCULTAR
-- essas colunas na UI do protótipo "por enquanto", preservando os dados
-- (doc 29 §"Outros módulos"). Mantemos as colunas no schema, NULÁVEIS e sem
-- exposição garantida pela API (isso é decisão de contrato/serviço, não de
-- schema): assim, se o CEO decidir reexibir, não há nova migração; se nunca
-- forem usadas, custam apenas duas colunas nulas — não há over-engineering
-- em manter um campo já validado como necessário por uma decisão de produto
-- reversível. Nenhum dado real de plataforma/motorização é semeado (S9).
CREATE TABLE projects (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text NOT NULL UNIQUE,
  -- Código interno do projeto. ATENÇÃO SEGURANÇA (S9, doc 24/25 §8): códigos
  -- reais de projeto (ex.: os citados no doc 26 R10) NÃO entram em seeds
  -- versionados — usar códigos fictícios/genéricos (seeds/projects.json).
  code         text NOT NULL UNIQUE,
  name         text NOT NULL,
  description  text,
  status       text NOT NULL DEFAULT 'conceito'
                 CHECK (status IN ('conceito', 'homologacao', 'producao')),
  platform     text, -- ver nota de modelagem acima; oculto na UI atual por decisão do CEO
  motorization text, -- idem
  tech_sheet   jsonb NOT NULL DEFAULT '{}'::jsonb, -- ficha técnica (RF-043)
  versions     jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{version, release_date, highlights, ...}] (RF-043)
  created_by   uuid REFERENCES users(id),
  active       boolean NOT NULL DEFAULT true, -- soft delete (RN-09)
  metadata     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX projects_status_idx ON projects (status) WHERE active;
