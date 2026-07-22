import type { Db } from "../../core/db";
import type { Authz } from "../../core/authz";
import { createUsersRepository } from "./users.repository";
import { createUsersService, type UsersService } from "./users.service";
import { usersRoutes } from "./users.routes";

export interface UsersModule {
  service: UsersService;
  router: ReturnType<typeof usersRoutes>;
}

export function createUsersModule(db: Db, authz: Authz): UsersModule {
  const repository = createUsersRepository(db);
  const service = createUsersService(repository, authz, db);
  const router = usersRoutes(service);
  return { service, router };
}

export type { UsersService } from "./users.service";
export type { UserProfile } from "./users.types";
