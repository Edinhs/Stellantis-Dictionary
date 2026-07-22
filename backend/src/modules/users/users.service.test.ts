// RN-04 — Atribuição de cargos e anti-escalonamento (doc 28 §RN-04).
// Pendência F1 da Segurança (fechamento Etapa 9/11): `role_permissions`
// sozinha NÃO impede (a) coordinator promover a admin nem (b) auto-alteração
// de cargo. Este arquivo é o teste que cobre exatamente essas duas travas,
// mais a trilha de auditoria (c).

import { describe, expect, it, vi } from "vitest";
import { createUsersService } from "./users.service";
import { Authz } from "../../core/authz";
import { buildPermissionsIndex } from "../../core/authz/can";
import type { UsersRepository } from "./users.repository";
import type { UserProfile } from "./users.types";
import type { Db } from "../../core/db";
import type { AuthUser, Role } from "../../core/authz";

function fakeAuthz(): Authz {
  // Espelha o seed real (seeds/role_permissions.json): só coordinator/admin
  // têm `role.assign`. `user` nunca tem.
  return new Authz(
    buildPermissionsIndex([
      { role: "coordinator", permission: "role.assign" },
      { role: "admin", permission: "role.assign" },
    ])
  );
}

function fakeRepo(seed: UserProfile[]): UsersRepository {
  const users = new Map(seed.map((u) => [u.id, { ...u }]));
  return {
    async findById(id) {
      return users.get(id) ?? null;
    },
    async updateRole(id, role) {
      const user = users.get(id);
      if (!user) throw new Error("not found");
      user.role = role;
      users.set(id, user);
      return { ...user };
    },
  };
}

function fakeDb(): Db & { queryMock: ReturnType<typeof vi.fn> } {
  const queryMock = vi.fn().mockResolvedValue({ rows: [] });
  return {
    query: queryMock as unknown as Db["query"],
    withTransaction: vi.fn(),
    ping: vi.fn().mockResolvedValue(true),
    close: vi.fn(),
    queryMock,
  };
}

function actor(id: string, role: Role): AuthUser {
  return { id, role };
}

const baseUsers: UserProfile[] = [
  { id: "u-user", name: "Usuário Comum", email: "user@x.com", role: "user", active: true },
  { id: "u-coord", name: "Coordenador", email: "coord@x.com", role: "coordinator", active: true },
  { id: "u-admin", name: "Admin", email: "admin@x.com", role: "admin", active: true },
];

describe("RN-04 — anti-escalonamento de cargos (F1)", () => {
  it("user comum não pode atribuir cargo a ninguém (sem permissão role.assign)", async () => {
    const service = createUsersService(fakeRepo(baseUsers), fakeAuthz(), fakeDb());
    await expect(service.assignRole(actor("u-user", "user"), "u-coord", "admin")).rejects.toThrow();
  });

  it("coordinator NUNCA promove alguém a admin", async () => {
    const service = createUsersService(fakeRepo(baseUsers), fakeAuthz(), fakeDb());
    await expect(service.assignRole(actor("u-coord", "coordinator"), "u-user", "admin")).rejects.toThrow(
      /admin/i
    );
  });

  it("coordinator NUNCA edita o cargo de um admin existente", async () => {
    const service = createUsersService(fakeRepo(baseUsers), fakeAuthz(), fakeDb());
    await expect(
      service.assignRole(actor("u-coord", "coordinator"), "u-admin", "coordinator")
    ).rejects.toThrow(/admin/i);
  });

  it("coordinator PODE transitar user <-> coordinator", async () => {
    const repo = fakeRepo(baseUsers);
    const service = createUsersService(repo, fakeAuthz(), fakeDb());
    const updated = await service.assignRole(actor("u-coord", "coordinator"), "u-user", "coordinator");
    expect(updated.role).toBe("coordinator");
  });

  it("NINGUÉM altera o próprio cargo — nem admin", async () => {
    const service = createUsersService(fakeRepo(baseUsers), fakeAuthz(), fakeDb());
    await expect(service.assignRole(actor("u-admin", "admin"), "u-admin", "user")).rejects.toThrow();
    await expect(service.assignRole(actor("u-coord", "coordinator"), "u-coord", "user")).rejects.toThrow();
  });

  it("admin PODE promover alguém a admin (fora da trava de coordinator)", async () => {
    const repo = fakeRepo(baseUsers);
    const service = createUsersService(repo, fakeAuthz(), fakeDb());
    const updated = await service.assignRole(actor("u-admin", "admin"), "u-coord", "admin");
    expect(updated.role).toBe("admin");
  });

  it("toda mudança de cargo aplicada grava audit_log (RN-04 c)", async () => {
    const db = fakeDb();
    const service = createUsersService(fakeRepo(baseUsers), fakeAuthz(), db);
    await service.assignRole(actor("u-admin", "admin"), "u-user", "coordinator");
    expect(db.queryMock).toHaveBeenCalled();
    const [sql] = db.queryMock.mock.calls[0];
    expect(sql).toMatch(/INSERT INTO audit_log/i);
  });
});
