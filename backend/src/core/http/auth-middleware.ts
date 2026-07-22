// core/http/auth-middleware — verifica o access token JWT (Authorization:
// Bearer) e popula `req.user` ({ id, role }). Não decide permissão (isso é
// `authorize()` de core/authz); só autentica. Ref.: skill backend-api.

import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { AppConfig } from "../config";
import { UnauthorizedError } from "../errors";
import type { AuthUser } from "../authz";

export interface AccessTokenPayload {
  sub: string;
  role: AuthUser["role"];
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

export function authenticate(config: AppConfig) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return next(new UnauthorizedError("Token de acesso ausente"));
    }
    const token = header.slice("Bearer ".length);
    try {
      const payload = jwt.verify(token, config.jwt.accessSecret) as AccessTokenPayload;
      req.user = { id: payload.sub, role: payload.role };
      next();
    } catch {
      next(new UnauthorizedError("Token de acesso inválido ou expirado"));
    }
  };
}

/** Variante que não falha sem token (rotas públicas com comportamento opcional). */
export function authenticateOptional(config: AppConfig) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) return next();
    const token = header.slice("Bearer ".length);
    try {
      const payload = jwt.verify(token, config.jwt.accessSecret) as AccessTokenPayload;
      req.user = { id: payload.sub, role: payload.role };
    } catch {
      // ignora token inválido em rota pública; segue anônimo
    }
    next();
  };
}
