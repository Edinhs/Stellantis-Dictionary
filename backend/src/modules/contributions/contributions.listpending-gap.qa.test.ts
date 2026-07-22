// QA — achado ALTA: `listPending` sem `targetType` não checava NENHUMA
// permissão, deixando qualquer autenticado (inclusive role='user' sem
// nenhuma permissão de aprovação) listar TODAS as contribuições pendentes de
// TODOS os target_types — a fila de moderação completa.
//
// Corrigido (contributions.service.ts): sem `targetType`, só quem pode
// revisar TODAS as áreas (hoje: coordinator/admin, que têm
// dictionary.approve + project.approve + component.approve no seed real)
// enxerga a fila completa; quem não tem alguma dessas permissões recebe
// ForbiddenError. Este arquivo foi INVERTIDO para confirmar a correção.

import { describe, expect, it, vi } from "vitest";
import { createContributionsService } from "./contributions.service";
import { Authz } from "../../core/authz";
import { buildPermissionsIndex } from "../../core/authz/can";
import type { ContributionsRepository } from "./contributions.repository";
import type { AppliersByTargetType, ContributionRow } from "./contributions.types";
import type { Db } from "../../core/db";
import type { AuthUser } from "../../core/authz";

function fakeDb(): Db {
  return {
    query: vi.fn().mockResolvedValue({ rows: [] } as never),
    withTransaction: vi.fn(),
    ping: vi.fn().mockResolvedValue(true),
    close: vi.fn(),
  };
}

// `user` comum não tem NENHUMA permissão de aprovação (espelha o seed real).
function fakeAuthzNoApprovePermission(): Authz {
  return new Authz(buildPermissionsIndex([{ role: "user", permission: "dictionary.propose" }]));
}

// coordinator com as 3 permissões de aprovação (espelha o seed real:
// seeds/role_permissions.json dá dictionary/project/component.approve a
// coordinator e admin).
function fakeAuthzFullReviewer(): Authz {
  return new Authz(
    buildPermissionsIndex([
      { role: "coordinator", permission: "dictionary.approve" },
      { role: "coordinator", permission: "project.approve" },
      { role: "coordinator", permission: "component.approve" },
    ])
  );
}

function fakeRepo(seed: ContributionRow[]): ContributionsRepository {
  return {
    async create() {
      throw new Error("not used");
    },
    async findById() {
      return null;
    },
    async listPending() {
      return seed;
    },
    async markReviewed() {
      throw new Error("not used");
    },
    async nextRevisionNumber() {
      return 1;
    },
    async insertRevision() {},
  };
}

function fakeAppliers(): AppliersByTargetType {
  return {};
}

const otherUsersPending: ContributionRow[] = [
  {
    id: "contrib-1",
    authorId: "OUTRO-USUARIO",
    targetType: "term",
    targetId: null,
    action: "create",
    payload: { term: "segredo-de-outro-autor" },
    status: "pending",
    reviewNote: null,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("QA — listPending sem targetType (corrigido): agora valida permissão de aprovação", () => {
  it("user comum (sem nenhum *.approve) NÃO consegue mais listar a fila completa ao omitir targetType", async () => {
    const service = createContributionsService(
      fakeRepo(otherUsersPending),
      fakeAppliers(),
      fakeAuthzNoApprovePermission(),
      fakeDb()
    );
    const plainUser: AuthUser = { id: "user-comum", role: "user" };

    await expect(service.listPending(plainUser, undefined)).rejects.toThrow();
  });

  it("coordinator com as 3 permissões de aprovação (*.approve) pode listar a fila completa", async () => {
    const service = createContributionsService(
      fakeRepo(otherUsersPending),
      fakeAppliers(),
      fakeAuthzFullReviewer(),
      fakeDb()
    );
    const coordinator: AuthUser = { id: "coord-1", role: "coordinator" };

    const items = await service.listPending(coordinator, undefined);
    expect(items).toEqual(otherUsersPending);
  });
});
