// rag.repository — camada REPOSITÓRIO. Nesta rodada (stub), busca textual
// simples sobre `terms` publicados/ativos (RN-23: "só conteúdo curado entra
// no índice do RAG"). A busca vetorial real sobre `document_chunks`
// (pgvector) é o next-step documentado em rag/README.md.

import type { Db } from "../../core/db";

export interface TermSnippet {
  slug: string;
  title: string;
  text: string;
}

export interface RagRepository {
  findRelevantTerms(query: string, limit?: number): Promise<TermSnippet[]>;
  createConversation(userId: string, title: string | null): Promise<{ id: string }>;
  appendMessage(input: {
    conversationId: string;
    role: "user" | "assistant" | "system";
    content: string;
    sourcesUsed: unknown[];
  }): Promise<void>;
}

export function createRagRepository(db: Db): RagRepository {
  return {
    async findRelevantTerms(query, limit = 3) {
      const result = await db.query<{ slug: string; term: string; definition: string }>(
        `SELECT slug, term, definition FROM terms
         WHERE active = true AND status = 'published'
           AND (term ILIKE $1 OR definition ILIKE $1)
         ORDER BY term
         LIMIT $2`,
        [`%${query}%`, limit]
      );
      return result.rows.map((r) => ({ slug: r.slug, title: r.term, text: r.definition }));
    },
    async createConversation(userId, title) {
      const result = await db.query<{ id: string }>(
        "INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING id",
        [userId, title]
      );
      return { id: result.rows[0].id };
    },
    async appendMessage(input) {
      await db.query(
        `INSERT INTO messages (conversation_id, role, content, sources_used)
         VALUES ($1, $2, $3, $4)`,
        [input.conversationId, input.role, input.content, JSON.stringify(input.sourcesUsed)]
      );
    },
  };
}
