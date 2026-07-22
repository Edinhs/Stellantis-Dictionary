// QA (gate 12) — módulo `projects` NÃO tinha NENHUM teste de unidade. Mesmo
// padrão de dictionary.service.test.ts/components.service.test.ts: CRUD
// direto, RBAC por cargo (RN-03), soft delete (RN-09) e auditoria/revisão
// (RN-06/RN-10).

import { describe, expect, it, vi } from "vitest";
import { createProjectsService } from "./projects.service";
import { Authz } from "../../core/authz";
import { buildPermissionsIndex } from "../../core/authz/can";
import type { ProjectsRepository } from "./projects.repository";
import type { Project, ProjectInput } from "./projects.types";
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

// Espelha o seed real (seeds/role_permissions.json) para a área 'project'.
function fakeAuthz(): Authz {
  return new Authz(
    buildPermissionsIndex([
      { role: "user", permission: "project.propose" },
      { role: "coordinator", permission: "project.propose" },
      { role: "coordinator", permission: "project.edit" },
      { role: "coordinator", permission: "project.approve" },
      { role: "coordinator", permission: "project.delete" },
      { role: "admin", permission: "project.propose" },
      { role: "admin", permission: "project.edit" },
      { role: "admin", permission: "project.approve" },
      { role: "admin", permission: "project.delete" },
      { role: "admin", permission: "project.delete.hard" },
    ])
  );
}

function fakeRepo(): ProjectsRepository {
  const store = new Map<string, Project>();
  let seq = 0;
  return {
    async list(filters) {
      return [...store.values()].filter((p) => p.active && (!filters.status || p.status === filters.status));
    },
    async findBySlug(slug) {
      return [...store.values()].find((p) => p.slug === slug && p.active) ?? null;
    },
    async findById(id) {
      return store.get(id) ?? null;
    },
    async create(input: ProjectInput, createdBy: string) {
      seq += 1;
      const project: Project = {
        id: `project-${seq}`,
        slug: input.slug,
        code: input.code,
        name: input.name,
        description: input.description ?? null,
        status: input.status ?? "conceito",
        techSheet: input.techSheet ?? {},
        versions: input.versions ?? [],
        active: true,
      };
      void createdBy;
      store.set(project.id, project);
      return project;
    },
    async update(id, input) {
      const existing = store.get(id)!;
      const updated = { ...existing, ...input } as Project;
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

const baseInput: ProjectInput = {
  slug: "projeto-atlas",
  code: "ATL-01",
  name: "Projeto Atlas",
  status: "conceito",
};

describe("projects.service — CRUD direto + RBAC (RN-03)", () => {
  it("coordinator cria projeto direto", async () => {
    const service = createProjectsService(fakeRepo(), fakeAuthz(), fakeDb());
    const project = await service.createDirect(coordinator, baseInput);
    expect(project.slug).toBe("projeto-atlas");
  });

  it("admin cria projeto direto", async () => {
    const service = createProjectsService(fakeRepo(), fakeAuthz(), fakeDb());
    const project = await service.createDirect(admin, baseInput);
    expect(project.code).toBe("ATL-01");
  });

  it("user comum NÃO cria/edita/exclui projeto direto (só tem project.propose)", async () => {
    const repo = fakeRepo();
    const service = createProjectsService(repo, fakeAuthz(), fakeDb());
    await expect(service.createDirect(user, baseInput)).rejects.toThrow();
    const project = await service.createDirect(coordinator, baseInput);
    await expect(service.updateDirect(user, project.id, { name: "Outro nome" })).rejects.toThrow();
    await expect(service.deleteDirect(user, project.id)).rejects.toThrow();
  });

  it("busca por slug retorna o projeto; slug inexistente lança NotFound", async () => {
    const repo = fakeRepo();
    const service = createProjectsService(repo, fakeAuthz(), fakeDb());
    await service.createDirect(coordinator, baseInput);
    const found = await service.getBySlug("projeto-atlas");
    expect(found.name).toBe("Projeto Atlas");
    await expect(service.getBySlug("nao-existe")).rejects.toThrow();
  });

  it("updateDirect/deleteDirect lançam NotFound para id inexistente", async () => {
    const service = createProjectsService(fakeRepo(), fakeAuthz(), fakeDb());
    await expect(service.updateDirect(coordinator, "id-fantasma", { name: "x" })).rejects.toThrow();
    await expect(service.deleteDirect(coordinator, "id-fantasma")).rejects.toThrow();
  });

  it("exclusão direta é soft delete (RN-09): some da listagem mas continua no repositório", async () => {
    const repo = fakeRepo();
    const service = createProjectsService(repo, fakeAuthz(), fakeDb());
    const project = await service.createDirect(coordinator, baseInput);
    await service.deleteDirect(coordinator, project.id);
    const list = await service.list({});
    expect(list.find((p) => p.id === project.id)).toBeUndefined();
    const stillThere = await repo.findById(project.id);
    expect(stillThere?.active).toBe(false);
  });

  it("createDirect/updateDirect/deleteDirect gravam content_revisions e audit_log (RN-06/RN-10)", async () => {
    const repo = fakeRepo();
    const db = fakeDb();
    const service = createProjectsService(repo, fakeAuthz(), db);
    const project = await service.createDirect(coordinator, baseInput);
    await service.updateDirect(coordinator, project.id, { name: "Atlas v2" });
    await service.deleteDirect(coordinator, project.id);

    const sqlCalls = db.queryMock.mock.calls.map(([sql]) => String(sql));
    expect(sqlCalls.filter((sql) => /INSERT INTO content_revisions/i.test(sql)).length).toBe(3);
    expect(sqlCalls.filter((sql) => /INSERT INTO audit_log/i.test(sql)).length).toBe(3);
  });

  it("applier (usado por contributions ao aprovar) cria/edita/remove um projeto", async () => {
    const service = createProjectsService(fakeRepo(), fakeAuthz(), fakeDb());
    const created = await service.applier.applyCreate(
      { slug: "projeto-orion", code: "ORI-01", name: "Projeto Orion" },
      "user-1"
    );
    expect(created.snapshot.slug).toBe("projeto-orion");
    const updated = await service.applier.applyUpdate(created.id, { name: "Projeto Orion v2" }, "coord-1");
    expect(updated.snapshot.name).toBe("Projeto Orion v2");
    const deleted = await service.applier.applyDelete(created.id, "coord-1");
    expect(deleted.snapshot.active).toBe(false);
  });

  it("filtro de listagem por status restringe os resultados", async () => {
    const repo = fakeRepo();
    const service = createProjectsService(repo, fakeAuthz(), fakeDb());
    await service.createDirect(coordinator, { ...baseInput, slug: "p1", status: "conceito" });
    await service.createDirect(coordinator, { ...baseInput, slug: "p2", status: "producao" });
    const emProducao = await service.list({ status: "producao" });
    expect(emProducao.map((p) => p.slug)).toEqual(["p2"]);
  });

  // Observação de auditoria (não é defeito): o DTO público de Project omite
  // deliberadamente platform/motorization (decisão do CEO, ver README do
  // módulo) — confirmamos que o service não os expõe mesmo que estivessem no
  // techSheet, pois o contrato de tipo já os exclui do DTO.
  it("techSheet arbitrário é preservado no snapshot sem vazar campos fora do contrato Project", async () => {
    const repo = fakeRepo();
    const service = createProjectsService(repo, fakeAuthz(), fakeDb());
    const project = await service.createDirect(coordinator, {
      ...baseInput,
      slug: "projeto-sigilo",
      techSheet: { motor: "eletrico", autonomiaKm: 400 },
    });
    expect(project.techSheet).toEqual({ motor: "eletrico", autonomiaKm: 400 });
    expect(Object.keys(project)).not.toContain("platform");
    expect(Object.keys(project)).not.toContain("motorization");
  });
});
