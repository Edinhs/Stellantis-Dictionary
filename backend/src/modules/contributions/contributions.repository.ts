import type { Db } from "../../core/db";
import type { ContributionRow } from "./contributions.types";
import type { TargetType } from "../../shared/contracts";

interface ContributionRowDb {
  id: string;
  author_id: string;
  target_type: TargetType;
  target_id: string | null;
  action: ContributionRow["action"];
  payload: Record<string, unknown>;
  status: ContributionRow["status"];
  review_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: ContributionRowDb): ContributionRow {
  return {
    id: row.id,
    authorId: row.author_id,
    targetType: row.target_type,
    targetId: row.target_id,
    action: row.action,
    payload: row.payload,
    status: row.status,
    reviewNote: row.review_note,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface ContributionsRepository {
  create(input: {
    authorId: string;
    targetType: TargetType;
    targetId: string | null;
    action: ContributionRow["action"];
    payload: Record<string, unknown>;
  }): Promise<ContributionRow>;
  findById(id: string): Promise<ContributionRow | null>;
  listPending(targetType?: TargetType): Promise<ContributionRow[]>;
  markReviewed(
    id: string,
    input: { status: "approved" | "rejected" | "withdrawn"; reviewNote: string | null; reviewedBy: string | null }
  ): Promise<ContributionRow>;
  nextRevisionNumber(targetType: TargetType, targetId: string): Promise<number>;
  insertRevision(input: {
    targetType: TargetType;
    targetId: string;
    revisionNumber: number;
    snapshot: Record<string, unknown>;
    changeSummary: string | null;
    editedBy: string;
    contributionId: string | null;
  }): Promise<void>;
}

export function createContributionsRepository(db: Db): ContributionsRepository {
  return {
    async create(input) {
      const result = await db.query<ContributionRowDb>(
        `INSERT INTO contributions (author_id, target_type, target_id, action, payload)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [input.authorId, input.targetType, input.targetId, input.action, JSON.stringify(input.payload)]
      );
      return fromRow(result.rows[0]);
    },
    async findById(id) {
      const result = await db.query<ContributionRowDb>("SELECT * FROM contributions WHERE id = $1", [id]);
      return result.rows[0] ? fromRow(result.rows[0]) : null;
    },
    async listPending(targetType) {
      const result = targetType
        ? await db.query<ContributionRowDb>(
            "SELECT * FROM contributions WHERE status = 'pending' AND target_type = $1 ORDER BY created_at",
            [targetType]
          )
        : await db.query<ContributionRowDb>(
            "SELECT * FROM contributions WHERE status = 'pending' ORDER BY created_at"
          );
      return result.rows.map(fromRow);
    },
    async markReviewed(id, input) {
      const result = await db.query<ContributionRowDb>(
        `UPDATE contributions
         SET status = $2, review_note = $3, reviewed_by = $4, reviewed_at = now(), updated_at = now()
         WHERE id = $1
         RETURNING *`,
        [id, input.status, input.reviewNote, input.reviewedBy]
      );
      return fromRow(result.rows[0]);
    },
    async nextRevisionNumber(targetType, targetId) {
      const result = await db.query<{ max: number | null }>(
        "SELECT MAX(revision_number) AS max FROM content_revisions WHERE target_type = $1 AND target_id = $2",
        [targetType, targetId]
      );
      return (result.rows[0]?.max ?? 0) + 1;
    },
    async insertRevision(input) {
      await db.query(
        `INSERT INTO content_revisions
           (target_type, target_id, revision_number, snapshot, change_summary, edited_by, contribution_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          input.targetType,
          input.targetId,
          input.revisionNumber,
          JSON.stringify(input.snapshot),
          input.changeSummary,
          input.editedBy,
          input.contributionId,
        ]
      );
    },
  };
}
