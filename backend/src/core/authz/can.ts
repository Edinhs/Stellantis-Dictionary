// core/authz/can — resolvedor CENTRAL de autorização (SPEC 09 §2.1, doc 13
// §4.1/§7 regra 5). TODA checagem de acesso passa por aqui; nenhum módulo faz
// `if (user.role === 'admin')`. Adicionar um 4º cargo ou uma permissão nova é
// só dado em `role_permissions` (seed), nunca deploy de código.
//
// Guardrail (S4, doc 25 §4): gamificação (XP/nível) NUNCA entra como fonte de
// permissão aqui — `can()` resolve exclusivamente `role -> role_permissions`.

import type { Permission } from "./permissions";

export type Role = "user" | "coordinator" | "admin";

export interface AuthUser {
  id: string;
  role: Role;
}

/** role -> conjunto de permissões concedidas (carregado de `role_permissions`). */
export type PermissionsIndex = ReadonlyMap<Role, ReadonlySet<Permission>>;

export function can(user: Pick<AuthUser, "role"> | null | undefined, permission: Permission, index: PermissionsIndex): boolean {
  if (!user) return false;
  const grants = index.get(user.role);
  return grants ? grants.has(permission) : false;
}

export function buildPermissionsIndex(rows: Array<{ role: Role; permission: Permission }>): PermissionsIndex {
  const map = new Map<Role, Set<Permission>>();
  for (const row of rows) {
    if (!map.has(row.role)) map.set(row.role, new Set());
    map.get(row.role)!.add(row.permission);
  }
  return map;
}
