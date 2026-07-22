// auth.routes — camada ROTA: HTTP, validação, cookie httpOnly do refresh
// token (skill backend-api). Rate limit de login/refresh/registro fica
// documentado como pendência (ver README do módulo) — a lib de rate limit
// entra junto do devops-baseline; não bloqueia esta entrega.

import { Router } from "express";
import type { AppConfig } from "../../core/config";
import { loginSchema, registerSchema } from "./auth.schema";
import type { AuthService } from "./auth.service";
import { ValidationError } from "../../core/errors";

const REFRESH_COOKIE = "refresh_token";

function refreshCookieOptions(config: AppConfig) {
  return {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "strict" as const,
    path: "/api/auth",
  };
}

export function authRoutes(service: AuthService, config: AppConfig): Router {
  const router = Router();

  router.post("/register", async (req, res, next) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Cadastro inválido", parsed.error.flatten());
      const { user, tokens } = await service.register(parsed.data);
      res.cookie(REFRESH_COOKIE, tokens.refreshToken, refreshCookieOptions(config));
      res.status(201).json({ user, accessToken: tokens.accessToken });
    } catch (err) {
      next(err);
    }
  });

  router.post("/login", async (req, res, next) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Login inválido", parsed.error.flatten());
      const { user, tokens } = await service.login(parsed.data);
      res.cookie(REFRESH_COOKIE, tokens.refreshToken, refreshCookieOptions(config));
      res.status(200).json({ user, accessToken: tokens.accessToken });
    } catch (err) {
      next(err);
    }
  });

  router.post("/refresh", async (req, res, next) => {
    try {
      const token = req.cookies?.[REFRESH_COOKIE];
      if (!token) throw new ValidationError("Refresh token ausente");
      const tokens = await service.refresh(token);
      res.cookie(REFRESH_COOKIE, tokens.refreshToken, refreshCookieOptions(config));
      res.status(200).json({ accessToken: tokens.accessToken });
    } catch (err) {
      next(err);
    }
  });

  router.post("/logout", (_req, res) => {
    res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
    res.status(204).send();
  });

  return router;
}
