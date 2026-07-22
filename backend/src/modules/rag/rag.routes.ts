import { Router } from "express";
import { z } from "zod";
import { UnauthorizedError, ValidationError } from "../../core/errors";
import type { RagService } from "./rag.service";

const chatSchema = z
  .object({
    conversationId: z.string().uuid().optional(),
    message: z.string().min(1).max(4000),
  })
  .strict();

export function ragRoutes(service: RagService): Router {
  const router = Router();

  // Rate limit obrigatório em chat (skill backend-api) — pendência: entra
  // junto do devops-baseline (middleware compartilhado); não bloqueia esta
  // entrega, mas fica registrado como próximo passo (ver rag/README.md).
  router.post("/", async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const parsed = chatSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Requisição de chat inválida", parsed.error.flatten());
      const response = await service.chat(req.user, parsed.data);
      res.json(response);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
