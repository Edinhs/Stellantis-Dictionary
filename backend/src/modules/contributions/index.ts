// contributions/index — CONTRATO PÚBLICO. Módulo TRANSVERSAL: recebe os
// `appliers` de `dictionary`/`components`/`projects` (contratos públicos
// desses módulos), nunca importa o interior deles. Ver doc 13 §2 (nota de
// coesão) e contributions.types.ts (TargetApplier).

import type { Db } from "../../core/db";
import type { Authz } from "../../core/authz";
import { createContributionsRepository } from "./contributions.repository";
import { createContributionsService, type ContributionsService } from "./contributions.service";
import { contributionsRoutes } from "./contributions.routes";
import type { AppliersByTargetType } from "./contributions.types";

export interface ContributionsModule {
  service: ContributionsService;
  router: ReturnType<typeof contributionsRoutes>;
}

export function createContributionsModule(db: Db, authz: Authz, appliers: AppliersByTargetType): ContributionsModule {
  const repository = createContributionsRepository(db);
  const service = createContributionsService(repository, appliers, authz, db);
  const router = contributionsRoutes(service);
  return { service, router };
}

export type { ContributionsService } from "./contributions.service";
export type { TargetApplier, AppliersByTargetType, ContributionRow } from "./contributions.types";
