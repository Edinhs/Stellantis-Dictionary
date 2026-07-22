import { z } from "zod";

export const projectInputSchema = z
  .object({
    slug: z.string().min(2).max(120).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    code: z.string().min(1).max(60),
    name: z.string().min(1).max(200),
    description: z.string().optional(),
    status: z.enum(["conceito", "homologacao", "producao"]).optional(),
    techSheet: z.record(z.unknown()).optional(),
    versions: z.array(z.unknown()).optional(),
  })
  .strict();

export const projectUpdateSchema = projectInputSchema.partial().strict();
