-- Componentes de Infotainment (RF-042; escopo MVP D20). doc 25 §3.1/§3.2:
-- "components é o elo tríplice" — verbete (dictionary, por term_slug),
-- categoria e fornecedor Tier-1. NÃO modela responsável/especialista (pessoa)
-- aqui: organograma/especialistas ficam fora do MVP (D20) e são dado pessoal
-- (S6/LGPD, doc 24/25 §8) — quando entrarem em escopo, a ligação é por
-- `component_specialists` em `directory` (doc 13 §2), sem alterar esta tabela.
--
-- Categoria e fornecedor viram tabelas de lookup (não CHECK fixo, ao
-- contrário de terms.category): o protótipo já suporta "+ Categoria"/
-- "+ Fornecedor" dinâmicos (doc 29), e cocriação de novo fornecedor/categoria
-- não deve exigir migração.
CREATE TABLE component_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  name        text NOT NULL,
  active      boolean NOT NULL DEFAULT true,
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Fornecedores (Tier-1/Tier-2/OEM). Suporta o submenu "Fornecedores" já
-- desenhado no protótipo (doc 29: grid com imagem + modal História/Parceria),
-- reaproveitado 1:1 pelo filtro cruzado de Componentes (RF-042).
--
-- ATENÇÃO SEGURANÇA (S9, doc 24/25 §8): nomes de fornecedores reais citados no
-- protótipo/RF-042 (ex.: Aptiv, Bosch, Harman, Marelli) NÃO entram nos SEEDS
-- deste repositório — usar nomes fictícios/genéricos (ver seeds/suppliers.json).
-- Dados reais de fornecedores, se necessário, entram por carga operacional
-- fora do controle de versão, nunca como seed versionado/publicável.
CREATE TABLE suppliers (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text NOT NULL UNIQUE,
  name         text NOT NULL,
  tier         text NOT NULL DEFAULT 'tier1' CHECK (tier IN ('tier1', 'tier2', 'oem')),
  description  text,
  history      text,      -- texto do modal "História" (doc 29)
  partnership  text,      -- texto do modal "Parceria" (doc 29)
  image_url    text,
  website      text,
  active       boolean NOT NULL DEFAULT true,
  metadata     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE components (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text NOT NULL UNIQUE,
  name         text NOT NULL,
  description  text,
  image_url    text, -- RF-042: "CRUD completo (com URL da imagem)"
  category_id  uuid NOT NULL REFERENCES component_categories(id),
  supplier_id  uuid REFERENCES suppliers(id),
  -- Elo com o dicionário por slug (fonte única da verdade, doc 25 §3.2);
  -- nulo permitido — nem todo componente tem verbete próprio ainda.
  term_slug    text REFERENCES terms(slug),
  status       text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_by   uuid REFERENCES users(id),
  active       boolean NOT NULL DEFAULT true, -- soft delete (RN-09)
  metadata     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Filtro cruzado múltiplo por categoria e fornecedor (RF-042).
CREATE INDEX components_category_idx ON components (category_id) WHERE active;
CREATE INDEX components_supplier_idx ON components (supplier_id) WHERE active;
CREATE INDEX components_term_slug_idx ON components (term_slug);
CREATE INDEX component_categories_active_idx ON component_categories (slug) WHERE active;
CREATE INDEX suppliers_tier_idx ON suppliers (tier) WHERE active;
