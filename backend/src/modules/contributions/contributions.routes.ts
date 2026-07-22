import { Router } from "express";
import { z } from "zod";
import { UnauthorizedError, ValidationError } from "../../core/errors";
import type { ContributionsService } from "./contributions.service";

const proposeSchema = z
  .object({
    targetType: z.enum(["term", "project", "component"]),
    targetId: z.string().uuid().nullable(),
    action: z.enum(["create", "update", "delete"]),
    payload: z.record(z.unknown()),
  })
  .strict();

const rejectSchema = z.object({ reviewNote: z.string().min(1) }).strict();

export function contributionsRoutes(service: ContributionsService): Router {
  const router = Router();

  router.get("/", async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const targetType = req.query.targetType as "term" | "project" | "component" | undefined;
      const items = await service.listPending(req.user, targetType);
      res.json({ items });
    } catch (err) {
      next(err);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const parsed = proposeSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Proposta inválida", parsed.error.flatten());
      const contribution = await service.propose(req.user, parsed.data);
      res.status(201).json({ contribution });
    } catch (err) {
      next(err);
    }
  });

  router.post("/:id/approve", async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const contribution = await service.approve(req.user, req.params.id);
      res.json({ contribution });
    } catch (err) {
      next(err);
    }
  });

  router.post("/:id/reject", async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const parsed = rejectSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("review_note é obrigatório", parsed.error.flatten());
      const contribution = await service.reject(req.user, req.params.id, parsed.data.reviewNote);
      res.json({ contribution });
    } catch (err) {
      next(err);
    }
  });

  router.post("/:id/withdraw", async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const contribution = await service.withdraw(req.user, req.params.id);
      res.json({ contribution });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
