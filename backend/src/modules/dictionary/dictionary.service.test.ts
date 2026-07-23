import { describe, expect, it, vi } from "vitest";
import { createDictionaryService } from "./dictionary.service";
import { Authz } from "../../core/authz";
import { buildPermissionsIndex } from "../../core/authz/can";
import type { DictionaryRepository } from "./dictionary.repository";
import type { Term, TermInput } from "./dictionary.types";
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

function fakeAuthz(): Authz {
  return new Authz(
    buildPermissionsIndex([
      { role: "coordinator", permission: "dictionary.edit" },
      { role: "coordinator", permission: "dictionary.delete" },
      { role: "admin", permission: "dictionary.edit" },
      { role: "admin", permission: "dictionary.delete" },
      { role: "admin", permission: "dictionary.delete.hard" },
    ])
  );
}

function fakeRepo(): DictionaryRepository {
  const store = new Map<string, Term>();
  let seq = 0;
  return {
    async list(filters) {
      return [...store.values()].filter((t) => t.active && (!filters.category || t.category === filters.category));
    },
    async findBySlug(slug) {
      return [...store.values()].find((t) => t.slug === slug && t.active) ?? null;
    },
    async findById(id) {
      return store.get(id) ?? null;
    },
    async create(input: TermInput, createdBy: string) {
      seq += 1;
      const term: Term = {
        id: `term-${seq}`,
        slug: input.slug,
        term: input.term,
        definition: input.definition,
        category: input.category ?? null,
        synonyms: input.synonyms ?? [],
        status: input.status ?? "published",
        active: true,
        createdBy,
      };
      store.set(term.id, term);
      return term;
    },
    async update(id, input) {
      const existing = store.get(id)!;
      const updated = { ...existing, ...input };
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

const coordinator: AuthUser = { id: "coord-1", role: "coordinator" };
const user: AuthUser = { id: "user-1", role: "user" };

describe("dictionary.service — CRUD (RF-002/RF-006)", () => {
  it("coordinator cria termo direto", async () => {
    const service = createDictionaryService(fakeRepo(), fakeAuthz(), fakeDb());
    const term = await service.createDirect(coordinator, {
      slug: "adas",
      term: "ADAS",
      definition: "Advanced Driver Assistance Systems",
      category: "tecnologia",
    });
    expect(term.slug).toBe("adas");
  });

  it("user comum NÃO cria termo direto (deve usar contributions.propose)", async () => {
    const service = createDictionaryService(fakeRepo(), fakeAuthz(), fakeDb());
    await expect(
      service.createDirect(user, {
        slug: "adas",
        term: "ADAS",
        definition: "...",
        category: "tecnologia",
      })
    ).rejects.toThrow();
  });

  it("rascunho pode nascer SEM categoria (1a leva de siglas — migração 0008)", async () => {
    const service = createDictionaryService(fakeRepo(), fakeAuthz(), fakeDb());
    const term = await service.createDirect(coordinator, {
      slug: "abs",
      term: "ABS",
      definition: "Antilock Break System",
      status: "draft",
    });
    expect(term.status).toBe("draft");
    expect(term.category).toBeNull();
  });

  it("publicar SEM categoria é rejeitado (terms_published_requires_category)", async () => {
    const service = createDictionaryService(fakeRepo(), fakeAuthz(), fakeDb());
    await expect(
      service.createDirect(coordinator, {
        slug: "abs",
        term: "ABS",
        definition: "Antilock Break System",
        status: "published",
      })
    ).rejects.toThrow();
  });

  it("publicar um rascunho via update exige categoria efetiva", async () => {
    const repo = fakeRepo();
    const service = createDictionaryService(repo, fakeAuthz(), fakeDb());
    const draft = await service.createDirect(coordinator, {
      slug: "acc",
      term: "ACC",
      definition: "Adaptive Cruise Control",
      status: "draft",
    });
    // sem categoria -> bloqueia
    await expect(service.updateDirect(coordinator, draft.id, { status: "published" })).rejects.toThrow();
    // com categoria + tradução -> publica
    const published = await service.updateDirect(coordinator, draft.id, {
      status: "published",
      category: "tecnologia",
      definition: "Controle de cruzeiro adaptativo",
    });
    expect(published.status).toBe("published");
    expect(published.category).toBe("tecnologia");
  });

  it("busca por slug retorna o termo elo estável", async () => {
    const repo = fakeRepo();
    const service = createDictionaryService(repo, fakeAuthz(), fakeDb());
    await service.createDirect(coordinator, {
      slug: "over-the-air",
      term: "OTA",
      definition: "Atualização remota",
      category: "tecnologia",
    });
    const found = await service.getBySlug("over-the-air");
    expect(found.term).toBe("OTA");
  });

  it("getBySlug lança NotFound para slug inexistente", async () => {
    const service = createDictionaryService(fakeRepo(), fakeAuthz(), fakeDb());
    await expect(service.getBySlug("nao-existe")).rejects.toThrow();
  });

  it("delete direto é soft (RN-09): termo some da listagem mas não é apagado fisicamente", async () => {
    const repo = fakeRepo();
    const service = createDictionaryService(repo, fakeAuthz(), fakeDb());
    const term = await service.createDirect(coordinator, {
      slug: "adas",
      term: "ADAS",
      definition: "...",
      category: "tecnologia",
    });
    await service.deleteDirect(coordinator, term.id);
    const list = await service.list({});
    expect(list.find((t) => t.id === term.id)).toBeUndefined();
    const stillThere = await repo.findById(term.id);
    expect(stillThere?.active).toBe(false);
  });

  it("hard delete exige dictionary.delete.hard (só admin)", async () => {
    const repo = fakeRepo();
    const service = createDictionaryService(repo, fakeAuthz(), fakeDb());
    const term = await service.createDirect(coordinator, {
      slug: "adas",
      term: "ADAS",
      definition: "...",
      category: "tecnologia",
    });
    await expect(service.deleteDirect(coordinator, term.id, true)).rejects.toThrow();
  });

  it("applier (usado por contributions ao aprovar) cria/edita/remove um term", async () => {
    const service = createDictionaryService(fakeRepo(), fakeAuthz(), fakeDb());
    const created = await service.applier.applyCreate(
      { slug: "v2x", term: "V2X", definition: "Vehicle-to-everything", category: "tecnologia" },
      "coord-1"
    );
    expect(created.snapshot.slug).toBe("v2x");
    const updated = await service.applier.applyUpdate(created.id, { definition: "Nova definição" }, "coord-1");
    expect(updated.snapshot.definition).toBe("Nova definição");
    const deleted = await service.applier.applyDelete(created.id, "coord-1");
    expect(deleted.snapshot.active).toBe(false);
  });

  // FIX (achado QA ALTA — RN-06/RN-10): createDirect/updateDirect/deleteDirect
  // agora gravam content_revisions + audit_log, exatamente como o caminho de
  // aprovação de contributions. Ver dictionary.rn06-audit-gap.qa.test.ts.
  it("createDirect/updateDirect/deleteDirect gravam content_revisions e audit_log (RN-06/RN-10)", async () => {
    const repo = fakeRepo();
    const db = fakeDb();
    const service = createDictionaryService(repo, fakeAuthz(), db);

    const term = await service.createDirect(coordinator, {
      slug: "adas",
      term: "ADAS",
      definition: "d0",
      category: "tecnologia",
    });
    await service.updateDirect(coordinator, term.id, { definition: "Nova definição" });
    await service.deleteDirect(coordinator, term.id);

    const sqlCalls = db.queryMock.mock.calls.map(([sql]) => String(sql));
    expect(sqlCalls.some((sql) => /INSERT INTO content_revisions/i.test(sql))).toBe(true);
    expect(sqlCalls.some((sql) => /INSERT INTO audit_log/i.test(sql))).toBe(true);
    // Uma revisão + uma entrada de auditoria por operação direta (create/update/delete).
    expect(sqlCalls.filter((sql) => /INSERT INTO content_revisions/i.test(sql)).length).toBe(3);
    expect(sqlCalls.filter((sql) => /INSERT INTO audit_log/i.test(sql)).length).toBe(3);
  });
});
