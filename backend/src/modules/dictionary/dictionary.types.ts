export type TermCategory = "motorizacao" | "tecnologia" | "componentes" | "plataformas";

export interface Term {
  id: string;
  slug: string;
  term: string;
  definition: string;
  // NULL enquanto rascunho a classificar (migração 0008). Publicar exige
  // categoria canônica — garantido pelo CHECK terms_published_requires_category
  // e reforçado na camada de serviço.
  category: TermCategory | null;
  synonyms: string[];
  status: "draft" | "published";
  active: boolean;
  createdBy: string | null;
}

export interface TermInput {
  slug: string;
  term: string;
  definition: string;
  category?: TermCategory | null;
  synonyms?: string[];
  status?: "draft" | "published";
}
