// auth/index — CONTRATO PÚBLICO do módulo (doc 13 §3.1). Registra as rotas
// e expõe o serviço (usado por outros módulos só via este contrato, nunca
// importando auth.service/.repository diretamente).

import type { Db } from "../../core/db";
import type { AppConfig } from "../../core/config";
import { createAuthRepository } from "./auth.repository";
import { createAuthService, type AuthService } from "./auth.service";
import { authRoutes } from "./auth.routes";

export interface AuthModule {
  service: AuthService;
  router: ReturnType<typeof authRoutes>;
}

export function createAuthModule(db: Db, config: AppConfig): AuthModule {
  const repository = createAuthRepository(db);
  const service = createAuthService(repository, config);
  const router = authRoutes(service, config);
  return { service, router };
}

export type { AuthService } from "./auth.service";
export type { PublicUser } from "./auth.types";
