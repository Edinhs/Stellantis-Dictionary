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

function fakeAuthz(): Authz {
  // Espelha o seed real (seeds/role_permissions.json) para target_type='term'
  // (área 'dictionary'): todo mundo propõe; só coordinator/admin aprovam.
  return new Authz(
    buildPermissionsIndex([
      { role: "user", permission: "dictionary.propose" },
      { role: "coordinator", permission: "dictionary.propose" },
      { role: "coordinator", permission: "dictionary.approve" },
      { role: "admin", permission: "dictionary.propose" },
      { role: "admin", permission: "dictionary.approve" },
    ])
  );
}

function fakeRepo(): ContributionsRepository {
  const store = new Map<string, ContributionRow>();
  const revisions: unknown[] = [];
  let seq = 0;
  return {
    async create(input) {
      seq += 1;
      const row: ContributionRow = {
        id: `contrib-${seq}`,
        authorId: input.authorId,
        targetType: input.targetType,
        targetId: input.targetId,
        action: input.action,
        payload: input.payload,
        status: "pending",
        reviewNote: null,
        reviewedBy: null,
        reviewedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.set(row.id, row);
      return row;
    },
    async findById(id) {
      return store.get(id) ?? null;
    },
    async listPending(targetType) {
      return [...store.values()].filter(
        (c) => c.status === "pending" && (!targetType || c.targetType === targetType)
      );
    },
    async markReviewed(id, input) {
      const row = store.get(id)!;
      const updated = { ...row, status: input.status, reviewNote: input.reviewNote, reviewedBy: input.reviewedBy };
      store.set(id, updated);
      return updated;
    },
    async nextRevisionNumber() {
      return revisions.length + 1;
    },
    async insertRevision(input) {
      revisions.push(input);
    },
  };
}

const user: AuthUser = { id: "user-1", role: "user" };
const coordinator: AuthUser = { id: "coord-1", role: "coordinator" };

function fakeAppliers(): AppliersByTargetType {
  return {
    term: {
      async applyCreate(payload) {
        return { id: "term-1", snapshot: payload };
      },
      async applyUpdate(targetId, payload) {
        return { snapshot: { ...payload, id: targetId } };
      },
      async applyDelete(targetId) {
        return { snapshot: { id: targetId, active: false } };
      },
    },
  };
}

describe("contributions.service — fluxo propõe-e-aprova (SPEC 09 §4)", () => {
  it("user propõe: cria contribuição pending sem alterar conteúdo público", async () => {
    const service = createContributionsService(fakeRepo(), fakeAppliers(), fakeAuthz(), fakeDb());
    const contribution = await service.propose(user, {
      targetType: "term",
      targetId: null,
      action: "create",
      payload: { term: "ADAS", definition: "..." },
    });
    expect(contribution.status).toBe("pending");
    expect(contribution.authorId).toBe("user-1");
  });

  it("user comum NÃO pode aprovar contribuição (falta contribution.approve)", async () => {
    const repo = fakeRepo();
    const service = createContributionsService(repo, fakeAppliers(), fakeAuthz(), fakeDb());
    const contribution = await service.propose(user, {
      targetType: "term",
      targetId: null,
      action: "create",
      payload: { term: "ADAS" },
    });
    await expect(service.approve(user, contribution.id)).rejects.toThrow();
  });

  it("coordinator aprova: aplica payload via applier e grava revisão", async () => {
    const repo = fakeRepo();
    const service = createContributionsService(repo, fakeAppliers(), fakeAuthz(), fakeDb());
    const contribution = await service.propose(user, {
      targetType: "term",
      targetId: null,
      action: "create",
      payload: { term: "ADAS", definition: "Advanced Driver Assistance Systems" },
    });
    const approved = await service.approve(coordinator, contribution.id);
    expect(approved.status).toBe("approved");
    expect(approved.reviewedBy).toBe("coord-1");
  });

  it("rejeitar exige review_note (SPEC 09 §4)", async () => {
    const repo = fakeRepo();
    const service = createContributionsService(repo, fakeAppliers(), fakeAuthz(), fakeDb());
    const contribution = await service.propose(user, {
      targetType: "term",
      targetId: null,
      action: "create",
      payload: { term: "ADAS" },
    });
    await expect(service.reject(coordinator, contribution.id, "")).rejects.toThrow();
    const rejected = await service.reject(coordinator, contribution.id, "Definição incompleta");
    expect(rejected.status).toBe("rejected");
    expect(rejected.reviewNote).toBe("Definição incompleta");
  });

  it("não aprova/rejeita duas vezes a mesma contribuição (sem estado 'pending')", async () => {
    const repo = fakeRepo();
    const service = createContributionsService(repo, fakeAppliers(), fakeAuthz(), fakeDb());
    const contribution = await service.propose(user, {
      targetType: "term",
      targetId: null,
      action: "create",
      payload: { term: "ADAS" },
    });
    await service.approve(coordinator, contribution.id);
    await expect(service.approve(coordinator, contribution.id)).rejects.toThrow();
  });

  it("só o autor pode retirar (withdraw) a própria contribuição pendente", async () => {
    const repo = fakeRepo();
    const service = createContributionsService(repo, fakeAppliers(), fakeAuthz(), fakeDb());
    const contribution = await service.propose(user, {
      targetType: "term",
      targetId: null,
      action: "create",
      payload: { term: "ADAS" },
    });
    const outro: AuthUser = { id: "user-2", role: "user" };
    await expect(service.withdraw(outro, contribution.id)).rejects.toThrow();
    const withdrawn = await service.withdraw(user, contribution.id);
    expect(withdrawn.status).toBe("withdrawn");
  });
});
