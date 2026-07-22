// QA — achado ALTA (RN-06/RN-10, doc 28): edição/exclusão DIRETA de
// coordinator/admin precisa ser "versionada em content_revisions" e gravar
// audit_log. Este teste originalmente PROVAVA a lacuna (createDictionaryService
// tinha assinatura (repo, authz), sem qualquer ponto de gravação de auditoria
// no caminho direto). Corrigido: o serviço agora recebe `db` e grava
// content_revisions + audit_log em createDirect/updateDirect/deleteDirect
// (ver dictionary.service.ts, core/history, core/audit). Este arquivo foi
// INVERTIDO para confirmar a correção, não mais reproduzir o gap.

import { describe, expect, it, vi } from "vitest";
import { createDictionaryService } from "./dictionary.service";
import { Authz } from "../../core/authz";
import { buildPermissionsIndex } from "../../core/authz/can";
import type { AuthUser } from "../../core/authz";
import type { Db } from "../../core/db";

const admin: AuthUser = { id: "admin-1", role: "admin" };

function fakeAuthz(): Authz {
  return new Authz(
    buildPermissionsIndex([
      { role: "admin", permission: "dictionary.edit" },
      { role: "admin", permission: "dictionary.delete" },
    ])
  );
}

describe("QA — RN-06/RN-10 (corrigido): edição/exclusão direta grava content_revisions/audit_log", () => {
  it("createDictionaryService agora recebe `db` (arity 3), habilitando a gravação de auditoria/revisão no caminho direto", () => {
    // Antes da correção, a assinatura de produção era (repo, authz) — arity 2
    // — o que provava estruturalmente que updateDirect/deleteDirect não
    // tinham como cumprir RN-06/RN-10. Agora é (repo, authz, db).
    expect(createDictionaryService.length).toBe(3);
  });

  it("updateDirect e deleteDirect (admin) gravam content_revisions e audit_log", async () => {
    const queryMock = vi.fn().mockResolvedValue({ rows: [] });
    const db: Db = {
      query: queryMock as unknown as Db["query"],
      withTransaction: vi.fn(),
      ping: vi.fn().mockResolvedValue(true),
      close: vi.fn(),
    };

    // repo mínimo instrumentado: cada chamada registra a "intenção" de SQL.
    const calls: string[] = [];
    const repo = {
      async list() {
        return [];
      },
      async findBySlug() {
        return null;
      },
      async findById(id: string) {
        calls.push(`SELECT terms ${id}`);
        return {
          id,
          slug: "adas",
          term: "ADAS",
          definition: "d0",
          category: "geral" as const,
          synonyms: [],
          status: "published" as const,
          active: true,
          createdBy: "admin-1",
        };
      },
      async create(input: any, createdBy: string) {
        calls.push("INSERT INTO terms");
        return { id: "t-1", ...input, createdBy };
      },
      async update(id: string, input: any) {
        calls.push("UPDATE terms");
        return {
          id,
          slug: "adas",
          term: "ADAS",
          definition: input.definition ?? "d0",
          category: "geral" as const,
          synonyms: [],
          status: "published" as const,
          active: true,
          createdBy: "admin-1",
        };
      },
      async softDelete(id: string) {
        calls.push("UPDATE terms SET active=false");
        return {
          id,
          slug: "adas",
          term: "ADAS",
          definition: "d0",
          category: "geral" as const,
          synonyms: [],
          status: "published" as const,
          active: false,
          createdBy: "admin-1",
        };
      },
    };

    const service = createDictionaryService(repo as any, fakeAuthz(), db);
    await service.updateDirect(admin, "t-1", { definition: "Nova definição" });
    await service.deleteDirect(admin, "t-1");

    // Evidência da correção: agora HÁ chamadas de audit_log/content_revisions
    // no `db` injetado, uma por operação (update e delete).
    const sqlCalls = queryMock.mock.calls.map(([sql]) => String(sql));
    const revisionInserts = sqlCalls.filter((sql) => /INSERT INTO content_revisions/i.test(sql));
    const auditInserts = sqlCalls.filter((sql) => /INSERT INTO audit_log/i.test(sql));

    expect(revisionInserts.length).toBe(2); // update + delete
    expect(auditInserts.length).toBe(2); // update + delete
    expect(calls).toEqual(["SELECT terms t-1", "UPDATE terms", "SELECT terms t-1", "UPDATE terms SET active=false"]);
  });
});
