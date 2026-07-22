import type { Db } from "../../core/db";
import type { Authz } from "../../core/authz";
import { createProjectsRepository } from "./projects.repository";
import { createProjectsService, type ProjectsService } from "./projects.service";
import { projectsRoutes } from "./projects.routes";

export interface ProjectsModule {
  service: ProjectsService;
  router: ReturnType<typeof projectsRoutes>;
}

export function createProjectsModule(db: Db, authz: Authz): ProjectsModule {
  const repository = createProjectsRepository(db);
  const service = createProjectsService(repository, authz, db);
  const router = projectsRoutes(service);
  return { service, router };
}

export type { ProjectsService } from "./projects.service";
export type { Project, ProjectInput, ProjectStatus } from "./projects.types";
