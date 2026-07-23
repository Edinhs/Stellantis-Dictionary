import type { Db } from "../../core/db";
import type { Term, TermCategory, TermInput } from "./dictionary.types";

interface TermRow {
  id: string;
  slug: string;
  term: string;
  definition: string;
  category: TermCategory | null;
  synonyms: string[];
  status: Term["status"];
  active: boolean;
  created_by: string | null;
}

function fromRow(row: TermRow): Term {
  return {
    id: row.id,
    slug: row.slug,
    term: row.term,
    definition: row.definition,
    category: row.category,
    synonyms: row.synonyms,
    status: row.status,
    active: row.active,
    createdBy: row.created_by,
  };
}

export interface DictionaryRepository {
  list(filters: { category?: TermCategory; search?: string }): Promise<Term[]>;
  findBySlug(slug: string): Promise<Term | null>;
  findById(id: string): Promise<Term | null>;
  create(input: TermInput, createdBy: string): Promise<Term>;
  update(id: string, input: Partial<TermInput>): Promise<Term>;
  softDelete(id: string): Promise<Term>;
}

export function createDictionaryRepository(db: Db): DictionaryRepository {
  return {
    async list(filters) {
      const clauses: string[] = ["active = true"];
      const params: unknown[] = [];
      if (filters.category) {
        params.push(filters.category);
        clauses.push(`category = $${params.length}`);
      }
      if (filters.search) {
        params.push(`%${filters.search}%`);
        clauses.push(`(term ILIKE $${params.length} OR definition ILIKE $${params.length})`);
      }
      const result = await db.query<TermRow>(
        `SELECT * FROM terms WHERE ${clauses.join(" AND ")} ORDER BY term LIMIT 100`,
        params
      );
      return result.rows.map(fromRow);
    },
    async findBySlug(slug) {
      const result = await db.query<TermRow>("SELECT * FROM terms WHERE slug = $1 AND active = true", [slug]);
      return result.rows[0] ? fromRow(result.rows[0]) : null;
    },
    async findById(id) {
      const result = await db.query<TermRow>("SELECT * FROM terms WHERE id = $1", [id]);
      return result.rows[0] ? fromRow(result.rows[0]) : null;
    },
    async create(input, createdBy) {
      const result = await db.query<TermRow>(
        `INSERT INTO terms (slug, term, definition, category, synonyms, status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          input.slug,
          input.term,
          input.definition,
          input.category ?? null,
          input.synonyms ?? [],
          input.status ?? "published",
          createdBy,
        ]
      );
      return fromRow(result.rows[0]);
    },
    async update(id, input) {
      const fields: string[] = [];
      const params: unknown[] = [];
      for (const [key, value] of Object.entries(input)) {
        params.push(value);
        fields.push(`${key} = $${params.length}`);
      }
      params.push(id);
      const result = await db.query<TermRow>(
        `UPDATE terms SET ${fields.join(", ")}, updated_at = now() WHERE id = $${params.length} RETURNING *`,
        params
      );
      return fromRow(result.rows[0]);
    },
    async softDelete(id) {
      const result = await db.query<TermRow>(
        "UPDATE terms SET active = false, updated_at = now() WHERE id = $1 RETURNING *",
        [id]
      );
      return fromRow(result.rows[0]);
    },
  };
}
