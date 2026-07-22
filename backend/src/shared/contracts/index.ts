// shared/contracts — tipos e DTOs comuns, SEM lógica de infra (doc 13 §4.2).
// `target_type` polimórfico (RN-21, SPEC 09 §8): MVP (D20) usa apenas
// 'term' | 'project' | 'component'.

export type TargetType = "term" | "project" | "component";

export type ContributionAction = "create" | "update" | "delete";
export type ContributionStatus = "pending" | "approved" | "rejected" | "withdrawn";

export interface Contribution {
  id: string;
  authorId: string;
  targetType: TargetType;
  targetId: string | null;
  action: ContributionAction;
  payload: Record<string, unknown>;
  status: ContributionStatus;
  reviewNote: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContentRevision {
  id: string;
  targetType: TargetType;
  targetId: string;
  revisionNumber: number;
  snapshot: Record<string, unknown>;
  changeSummary: string | null;
  editedBy: string;
  contributionId: string | null;
  createdAt: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
