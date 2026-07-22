// app.ts — composição do servidor HTTP (doc 13 §4.3). Registra o `index.ts`
// de cada módulo; a lista de módulos ativos fica explícita e auditável aqui.

import cookieParser from "cookie-parser";
import express, { type Express } from "express";
import type { AppConfig } from "./core/config";
import type { Db } from "./core/db";
import { Authz, type PermissionsIndex } from "./core/authz";
import { authenticate } from "./core/http/auth-middleware";
import { healthRoute } from "./core/http/health.route";
import { errorHandler } from "./core/errors";
import { createAuthModule } from "./modules/auth";
import { createUsersModule } from "./modules/users";
import { createDictionaryModule } from "./modules/dictionary";
import { createComponentsModule } from "./modules/components";
import { createProjectsModule } from "./modules/projects";
import { createContributionsModule } from "./modules/contributions";
import { createRagModule } from "./modules/rag";
import type { AppliersByTargetType } from "./modules/contributions/contributions.types";

export function createApp(db: Db, config: AppConfig, permissionsIndex: PermissionsIndex): Express {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  // Público, sem auth (readiness — docker-compose bate aqui).
  app.use("/api", healthRoute(db));

  const authz = new Authz(permissionsIndex);
  const authMiddleware = authenticate(config);

  const auth = createAuthModule(db, config);
  const users = createUsersModule(db, authz);
  const dictionary = createDictionaryModule(db, authz);
  const components = createComponentsModule(db, authz);
  const projects = createProjectsModule(db, authz);

  // `contributions` é TRANSVERSAL: recebe os appliers dos módulos-alvo pelo
  // contrato público deles (doc 13 §2, nota de coesão), nunca importando o
  // interior. `workflows`/`directory` entram aqui quando saírem do MVP D20.
  const appliers: AppliersByTargetType = {
    term: dictionary.service.applier,
    component: components.service.applier,
    project: projects.service.applier,
  };
  const contributions = createContributionsModule(db, authz, appliers);
  const rag = createRagModule(db, config);

  // Rotas de auth são públicas (cadastro/login/refresh); as demais exigem
  // access token válido (`authenticate`). Rotas de leitura (GET) de
  // dictionary/components/projects também passam pelo middleware nesta
  // rodada — plataforma interna, sem endpoint público anônimo (SPEC 02 §5).
  app.use("/api/auth", auth.router);
  app.use("/api/users", authMiddleware, users.router);
  app.use("/api/dicionario", authMiddleware, dictionary.router);
  app.use("/api/componentes", authMiddleware, components.router);
  app.use("/api/projetos", authMiddleware, projects.router);
  app.use("/api/contribuicoes", authMiddleware, contributions.router);
  app.use("/api/chat", authMiddleware, rag.router);

  app.use(errorHandler);

  return app;
}
