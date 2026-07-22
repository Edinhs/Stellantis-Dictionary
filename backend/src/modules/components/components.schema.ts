import { z } from "zod";

export const componentInputSchema = z
  .object({
    slug: z.string().min(2).max(120).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    name: z.string().min(1).max(200),
    description: z.string().optional(),
    imageUrl: z.string().url().optional(),
    categoryId: z.string().uuid(),
    supplierId: z.string().uuid().optional(),
    termSlug: z.string().optional(),
    status: z.enum(["draft", "published"]).optional(),
  })
  .strict();

export const componentUpdateSchema = componentInputSchema.partial().strict();
