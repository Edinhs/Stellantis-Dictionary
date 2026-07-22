// QA (gate 12) — plano de teste formal: matriz sistemática de permissões
// (user/coordinator/admin) x target_type (term/project/component) para
// propose/listPending/approve, espelhando seeds/role_permissions.json (fonte
// da verdade). Também cobre transições de estado INVÁLIDAS da máquina de
// `contributions.status` (RN-07, doc 28) que não estavam exercitadas:
// - aprovar/rejeitar uma contribuição já rejeitada/retirada
// - retirar uma contribuição de outro autor (já coberto), já aprovada, ou já
//   rejeitada
// - propor update/delete sem targetId (validação RN-07 implícita)
// - listPending: matriz completa por target_type, não só o caso 'sem
//   targetType' já coberto em contributions.listpending-gap.qa.test.ts

import { describe, expect, it, vi } from "vitest";
import { createContributionsService } from "./contributions.service";
import { Authz } from "../../core/authz";
import { buildPermissionsIndex } from "../../core/authz/can";
import type { ContributionsRepository } from "./contributions.repository";
import type { AppliersByTargetType, ContributionRow } from "./contributions.types";
import type { Db } from "../../core/db";
import type { AuthUser } from "../../core/authz";
import type { TargetType } from "../../shared/contracts";

function fakeDb(): Db {
  return {
    query: vi.fn().mockResolvedValue({ rows: [] } as never),
    withTransaction: vi.fn(),
    ping: vi.fn().mockResolvedValue(true),
    close: vi.fn(),
  };
}

// Espelha INTEGRALMENTE seeds/role_permissions.json (as 3 áreas: dictionary,
// project, component) — é a matriz real usada em produção, não um recorte.
function fakeAuthzFullSeed(): Authz {
  return new Authz(
    buildPermissionsIndex([
      { role: "user", permission: "dictionary.propose" },
      { role: "user", permission: "project.propose" },
      { role: "user", permission: "component.propose" },

      { role: "coordinator", permission: "dictionary.propose" },
      { role: "coordinator", permission: "dictionary.approve" },
      { role: "coordinator", permission: "project.propose" },
      { role: "coordinator", permission: "project.approve" },
      { role: "coordinator", permission: "component.propose" },
      { role: "coordinator", permission: "component.approve" },

      { role: "admin", permission: "dictionary.propose" },
      { role: "admin", permission: "dictionary.approve" },
      { role: "admin", permission: "project.propose" },
      { role: "admin", permission: "project.approve" },
      { role: "admin", permission: "component.propose" },
      { role: "admin", permission: "component.approve" },
    ])
  );
}

function fakeRepo(): ContributionsRepository & { store: Map<string, ContributionRow> } {
  const store = new Map<string, ContributionRow>();
  let seq = 0;
  return {
    store,
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
      return 1;
    },
    async insertRevision() {},
  };
}

function fakeAppliers(): AppliersByTargetType {
  const applier = {
    async applyCreate(payload: Record<string, unknown>) {
      return { id: "target-1", snapshot: payload };
    },
    async applyUpdate(targetId: string, payload: Record<string, unknown>) {
      return { snapshot: { ...payload, id: targetId } };
    },
    async applyDelete(targetId: string) {
      return { snapshot: { id: targetId, active: false } };
    },
  };
  return { term: applier, project: applier, component: applier };
}

const userActor: AuthUser = { id: "user-1", role: "user" };
const coordinatorActor: AuthUser = { id: "coord-1", role: "coordinator" };
const adminActor: AuthUser = { id: "admin-1", role: "admin" };

const ALL_TARGET_TYPES: TargetType[] = ["term", "project", "component"];
const ALL_ACTORS: Array<{ label: string; actor: AuthUser; canPropose: boolean; canApprove: boolean }> = [
  { label: "user", actor: userActor, canPropose: true, canApprove: false },
  { label: "coordinator", actor: coordinatorActor, canPropose: true, canApprove: true },
  { label: "admin", actor: adminActor, canPropose: true, canApprove: true },
];

describe("QA — matriz RBAC sistemática de contributions (propose) por cargo x target_type", () => {
  for (const targetType of ALL_TARGET_TYPES) {
    for (const { label, actor, canPropose } of ALL_ACTORS) {
      it(`${label} ${canPropose ? "PODE" : "NÃO pode"} propor contribution de target_type='${targetType}'`, async () => {
        const service = createContributionsService(fakeRepo(), fakeAppliers(), fakeAuthzFullSeed(), fakeDb());
        const action = service.propose(actor, {
          targetType,
          targetId: null,
          action: "create",
          payload: { any: "payload" },
        });
        if (canPropose) {
          await expect(action).resolves.toMatchObject({ status: "pending" });
        } else {
          await expect(action).rejects.toThrow();
        }
      });
    }
  }
});

describe("QA — matriz RBAC sistemática de contributions (approve) por cargo x target_type", () => {
  for (const targetType of ALL_TARGET_TYPES) {
    for (const { label, actor, canApprove } of ALL_ACTORS) {
      it(`${label} ${canApprove ? "PODE" : "NÃO pode"} aprovar contribution de target_type='${targetType}'`, async () => {
        const repo = fakeRepo();
        const service = createContributionsService(repo, fakeAppliers(), fakeAuthzFullSeed(), fakeDb());
        const contribution = await service.propose(userActor, {
          targetType,
          targetId: null,
          action: "create",
          payload: { any: "payload" },
        });
        const action = service.approve(actor, contribution.id);
        if (canApprove) {
          await expect(action).resolves.toMatchObject({ status: "approved" });
        } else {
          await expect(action).rejects.toThrow();
        }
      });
    }
  }
});

describe("QA — matriz RBAC sistemática de listPending(targetType) por cargo x target_type", () => {
  for (const targetType of ALL_TARGET_TYPES) {
    for (const { label, actor, canApprove } of ALL_ACTORS) {
      it(`${label} ${canApprove ? "PODE" : "NÃO pode"} listar fila pendente de '${targetType}'`, async () => {
        const repo = fakeRepo();
        const service = createContributionsService(repo, fakeAppliers(), fakeAuthzFullSeed(), fakeDb());
        await service.propose(userActor, {
          targetType,
          targetId: null,
          action: "create",
          payload: { any: "payload" },
        });
        const action = service.listPending(actor, targetType);
        if (canApprove) {
          await expect(action).resolves.toHaveLength(1);
        } else {
          await expect(action).rejects.toThrow();
        }
      });
    }
  }
});

describe("QA — máquina de estados de contributions.status: transições inválidas (RN-07)", () => {
  it("rejeitar uma contribuição JÁ aprovada é negado (ConflictError)", async () => {
    const repo = fakeRepo();
    const service = createContributionsService(repo, fakeAppliers(), fakeAuthzFullSeed(), fakeDb());
    const contribution = await service.propose(userActor, {
      targetType: "term",
      targetId: null,
      action: "create",
      payload: {},
    });
    await service.approve(coordinatorActor, contribution.id);
    await expect(service.reject(coordinatorActor, contribution.id, "tarde demais")).rejects.toThrow();
  });

  it("aprovar uma contribuição JÁ rejeitada é negado (ConflictError)", async () => {
    const repo = fakeRepo();
    const service = createContributionsService(repo, fakeAppliers(), fakeAuthzFullSeed(), fakeDb());
    const contribution = await service.propose(userActor, {
      targetType: "term",
      targetId: null,
      action: "create",
      payload: {},
    });
    await service.reject(coordinatorActor, contribution.id, "não serve");
    await expect(service.approve(coordinatorActor, contribution.id)).rejects.toThrow();
  });

  it("retirar (withdraw) uma contribuição JÁ aprovada é negado, mesmo pelo próprio autor", async () => {
    const repo = fakeRepo();
    const service = createContributionsService(repo, fakeAppliers(), fakeAuthzFullSeed(), fakeDb());
    const contribution = await service.propose(userActor, {
      targetType: "term",
      targetId: null,
      action: "create",
      payload: {},
    });
    await service.approve(coordinatorActor, contribution.id);
    await expect(service.withdraw(userActor, contribution.id)).rejects.toThrow();
  });

  it("retirar (withdraw) uma contribuição JÁ rejeitada é negado, mesmo pelo próprio autor", async () => {
    const repo = fakeRepo();
    const service = createContributionsService(repo, fakeAppliers(), fakeAuthzFullSeed(), fakeDb());
    const contribution = await service.propose(userActor, {
      targetType: "term",
      targetId: null,
      action: "create",
      payload: {},
    });
    await service.reject(coordinatorActor, contribution.id, "não serve");
    await expect(service.withdraw(userActor, contribution.id)).rejects.toThrow();
  });

  it("aprovar/rejeitar/retirar uma contribuição inexistente lança NotFoundError", async () => {
    const service = createContributionsService(fakeRepo(), fakeAppliers(), fakeAuthzFullSeed(), fakeDb());
    await expect(service.approve(coordinatorActor, "id-fantasma")).rejects.toThrow();
    await expect(service.reject(coordinatorActor, "id-fantasma", "nota")).rejects.toThrow();
    await expect(service.withdraw(userActor, "id-fantasma")).rejects.toThrow();
  });

  it("propor update/delete sem targetId é rejeitado (ValidationError)", async () => {
    const service = createContributionsService(fakeRepo(), fakeAppliers(), fakeAuthzFullSeed(), fakeDb());
    await expect(
      service.propose(userActor, { targetType: "term", targetId: null, action: "update", payload: {} })
    ).rejects.toThrow();
    await expect(
      service.propose(userActor, { targetType: "term", targetId: null, action: "delete", payload: {} })
    ).rejects.toThrow();
  });

  it("um coordinator de outra área (só dictionary.approve) NÃO aprova contribution de 'component'", async () => {
    const repo = fakeRepo();
    const scopedAuthz = new Authz(
      buildPermissionsIndex([
        { role: "user", permission: "component.propose" },
        { role: "coordinator", permission: "dictionary.approve" }, // sem component.approve
      ])
    );
    const service = createContributionsService(repo, fakeAppliers(), scopedAuthz, fakeDb());
    const contribution = await service.propose(userActor, {
      targetType: "component",
      targetId: null,
      action: "create",
      payload: {},
    });
    await expect(service.approve(coordinatorActor, contribution.id)).rejects.toThrow();
  });
});

// Nota QA (achado observacional, NÃO corrigido nesta rodada — devolvido ao
// eng-lead/product-lead como pergunta em aberto já registrada no doc 28 §9.2):
// RN-08 ("revisor ≠ autor") não tem trava no código — um coordinator/admin
// PODE aprovar/rejeitar a própria contribuição hoje. O doc 28 §9.2 marca essa
// regra como "ainda em aberto" (sempre × só com ≥2 revisores), então este
// teste apenas DOCUMENTA o comportamento atual (auto-aprovação permitida),
// sem travar um veredito de aceite/rejeite até a decisão de produto.
describe("QA — observação RN-08 (revisor == autor, doc 28 §9.2 em aberto)", () => {
  it("hoje um coordinator PODE aprovar a própria contribuição (auto-aprovação não é bloqueada)", async () => {
    const repo = fakeRepo();
    const service = createContributionsService(repo, fakeAppliers(), fakeAuthzFullSeed(), fakeDb());
    const contribution = await service.propose(coordinatorActor, {
      targetType: "term",
      targetId: null,
      action: "create",
      payload: {},
    });
    const approved = await service.approve(coordinatorActor, contribution.id);
    expect(approved.status).toBe("approved");
    expect(approved.reviewedBy).toBe(coordinatorActor.id);
  });
});
