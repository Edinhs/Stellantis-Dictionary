-- RAG: histórico de conversa + índice vetorial (pgvector). SPEC 02 §3.3/§3.4.
--
-- Ingestão de documentos (fase 2, SPEC 02 §3.3) NÃO entra nesta migração: o
-- MVP (D20) faz RAG "sobre termos cadastrados manualmente" (PDR 03 Fase 1).
-- Por isso `document_chunks` usa uma origem polimórfica (`source_type`/
-- `source_id`) em vez de depender de uma tabela `documents` populada agora —
-- quando a ingestão de documentos entrar em escopo, `source_type='document'`
-- é adicionado sem migração de schema (mesmo padrão polimórfico de
-- `contributions`/`content_revisions`, SPEC 09 §8, RN-21/RN-23).
CREATE TABLE conversations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id),
  title       text,
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX conversations_user_idx ON conversations (user_id, created_at DESC);

CREATE TABLE messages (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role           text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content        text NOT NULL,
  -- Citação de fontes da resposta (RN-22): [{type:'term', slug, title}, ...].
  -- Guardrail anti-alucinação: sem contexto suficiente, a resposta declara
  -- que não sabe em vez de inventar (sources_used fica vazio nesse caso).
  sources_used   jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata       jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX messages_conversation_idx ON messages (conversation_id, created_at);

-- Dimensão do vetor: 1536 é um placeholder (compatível com embeddings
-- OpenAI text-embedding-3-small). O provedor de LLM/embeddings (D5, PDR 03)
-- segue em aberto atrás do port `LlmProvider` (SPEC 02 §2); se o provedor
-- definitivo usar outra dimensão, uma migração nova ajusta a coluna
-- (`ALTER TABLE document_chunks ALTER COLUMN embedding TYPE vector(N)`) e
-- reprocessa os embeddings — trade-off aceito do pgvector (dimensão fixa por
-- coluna), documentado aqui para não surpreender quem trocar de adapter.
CREATE TABLE document_chunks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- MVP: só 'term' (RN-23 — "só conteúdo curado entra no índice do RAG";
  -- termos publicados e ativos). 'document'/'workflow'/'qa_answer' entram
  -- como novos valores quando esses módulos saírem de fora do MVP (D20).
  source_type text NOT NULL CHECK (source_type IN ('term')),
  source_id   uuid NOT NULL, -- terms.id — sem FK direta: origem polimórfica (mesmo padrão de contributions.target_id)
  source_slug text,          -- redundância de leitura (term_slug) para evitar join no caminho quente do chat
  content     text NOT NULL,
  embedding   vector(1536),
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX document_chunks_source_idx ON document_chunks (source_type, source_id);
-- HNSW: melhor recall/latência de busca por similaridade que ivfflat para o
-- volume esperado de um MVP (pgvector >= 0.5). Reindexar/ajustar parâmetros
-- (`m`, `ef_construction`) quando o volume de chunks crescer muito.
CREATE INDEX document_chunks_embedding_idx ON document_chunks
  USING hnsw (embedding vector_cosine_ops);
