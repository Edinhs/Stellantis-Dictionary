import { z } from "zod";

// Schema declarativo (skill backend-api): rejeita campos extras.
export const registerSchema = z
  .object({
    name: z.string().min(2).max(120),
    email: z.string().email().max(180),
    password: z.string().min(8).max(200),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
