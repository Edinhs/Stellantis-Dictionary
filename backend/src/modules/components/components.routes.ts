import { Router } from "express";
import { UnauthorizedError, ValidationError } from "../../core/errors";
import { componentInputSchema, componentUpdateSchema } from "./components.schema";
import type { ComponentsService } from "./components.service";

export function componentsRoutes(service: ComponentsService): Router {
  const router = Router();

  router.get("/", async (req, res, next) => {
    try {
      const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;
      const supplierId = typeof req.query.supplierId === "string" ? req.query.supplierId : undefined;
      res.json({ items: await service.list({ categoryId, supplierId }) });
    } catch (err) {
      next(err);
    }
  });

  router.get("/:slug", async (req, res, next) => {
    try {
      res.json({ component: await service.getBySlug(req.params.slug) });
    } catch (err) {
      next(err);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const parsed = componentInputSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Componente inválido", parsed.error.flatten());
      res.status(201).json({ component: await service.createDirect(req.user, parsed.data) });
    } catch (err) {
      next(err);
    }
  });

  router.patch("/:id", async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const parsed = componentUpdateSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Atualização inválida", parsed.error.flatten());
      res.json({ component: await service.updateDirect(req.user, req.params.id, parsed.data) });
    } catch (err) {
      next(err);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      res.json({ component: await service.deleteDirect(req.user, req.params.id) });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
