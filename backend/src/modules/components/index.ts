import type { Db } from "../../core/db";
import type { Authz } from "../../core/authz";
import { createComponentsRepository } from "./components.repository";
import { createComponentsService, type ComponentsService } from "./components.service";
import { componentsRoutes } from "./components.routes";

export interface ComponentsModule {
  service: ComponentsService;
  router: ReturnType<typeof componentsRoutes>;
}

export function createComponentsModule(db: Db, authz: Authz): ComponentsModule {
  const repository = createComponentsRepository(db);
  const service = createComponentsService(repository, authz, db);
  const router = componentsRoutes(service);
  return { service, router };
}

export type { ComponentsService } from "./components.service";
export type { Component, ComponentInput } from "./components.types";
