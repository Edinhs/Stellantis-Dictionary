import type { TargetType, ContributionAction, ContributionStatus } from "../../shared/contracts";

export interface ContributionRow {
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

/**
 * Contrato que cada módulo de conteúdo (`dictionary`, `components`,
 * `projects`, futuramente `workflows`/`directory`) expõe no seu `index.ts`
 * público para que `contributions` possa APLICAR uma proposta aprovada, sem
 * importar o interior desses módulos (doc 13 §7 regra 1). `target_type`
 * polimórfico (RN-21): um único fluxo de aprovação serve qualquer área nova
 * só registrando um applier a mais, sem nova tabela de histórico.
 */
export interface TargetApplier {
  applyCreate(payload: Record<string, unknown>, actorId: string): Promise<{ id: string; snapshot: Record<string, unknown> }>;
  applyUpdate(targetId: string, payload: Record<string, unknown>, actorId: string): Promise<{ snapshot: Record<string, unknown> }>;
  applyDelete(targetId: string, actorId: string): Promise<{ snapshot: Record<string, unknown> }>;
}

export type AppliersByTargetType = Partial<Record<TargetType, TargetApplier>>;
