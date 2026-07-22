import { Router } from "express";
import { UnauthorizedError, ValidationError } from "../../core/errors";
import { termInputSchema, termUpdateSchema } from "./dictionary.schema";
import type { DictionaryService } from "./dictionary.service";
import type { TermCategory } from "./dictionary.types";

export function dictionaryRoutes(service: DictionaryService): Router {
  const router = Router();

  router.get("/", async (req, res, next) => {
    try {
      const category = req.query.category as TermCategory | undefined;
      const search = typeof req.query.q === "string" ? req.query.q : undefined;
      const items = await service.list({ category, search });
      res.json({ items });
    } catch (err) {
      next(err);
    }
  });

  router.get("/:slug", async (req, res, next) => {
    try {
      const term = await service.getBySlug(req.params.slug);
      res.json({ term });
    } catch (err) {
      next(err);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const parsed = termInputSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Termo inválido", parsed.error.flatten());
      const term = await service.createDirect(req.user, parsed.data);
      res.status(201).json({ term });
    } catch (err) {
      next(err);
    }
  });

  router.patch("/:id", async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const parsed = termUpdateSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Atualização inválida", parsed.error.flatten());
      const term = await service.updateDirect(req.user, req.params.id, parsed.data);
      res.json({ term });
    } catch (err) {
      next(err);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const hard = req.query.hard === "true";
      const term = await service.deleteDirect(req.user, req.params.id, hard);
      res.json({ term });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
