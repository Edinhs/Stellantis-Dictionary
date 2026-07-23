// scripts/import-siglas — CARGA OPERACIONAL idempotente da 1a leva de conteudo
// REAL do dicionario (sigla + significado em ingles, CEO 2026-07-23). Le o
// artefato `data/siglas-lista-geral-2.json` (gerado por
// scripts/build-siglas-dataset.py a partir do Excel) e insere em `terms`.
//
// NAO e um loader de `seeds/*.json` (exemplos ficticios). Segue a regra de
// ambiente do CEO (seeds/README.md, D6): a carga so roda com AFIRMACAO
// EXPLICITA — DENY-BY-DEFAULT. Rodar quando nodeEnv ∈ {development, test}; para
// qualquer outro ambiente (production, staging, NODE_ENV com typo, etc.) o
// import ABORTA, a menos que haja opt-in explicito (--confirm ou
// ALLOW_REAL_IMPORT=1). Dados reais entram no ambiente de producao/piloto por
// processo controlado, nao por este script de dev/staging.
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
import type { Db } from "../core/db";
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

// Ambientes onde a carga roda sem opt-in. Fora daqui, so com afirmacao explicita.
const IMPLICITLY_ALLOWED: ReadonlySet<string> = new Set(["development", "test"]);

export interface GuardOpts {
  nodeEnv: string;
  /** opt-in explicito por flag de CLI (--confirm). */
  confirmFlag?: boolean;
  /** opt-in explicito por env (ALLOW_REAL_IMPORT=1). */
  allowEnv?: string | undefined;
}

/**
 * DENY-BY-DEFAULT: so autoriza a carga quando o ambiente e reconhecidamente de
 * dev/test, OU quando ha opt-in explicito. Qualquer outro caso (production,
 * staging, NODE_ENV com typo/desconhecido, ausente e sem opt-in) e recusado.
 * Lanca Error com mensagem clara — o chamador transforma em exit 1.
 */
export function assertImportAllowed(opts: GuardOpts): void {
  const optIn = opts.confirmFlag === true || opts.allowEnv === "1";
  if (IMPLICITLY_ALLOWED.has(opts.nodeEnv) || optIn) return;
  throw new Error(
    `import-siglas: recusado (deny-by-default). nodeEnv=${JSON.stringify(opts.nodeEnv)} ` +
      "nao esta em {development, test} e nao houve opt-in explicito. Carga de dados " +
      "reais e processo operacional controlado. Para forcar conscientemente, use " +
      "`--confirm` ou ALLOW_REAL_IMPORT=1."
  );
}

/** Invariante do lote: um 'published' sem categoria violaria o CHECK
 * terms_published_requires_category (migracao 0008) — falha cedo. */
export function assertNoPublishedWithoutCategory(terms: SiglaTerm[]): void {
  const invalid = terms.filter((t) => t.status === "published" && !t.category);
  if (invalid.length) {
    throw new Error(
      `import-siglas: ${invalid.length} termo(s) 'published' sem categoria — o CHECK do banco recusaria. Corrija o artefato.`
    );
  }
}

/** Insere idempotente (ON CONFLICT (slug) DO NOTHING) e grava UMA entrada-resumo
 * em audit_log. Reutilizavel/testavel com um `db` injetado. */
export async function runImport(dataset: Dataset, db: Db): Promise<{ inserted: number; skipped: number }> {
  const terms = dataset.terms ?? [];
  let inserted = 0;
  let skipped = 0;
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

  return { inserted, skipped };
}

async function main() {
  const dryRun = process.argv.includes("--dry");
  const confirmFlag = process.argv.includes("--confirm");
  const config = loadConfig();

  // GUARD D6 (deny-by-default): so roda com afirmacao explicita de ambiente.
  assertImportAllowed({
    nodeEnv: config.nodeEnv,
    confirmFlag,
    allowEnv: process.env.ALLOW_REAL_IMPORT,
  });

  const dataset = JSON.parse(readFileSync(DATA_PATH, "utf-8")) as Dataset;
  const terms = dataset.terms ?? [];
  assertNoPublishedWithoutCategory(terms);

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
  try {
    const { inserted, skipped } = await runImport(dataset, db);
    // eslint-disable-next-line no-console
    console.log(`import-siglas: inseridos=${inserted} ja-existentes(pulados)=${skipped}`);
  } finally {
    await db.close();
  }
}

// So executa quando rodado diretamente (npm run import:siglas), nunca quando o
// modulo e importado por um teste (que exercita as funcoes exportadas acima).
if (require.main === module) {
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(`import-siglas: falha — ${String(err)}`);
    process.exit(1);
  });
}
