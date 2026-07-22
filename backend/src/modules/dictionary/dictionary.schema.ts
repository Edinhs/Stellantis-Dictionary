import { z } from "zod";

export const termInputSchema = z
  .object({
    slug: z
      .string()
      .min(2)
      .max(120)
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug deve ser kebab-case"),
    term: z.string().min(1).max(200),
    definition: z.string().min(1),
    category: z.enum(["motorizacao", "tecnologia", "componentes", "plataformas"]),
    synonyms: z.array(z.string()).optional(),
    status: z.enum(["draft", "published"]).optional(),
  })
  .strict();

export const termUpdateSchema = termInputSchema.partial().strict();

export type TermInputPayload = z.infer<typeof termInputSchema>;
