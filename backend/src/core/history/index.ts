// core/history — grava `content_revisions` (snapshot completo, rollback).
// TRANSVERSAL: usado tanto pela aprovação de `contributions` quanto pela
// edição/exclusão DIRETA de coordinator/admin (RN-06/RN-10, doc 28) — antes
// desta correção (achado QA ALTA), o caminho direto de `dictionary`/
// `components`/`projects` não gravava revisão nenhuma. Fica em `core` (não
// em `contributions`) porque não é exclusivo do fluxo de aprovação.

import type { Db } from "../db";
import type { TargetType } from "../../shared/contracts";

export interface RecordRevisionInput {
  targetType: TargetType;
  targetId: string;
  snapshot: Record<string, unknown>;
  changeSummary: string | null;
  editedBy: string;
  contributionId?: string | null;
}

export async function nextRevisionNumber(db: Db, targetType: TargetType, targetId: string): Promise<number> {
  const result = await db.query<{ max: number | null }>(
    "SELECT MAX(revision_number) AS max FROM content_revisions WHERE target_type = $1 AND target_id = $2",
    [targetType, targetId]
  );
  return (result.rows[0]?.max ?? 0) + 1;
}

export async function recordRevision(db: Db, input: RecordRevisionInput): Promise<void> {
  const revisionNumber = await nextRevisionNumber(db, input.targetType, input.targetId);
  await db.query(
    `INSERT INTO content_revisions
       (target_type, target_id, revision_number, snapshot, change_summary, edited_by, contribution_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      input.targetType,
      input.targetId,
      revisionNumber,
      JSON.stringify(input.snapshot),
      input.changeSummary,
      input.editedBy,
      input.contributionId ?? null,
    ]
  );
}
