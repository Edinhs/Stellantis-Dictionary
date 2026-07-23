// scripts/import-siglas — CARGA OPERACIONAL idempotente da 1a leva de conteudo
// REAL do dicionario (sigla + significado em ingles, CEO 2026-07-23). Le o
// artefato `data/siglas-lista-geral-2.json` (gerado por
// scripts/build-siglas-dataset.py a partir do Excel) e insere em `terms`.
//
// NAO e um loader de `seeds/*.json` (exemplos ficticios). Segue a regra de
// ambiente do CEO (seeds/README.md, D6): RECUSA rodar em NODE_ENV=production —
// dados reais entram no ambiente de producao/piloto por processo controlado,
// nao por este script de dev/staging.
//
// Idempotencia: ON CONFLICT (slug) DO NOTHING. Rodar de novo NUNCA sobrescreve
// o que ja existe — em especial NUNCA apaga a traducao PT / categoria que o CEO
// preencheu manualmente editando os cards. So insere slugs ainda ausentes.
//
// Auditoria: grava UMA entrada-resumo em audit_log (action='dictionary.import')
// com a contagem e o lote de origem. Nao grava content_revisions por linha (a
// carga em massa nao tem um usuario-ator real e edited_by e NOT NULL); o
// historico versionado de cada verbete comeca quando o CEO edita o card.
//
// Uso:  npm run import:siglas            (usa DATABASE_URL do .env)
//       npm run import:siglas -- --dry   (so relata, nao escreve)

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadConfig } from "../core/config";
import { createDb } from "../core/db";
import { recordAudit } from "../core/audit";

interface SiglaTerm {
  slug: string;
  term: string;
  definition: string;
  category: string | null;
  synonyms: string[];
  source_type: "manual" | "document";
  status: "draft" | "published";
  metadata: Record<string, unknown>;
}

interface Dataset {
  source_batch: string;
  source_file: string;
  imported: number;
  terms: SiglaTerm[];
}

const DATA_PATH = resolve(__dirname, "../../../data/siglas-lista-geral-2.json");

async function main() {
  const dryRun = process.argv.includes("--dry");
  const config = loadConfig();

  // GUARD D6: nunca carga automatica de dados em producao (seeds/README.md).
  if (config.nodeEnv === "production") {
    throw new Error(
      "import-siglas: recusado em NODE_ENV=production. Carga de dados reais no " +
        "ambiente de producao/piloto e processo operacional controlado, nao este script."
    );
  }

  const dataset = JSON.parse(readFileSync(DATA_PATH, "utf-8")) as Dataset;
  const terms = dataset.terms ?? [];
  // Invariante do lote: rascunho sem categoria (o CEO classifica depois). Um
  // 'published' sem categoria violaria o CHECK terms_published_requires_category
  // (migracao 0008) — falha cedo, com mensagem clara.
  const invalid = terms.filter((t) => t.status === "published" && !t.category);
  if (invalid.length) {
    throw new Error(
      `import-siglas: ${invalid.length} termo(s) 'published' sem categoria — o CHECK do banco recusaria. Corrija o artefato.`
    );
  }

  // eslint-disable-next-line no-console
  console.log(
    `import-siglas: lote='${dataset.source_batch}' arquivo='${dataset.source_file}' ` +
      `termos=${terms.length} nodeEnv=${config.nodeEnv}${dryRun ? " (DRY-RUN)" : ""}`
  );

  if (dryRun) {
    // eslint-disable-next-line no-console
    console.log("import-siglas: dry-run, nada escrito.");
    return;
  }

  const db = createDb(config);
  let inserted = 0;
  let skipped = 0;
  try {
    for (const t of terms) {
      const result = await db.query<{ id: string }>(
        `INSERT INTO terms (slug, term, definition, category, synonyms, source_type, status, created_by, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, $8)
         ON CONFLICT (slug) DO NOTHING
         RETURNING id`,
        [
          t.slug,
          t.term,
          t.definition,
          t.category, // NULL -> rascunho a classificar (migracao 0008)
          t.synonyms ?? [],
          t.source_type ?? "manual",
          t.status ?? "draft",
          JSON.stringify(t.metadata ?? {}),
        ]
      );
      if (result.rowCount && result.rowCount > 0) inserted += 1;
      else skipped += 1;
    }

    // Trilha de auditoria da carga operacional (RN-10).
    await recordAudit(db, {
      actorId: null,
      action: "dictionary.import",
      targetType: "term",
      metadata: {
        source_batch: dataset.source_batch,
        source_file: dataset.source_file,
        total: terms.length,
        inserted,
        skipped,
      },
    });

    // eslint-disable-next-line no-console
    console.log(`import-siglas: inseridos=${inserted} ja-existentes(pulados)=${skipped}`);
  } finally {
    await db.close();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(`import-siglas: falha — ${String(err)}`);
  process.exit(1);
});
