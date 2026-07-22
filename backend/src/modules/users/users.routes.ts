import { Router } from "express";
import { z } from "zod";
import { UnauthorizedError, ValidationError } from "../../core/errors";
import type { UsersService } from "./users.service";

const assignRoleSchema = z.object({ role: z.enum(["user", "coordinator", "admin"]) }).strict();

export function usersRoutes(service: UsersService): Router {
  const router = Router();

  router.get("/me", async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const profile = await service.getProfile(req.user.id);
      res.json({ user: profile });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/users/:id/role — só admin/coordinator (checado no serviço via
  // can('role.assign') + travas de RN-04). Rota exige apenas autenticação;
  // a decisão fina é 100% do serviço (nunca `if role === 'admin'` na rota).
  router.post("/:id/role", async (req, res, next) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const parsed = assignRoleSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Cargo inválido", parsed.error.flatten());
      const updated = await service.assignRole(req.user, req.params.id, parsed.data.role);
      res.json({ user: updated });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
