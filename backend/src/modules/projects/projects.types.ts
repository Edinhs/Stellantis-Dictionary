export type ProjectStatus = "conceito" | "homologacao" | "producao";

export interface Project {
  id: string;
  slug: string;
  code: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  techSheet: Record<string, unknown>;
  versions: unknown[];
  active: boolean;
  // platform/motorization deliberadamente OMITIDOS do DTO público (decisão
  // do CEO, ver README.md e migração 0007-projects.sql).
}

export interface ProjectInput {
  slug: string;
  code: string;
  name: string;
  description?: string;
  status?: ProjectStatus;
  techSheet?: Record<string, unknown>;
  versions?: unknown[];
}
