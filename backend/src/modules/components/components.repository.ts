import type { Db } from "../../core/db";
import type { Component, ComponentInput } from "./components.types";

interface ComponentRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  category_id: string;
  supplier_id: string | null;
  term_slug: string | null;
  status: Component["status"];
  active: boolean;
}

function fromRow(row: ComponentRow): Component {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    categoryId: row.category_id,
    supplierId: row.supplier_id,
    termSlug: row.term_slug,
    status: row.status,
    active: row.active,
  };
}

export interface ComponentsRepository {
  list(filters: { categoryId?: string; supplierId?: string }): Promise<Component[]>;
  findBySlug(slug: string): Promise<Component | null>;
  findById(id: string): Promise<Component | null>;
  create(input: ComponentInput, createdBy: string): Promise<Component>;
  update(id: string, input: Partial<ComponentInput>): Promise<Component>;
  softDelete(id: string): Promise<Component>;
}

export function createComponentsRepository(db: Db): ComponentsRepository {
  return {
    async list(filters) {
      const clauses: string[] = ["active = true"];
      const params: unknown[] = [];
      if (filters.categoryId) {
        params.push(filters.categoryId);
        clauses.push(`category_id = $${params.length}`);
      }
      if (filters.supplierId) {
        params.push(filters.supplierId);
        clauses.push(`supplier_id = $${params.length}`);
      }
      const result = await db.query<ComponentRow>(
        `SELECT * FROM components WHERE ${clauses.join(" AND ")} ORDER BY name LIMIT 100`,
        params
      );
      return result.rows.map(fromRow);
    },
    async findBySlug(slug) {
      const result = await db.query<ComponentRow>("SELECT * FROM components WHERE slug = $1 AND active = true", [
        slug,
      ]);
      return result.rows[0] ? fromRow(result.rows[0]) : null;
    },
    async findById(id) {
      const result = await db.query<ComponentRow>("SELECT * FROM components WHERE id = $1", [id]);
      return result.rows[0] ? fromRow(result.rows[0]) : null;
    },
    async create(input, createdBy) {
      const result = await db.query<ComponentRow>(
        `INSERT INTO components (slug, name, description, image_url, category_id, supplier_id, term_slug, status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          input.slug,
          input.name,
          input.description ?? null,
          input.imageUrl ?? null,
          input.categoryId,
          input.supplierId ?? null,
          input.termSlug ?? null,
          input.status ?? "published",
          createdBy,
        ]
      );
      return fromRow(result.rows[0]);
    },
    async update(id, input) {
      const fields: string[] = [];
      const params: unknown[] = [];
      const columnByKey: Record<string, string> = {
        categoryId: "category_id",
        supplierId: "supplier_id",
        termSlug: "term_slug",
        imageUrl: "image_url",
      };
      for (const [key, value] of Object.entries(input)) {
        params.push(value);
        fields.push(`${columnByKey[key] ?? key} = $${params.length}`);
      }
      params.push(id);
      const result = await db.query<ComponentRow>(
        `UPDATE components SET ${fields.join(", ")}, updated_at = now() WHERE id = $${params.length} RETURNING *`,
        params
      );
      return fromRow(result.rows[0]);
    },
    async softDelete(id) {
      const result = await db.query<ComponentRow>(
        "UPDATE components SET active = false, updated_at = now() WHERE id = $1 RETURNING *",
        [id]
      );
      return fromRow(result.rows[0]);
    },
  };
}
