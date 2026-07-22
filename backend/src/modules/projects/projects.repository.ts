import type { Db } from "../../core/db";
import type { Project, ProjectInput, ProjectStatus } from "./projects.types";

interface ProjectRow {
  id: string;
  slug: string;
  code: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  tech_sheet: Record<string, unknown>;
  versions: unknown[];
  active: boolean;
}

function fromRow(row: ProjectRow): Project {
  return {
    id: row.id,
    slug: row.slug,
    code: row.code,
    name: row.name,
    description: row.description,
    status: row.status,
    techSheet: row.tech_sheet,
    versions: row.versions,
    active: row.active,
  };
}

export interface ProjectsRepository {
  list(filters: { status?: ProjectStatus }): Promise<Project[]>;
  findBySlug(slug: string): Promise<Project | null>;
  findById(id: string): Promise<Project | null>;
  create(input: ProjectInput, createdBy: string): Promise<Project>;
  update(id: string, input: Partial<ProjectInput>): Promise<Project>;
  softDelete(id: string): Promise<Project>;
}

export function createProjectsRepository(db: Db): ProjectsRepository {
  return {
    async list(filters) {
      const clauses: string[] = ["active = true"];
      const params: unknown[] = [];
      if (filters.status) {
        params.push(filters.status);
        clauses.push(`status = $${params.length}`);
      }
      const result = await db.query<ProjectRow>(
        `SELECT * FROM projects WHERE ${clauses.join(" AND ")} ORDER BY name LIMIT 100`,
        params
      );
      return result.rows.map(fromRow);
    },
    async findBySlug(slug) {
      const result = await db.query<ProjectRow>("SELECT * FROM projects WHERE slug = $1 AND active = true", [slug]);
      return result.rows[0] ? fromRow(result.rows[0]) : null;
    },
    async findById(id) {
      const result = await db.query<ProjectRow>("SELECT * FROM projects WHERE id = $1", [id]);
      return result.rows[0] ? fromRow(result.rows[0]) : null;
    },
    async create(input, createdBy) {
      const result = await db.query<ProjectRow>(
        `INSERT INTO projects (slug, code, name, description, status, tech_sheet, versions, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          input.slug,
          input.code,
          input.name,
          input.description ?? null,
          input.status ?? "conceito",
          JSON.stringify(input.techSheet ?? {}),
          JSON.stringify(input.versions ?? []),
          createdBy,
        ]
      );
      return fromRow(result.rows[0]);
    },
    async update(id, input) {
      const fields: string[] = [];
      const params: unknown[] = [];
      const columnByKey: Record<string, string> = { techSheet: "tech_sheet" };
      for (const [key, value] of Object.entries(input)) {
        params.push(key === "techSheet" || key === "versions" ? JSON.stringify(value) : value);
        fields.push(`${columnByKey[key] ?? key} = $${params.length}`);
      }
      params.push(id);
      const result = await db.query<ProjectRow>(
        `UPDATE projects SET ${fields.join(", ")}, updated_at = now() WHERE id = $${params.length} RETURNING *`,
        params
      );
      return fromRow(result.rows[0]);
    },
    async softDelete(id) {
      const result = await db.query<ProjectRow>(
        "UPDATE projects SET active = false, updated_at = now() WHERE id = $1 RETURNING *",
        [id]
      );
      return fromRow(result.rows[0]);
    },
  };
}
