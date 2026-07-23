// QA — cobertura automatizada do importador operacional `import-siglas.ts`
// (achado QA S2: falta de teste). Exercita, sem tocar Postgres real:
//  1. trava de produção DENY-BY-DEFAULT (assertImportAllowed);
//  2. pré-check de published-sem-categoria (assertNoPublishedWithoutCategory);
//  3. idempotência ON CONFLICT (slug) DO NOTHING — 2ª execução não sobrescreve;
//  4. escrita de UMA entrada-resumo em audit_log (action='dictionary.import').
//
// O guard de execução `require.main === module` no módulo garante que importar
// este arquivo NÃO dispara `main()` (não abre conexão de banco).

import { describe, expect, it, vi } from "vitest";
import type { Db } from "../core/db";
import { assertImportAllowed, assertNoPublishedWithoutCategory, runImport } from "./import-siglas";

function draft(slug: string) {
  return {
    slug,
    term: slug.toUpperCase(),
    definition: "def",
    category: null,
    synonyms: [] as string[],
    source_type: "manual" as const,
    status: "draft" as const,
    metadata: {},
  };
}

function dataset(slugs: string[]) {
  return {
    source_batch: "siglas-lista-geral-2",
    source_file: "Lista_Geral_de_Siglas_2.xlsx",
    imported: slugs.length,
    terms: slugs.map(draft),
  };
}

/** Fake `Db` que honra ON CONFLICT (slug) DO NOTHING: um slug já existente
 * retorna rowCount=0 (pulado). Registra as chamadas de audit_log. */
function fakeDb(existing: Set<string> = new Set()) {
  const auditInserts: unknown[][] = [];
  const query = vi.fn(async (sql: string, params?: unknown[]) => {
    if (/INSERT INTO terms/i.test(sql)) {
      const slug = params?.[0] as string;
      if (existing.has(slug)) return { rows: [], rowCount: 0 };
      existing.add(slug);
      return { rows: [{ id: `id-${slug}` }], rowCount: 1 };
    }
    if (/INSERT INTO audit_log/i.test(sql)) {
      auditInserts.push(params ?? []);
      return { rows: [], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  });
  const db = {
    query: query as unknown as Db["query"],
    withTransaction: vi.fn(),
    ping: vi.fn().mockResolvedValue(true),
    close: vi.fn(),
  } as Db;
  return { db, query, auditInserts, existing };
}

describe("import-siglas — trava DENY-BY-DEFAULT (assertImportAllowed)", () => {
  it("permite em development e test (ambientes implicitamente liberados)", () => {
    expect(() => assertImportAllowed({ nodeEnv: "development" })).not.toThrow();
    expect(() => assertImportAllowed({ nodeEnv: "test" })).not.toThrow();
  });

  it("RECUSA em production sem opt-in", () => {
    expect(() => assertImportAllowed({ nodeEnv: "production" })).toThrow(/deny-by-default/i);
  });

  it("RECUSA em ambiente desconhecido/typo/vazio sem opt-in (não degrada p/ dev)", () => {
    for (const env of ["staging", "PROD", "Production", ""]) {
      expect(() => assertImportAllowed({ nodeEnv: env })).toThrow(/deny-by-default/i);
    }
  });

  it("permite com opt-in explícito (--confirm ou ALLOW_REAL_IMPORT=1) mesmo em production", () => {
    expect(() => assertImportAllowed({ nodeEnv: "production", confirmFlag: true })).not.toThrow();
    expect(() => assertImportAllowed({ nodeEnv: "production", allowEnv: "1" })).not.toThrow();
  });

  it("opt-in inválido (ALLOW_REAL_IMPORT!='1') NÃO libera", () => {
    expect(() => assertImportAllowed({ nodeEnv: "production", allowEnv: "true" })).toThrow(/deny-by-default/i);
    expect(() => assertImportAllowed({ nodeEnv: "production", allowEnv: "0" })).toThrow(/deny-by-default/i);
  });
});

describe("import-siglas — pré-check published-sem-categoria", () => {
  it("aceita lote todo rascunho sem categoria", () => {
    expect(() => assertNoPublishedWithoutCategory(dataset(["abs", "adas"]).terms)).not.toThrow();
  });

  it("RECUSA quando há 'published' sem categoria (violaria o CHECK 0008)", () => {
    const terms = [{ ...draft("acc"), status: "published" as const }];
    expect(() => assertNoPublishedWithoutCategory(terms)).toThrow(/published.*sem categoria/i);
  });
});

describe("import-siglas — runImport (idempotência + audit_log)", () => {
  it("insere todos na 1ª execução e grava UMA entrada de audit_log", async () => {
    const { db, auditInserts } = fakeDb();
    const res = await runImport(dataset(["abs", "adas", "acc"]), db);
    expect(res).toEqual({ inserted: 3, skipped: 0 });
    expect(auditInserts.length).toBe(1);
    // action = 'dictionary.import' (2º parâmetro do INSERT audit_log)
    expect(auditInserts[0][1]).toBe("dictionary.import");
    // metadata (8º parâmetro) carrega a contagem do lote
    const meta = JSON.parse(String(auditInserts[0][7]));
    expect(meta).toMatchObject({ total: 3, inserted: 3, skipped: 0 });
  });

  it("idempotente: 2ª execução NÃO sobrescreve — todos pulados (ON CONFLICT DO NOTHING)", async () => {
    const existing = new Set<string>();
    const first = fakeDb(existing);
    await runImport(dataset(["abs", "adas"]), first.db);

    // 2ª execução compartilhando o mesmo estado de slugs já inseridos
    const second = fakeDb(existing);
    const res2 = await runImport(dataset(["abs", "adas"]), second.db);
    expect(res2).toEqual({ inserted: 0, skipped: 2 });
    // ainda assim registra a auditoria da tentativa (inserted=0, skipped=2)
    expect(second.auditInserts.length).toBe(1);
    const meta = JSON.parse(String(second.auditInserts[0][7]));
    expect(meta).toMatchObject({ total: 2, inserted: 0, skipped: 2 });
  });

  it("carga parcial: só slugs ausentes entram (mistura novo + existente)", async () => {
    const existing = new Set<string>(["abs"]); // 'abs' já existe
    const { db } = fakeDb(existing);
    const res = await runImport(dataset(["abs", "novo"]), db);
    expect(res).toEqual({ inserted: 1, skipped: 1 });
  });
});
