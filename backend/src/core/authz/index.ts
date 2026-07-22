// core/authz — CONTRATO PÚBLICO: resolvedor can(), carga do índice de
// permissões a partir de `role_permissions` e middleware `authorize(perm)`
// para uso nas rotas (skill backend-api).

import type { NextFunction, Request, Response } from "express";
import type { Db } from "../db";
import { ForbiddenError, UnauthorizedError } from "../errors";
import { buildPermissionsIndex, can, type AuthUser, type PermissionsIndex, type Role } from "./can";
import type { Permission } from "./permissions";

export type { AuthUser, PermissionsIndex, Role };
export type { Permission };
export { can };

export class Authz {
  private index: PermissionsIndex;

  constructor(index: PermissionsIndex) {
    this.index = index;
  }

  can(user: Pick<AuthUser, "role"> | null | undefined, permission: Permission): boolean {
    return can(user, permission, this.index);
  }

  replaceIndex(index: PermissionsIndex): void {
    this.index = index;
  }

  /** Middleware Express: 401 sem usuário autenticado, 403 sem a permissão. */
  authorize(permission: Permission) {
    return (req: Request, _res: Response, next: NextFunction) => {
      const user = (req as Request & { user?: AuthUser }).user;
      if (!user) return next(new UnauthorizedError());
      if (!this.can(user, permission)) return next(new ForbiddenError());
      next();
    };
  }
}

export async function loadPermissionsIndex(db: Db): Promise<PermissionsIndex> {
  const result = await db.query<{ role: Role; permission: Permission }>(
    "SELECT role, permission FROM role_permissions"
  );
  return buildPermissionsIndex(result.rows);
}
