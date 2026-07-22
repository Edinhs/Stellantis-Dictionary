export type TermCategory = "motorizacao" | "tecnologia" | "componentes" | "plataformas";

export interface Term {
  id: string;
  slug: string;
  term: string;
  definition: string;
  category: TermCategory;
  synonyms: string[];
  status: "draft" | "published";
  active: boolean;
  createdBy: string | null;
}

export interface TermInput {
  slug: string;
  term: string;
  definition: string;
  category: TermCategory;
  synonyms?: string[];
  status?: "draft" | "published";
}
