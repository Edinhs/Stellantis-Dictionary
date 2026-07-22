import { Router } from "express";
import { UnauthorizedError, ValidationError } from "../../core/errors";
import { projectInputSchema, projectUpdateSchema } from "./projects.schema";
import type { ProjectsService } from "./projects.service";
import type { ProjectStatus } from "./projects.types";

export function projectsRoutes(service: ProjectsService): Router {
  const router = Router();

  router.get("/", async (req, res, next) => {
    try {
      const status = req.query.status as ProjectStatus | undefined;
      res.json({ items: await service.list({ status }) });
    } catch (err) {
      next(err);
    }
  });

  router.get("/:slug", async (req, res, next) => {
    try {
      res.json({ project: await service.getBySlug(req.params.slug) });
    } catch (err) {
      next(err);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const parsed = projectInputSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Projeto inválido", parsed.error.flatten());
      res.status(201).json({ project: await service.createDirect(req.user, parsed.data) });
    } catch (err) {
      next(err);
    }
  });

  router.patch("/:id", async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const parsed = projectUpdateSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Atualização inválida", parsed.error.flatten());
      res.json({ project: await service.updateDirect(req.user, req.params.id, parsed.data) });
    } catch (err) {
      next(err);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      res.json({ project: await service.deleteDirect(req.user, req.params.id) });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
