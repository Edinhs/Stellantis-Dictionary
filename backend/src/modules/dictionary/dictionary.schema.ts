import { z } from "zod";

// `category` é OPCIONAL/`null` porque um verbete pode nascer como RASCUNHO sem
// classificação (1a leva de conteúdo real: sigla + significado em inglês, o CEO
// classifica depois — migração 0008). A regra "não se publica sem categoria" é
// aplicada abaixo (refine) e garantida no banco pelo CHECK
// terms_published_requires_category.
const categorySchema = z.enum(["motorizacao", "tecnologia", "componentes", "plataformas"]);

const termBaseSchema = z
  .object({
    slug: z
      .string()
      .min(2)
      .max(120)
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug deve ser kebab-case"),
    term: z.string().min(1).max(200),
    definition: z.string().min(1),
    category: categorySchema.nullish(),
    synonyms: z.array(z.string()).optional(),
    status: z.enum(["draft", "published"]).optional(),
  })
  .strict();

/** Publicar exige categoria canônica; rascunho pode ficar sem. */
function requireCategoryWhenPublished(
  data: { status?: "draft" | "published"; category?: string | null },
  ctx: z.RefinementCtx
): void {
  if (data.status === "published" && !data.category) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["category"],
      message: "categoria é obrigatória para publicar o verbete",
    });
  }
}

export const termInputSchema = termBaseSchema.superRefine(requireCategoryWhenPublished);

export const termUpdateSchema = termBaseSchema.partial().superRefine(requireCategoryWhenPublished);

export type TermInputPayload = z.infer<typeof termInputSchema>;
