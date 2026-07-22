// QA (gate 12) — módulo `components` NÃO tinha NENHUM teste de unidade
// (só dictionary/contributions/users/auth tinham). Cobre o mesmo padrão de
// dictionary.service.test.ts: CRUD direto, RBAC por cargo (RN-03), soft
// delete (RN-09) e a trilha de auditoria/revisão (RN-06/RN-10) que
// components.service.ts já implementa (mesmo padrão do fix aplicado em
// dictionary).

import { describe, expect, it, vi } from "vitest";
import { createComponentsService } from "./components.service";
import { Authz } from "../../core/authz";
import { buildPermissionsIndex } from "../../core/authz/can";
import type { ComponentsRepository } from "./components.repository";
import type { Component, ComponentInput } from "./components.types";
import type { AuthUser } from "../../core/authz";
import type { Db } from "../../core/db";

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

// Espelha o seed real (seeds/role_permissions.json) para a área 'component'.
function fakeAuthz(): Authz {
  return new Authz(
    buildPermissionsIndex([
      { role: "user", permission: "component.propose" },
      { role: "coordinator", permission: "component.propose" },
      { role: "coordinator", permission: "component.edit" },
      { role: "coordinator", permission: "component.approve" },
      { role: "coordinator", permission: "component.delete" },
      { role: "admin", permission: "component.propose" },
      { role: "admin", permission: "component.edit" },
      { role: "admin", permission: "component.approve" },
      { role: "admin", permission: "component.delete" },
      { role: "admin", permission: "component.delete.hard" },
    ])
  );
}

function fakeRepo(): ComponentsRepository {
  const store = new Map<string, Component>();
  let seq = 0;
  return {
    async list(filters) {
      return [...store.values()].filter(
        (c) =>
          c.active &&
          (!filters.categoryId || c.categoryId === filters.categoryId) &&
          (!filters.supplierId || c.supplierId === filters.supplierId)
      );
    },
    async findBySlug(slug) {
      return [...store.values()].find((c) => c.slug === slug && c.active) ?? null;
    },
    async findById(id) {
      return store.get(id) ?? null;
    },
    async create(input: ComponentInput, createdBy: string) {
      seq += 1;
      const component: Component = {
        id: `component-${seq}`,
        slug: input.slug,
        name: input.name,
        description: input.description ?? null,
        imageUrl: input.imageUrl ?? null,
        categoryId: input.categoryId,
        supplierId: input.supplierId ?? null,
        termSlug: input.termSlug ?? null,
        status: input.status ?? "published",
        active: true,
      };
      void createdBy;
      store.set(component.id, component);
      return component;
    },
    async update(id, input) {
      const existing = store.get(id)!;
      const updated = { ...existing, ...input } as Component;
      store.set(id, updated);
      return updated;
    },
    async softDelete(id) {
      const existing = store.get(id)!;
      const updated = { ...existing, active: false };
      store.set(id, updated);
      return updated;
    },
  };
}

const admin: AuthUser = { id: "admin-1", role: "admin" };
const coordinator: AuthUser = { id: "coord-1", role: "coordinator" };
const user: AuthUser = { id: "user-1", role: "user" };

const baseInput: ComponentInput = {
  slug: "sensor-lidar",
  name: "Sensor LiDAR",
  categoryId: "cat-sensores",
  status: "published",
};

describe("components.service — CRUD direto + RBAC (RN-03)", () => {
  it("coordinator cria componente direto", async () => {
    const service = createComponentsService(fakeRepo(), fakeAuthz(), fakeDb());
    const component = await service.createDirect(coordinator, baseInput);
    expect(component.slug).toBe("sensor-lidar");
  });

  it("admin cria componente direto", async () => {
    const service = createComponentsService(fakeRepo(), fakeAuthz(), fakeDb());
    const component = await service.createDirect(admin, baseInput);
    expect(component.slug).toBe("sensor-lidar");
  });

  it("user comum NÃO cria componente direto (só tem component.propose, precisa contributions)", async () => {
    const service = createComponentsService(fakeRepo(), fakeAuthz(), fakeDb());
    await expect(service.createDirect(user, baseInput)).rejects.toThrow();
  });

  it("user comum NÃO edita nem exclui componente direto", async () => {
    const repo = fakeRepo();
    const service = createComponentsService(repo, fakeAuthz(), fakeDb());
    const component = await service.createDirect(coordinator, baseInput);
    await expect(service.updateDirect(user, component.id, { name: "Outro nome" })).rejects.toThrow();
    await expect(service.deleteDirect(user, component.id)).rejects.toThrow();
  });

  it("busca por slug retorna o componente; slug inexistente lança NotFound", async () => {
    const repo = fakeRepo();
    const service = createComponentsService(repo, fakeAuthz(), fakeDb());
    await service.createDirect(coordinator, baseInput);
    const found = await service.getBySlug("sensor-lidar");
    expect(found.name).toBe("Sensor LiDAR");
    await expect(service.getBySlug("nao-existe")).rejects.toThrow();
  });

  it("coordinator edita componente direto e a mudança é refletida", async () => {
    const repo = fakeRepo();
    const service = createComponentsService(repo, fakeAuthz(), fakeDb());
    const component = await service.createDirect(coordinator, baseInput);
    const updated = await service.updateDirect(coordinator, component.id, { name: "LiDAR de estado sólido" });
    expect(updated.name).toBe("LiDAR de estado sólido");
  });

  it("updateDirect/deleteDirect lançam NotFound para id inexistente", async () => {
    const service = createComponentsService(fakeRepo(), fakeAuthz(), fakeDb());
    await expect(service.updateDirect(coordinator, "id-fantasma", { name: "x" })).rejects.toThrow();
    await expect(service.deleteDirect(coordinator, "id-fantasma")).rejects.toThrow();
  });

  it("exclusão direta é soft delete (RN-09): some da listagem mas continua no repositório", async () => {
    const repo = fakeRepo();
    const service = createComponentsService(repo, fakeAuthz(), fakeDb());
    const component = await service.createDirect(coordinator, baseInput);
    await service.deleteDirect(coordinator, component.id);
    const list = await service.list({});
    expect(list.find((c) => c.id === component.id)).toBeUndefined();
    const stillThere = await repo.findById(component.id);
    expect(stillThere?.active).toBe(false);
  });

  it("createDirect/updateDirect/deleteDirect gravam content_revisions e audit_log (RN-06/RN-10)", async () => {
    const repo = fakeRepo();
    const db = fakeDb();
    const service = createComponentsService(repo, fakeAuthz(), db);
    const component = await service.createDirect(coordinator, baseInput);
    await service.updateDirect(coordinator, component.id, { name: "Novo nome" });
    await service.deleteDirect(coordinator, component.id);

    const sqlCalls = db.queryMock.mock.calls.map(([sql]) => String(sql));
    expect(sqlCalls.filter((sql) => /INSERT INTO content_revisions/i.test(sql)).length).toBe(3);
    expect(sqlCalls.filter((sql) => /INSERT INTO audit_log/i.test(sql)).length).toBe(3);
  });

  it("applier (usado por contributions ao aprovar) cria/edita/remove um componente", async () => {
    const service = createComponentsService(fakeRepo(), fakeAuthz(), fakeDb());
    const created = await service.applier.applyCreate(
      { slug: "camera-frontal", name: "Câmera frontal", categoryId: "cat-sensores" },
      "user-1"
    );
    expect(created.snapshot.slug).toBe("camera-frontal");
    const updated = await service.applier.applyUpdate(created.id, { name: "Câmera frontal HD" }, "coord-1");
    expect(updated.snapshot.name).toBe("Câmera frontal HD");
    const deleted = await service.applier.applyDelete(created.id, "coord-1");
    expect(deleted.snapshot.active).toBe(false);
  });

  it("filtros de listagem (categoryId/supplierId) restringem os resultados", async () => {
    const repo = fakeRepo();
    const service = createComponentsService(repo, fakeAuthz(), fakeDb());
    await service.createDirect(coordinator, { ...baseInput, slug: "a", categoryId: "cat-a" });
    await service.createDirect(coordinator, { ...baseInput, slug: "b", categoryId: "cat-b" });
    const onlyA = await service.list({ categoryId: "cat-a" });
    expect(onlyA.map((c) => c.slug)).toEqual(["a"]);
  });
});
