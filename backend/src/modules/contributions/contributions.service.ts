// contributions.service — camada SERVIÇO: fluxo propor-e-aprovar (SPEC 09
// §4/§6.2/§6.3). `user` propõe (nunca altera conteúdo público direto);
// `coordinator`/`admin` aprovam/rejeitam via permissão `<area>.approve`
// (`dictionary.approve`/`project.approve`/`component.approve`, seed real em
// seeds/role_permissions.json) e a aprovação aplica o payload ao
// módulo-alvo (`TargetApplier`), grava `content_revisions` (snapshot) e
// `audit_log` (quem/quando).

import type { Authz } from "../../core/authz";
import type { AuthUser } from "../../core/authz";
import { TARGET_TYPE_TO_AREA, type Permission } from "../../core/authz/permissions";
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from "../../core/errors";
import type { Db } from "../../core/db";
import { recordAudit } from "../../core/audit";
import type { ContributionsRepository } from "./contributions.repository";
import type { AppliersByTargetType, ContributionRow } from "./contributions.types";
import type { ContributionAction, TargetType } from "../../shared/contracts";

function approvePermission(targetType: TargetType): Permission {
  return `${TARGET_TYPE_TO_AREA[targetType]}.approve` as Permission;
}

function proposePermission(targetType: TargetType): Permission {
  return `${TARGET_TYPE_TO_AREA[targetType]}.propose` as Permission;
}

// Todos os target_types com fila de moderação nesta rodada (RN-21/D20).
const ALL_TARGET_TYPES = Object.keys(TARGET_TYPE_TO_AREA) as TargetType[];

export interface ProposeInput {
  targetType: TargetType;
  targetId: string | null; // null quando action='create'
  action: ContributionAction;
  payload: Record<string, unknown>;
}

export interface ContributionsService {
  propose(actor: AuthUser, input: ProposeInput): Promise<ContributionRow>;
  approve(actor: AuthUser, contributionId: string): Promise<ContributionRow>;
  reject(actor: AuthUser, contributionId: string, reviewNote: string): Promise<ContributionRow>;
  withdraw(actor: AuthUser, contributionId: string): Promise<ContributionRow>;
  listPending(actor: AuthUser, targetType?: TargetType): Promise<ContributionRow[]>;
}

export function createContributionsService(
  repo: ContributionsRepository,
  appliers: AppliersByTargetType,
  authz: Authz,
  db: Db
): ContributionsService {
  return {
    async propose(actor, input) {
      if (!authz.can(actor, proposePermission(input.targetType))) {
        throw new ForbiddenError();
      }
      if (input.action !== "create" && !input.targetId) {
        throw new ValidationError("targetId é obrigatório para update/delete");
      }
      const contribution = await repo.create({
        authorId: actor.id,
        targetType: input.targetType,
        targetId: input.targetId,
        action: input.action,
        payload: input.payload,
      });
      await recordAudit(db, {
        actorId: actor.id,
        action: "contribution.propose",
        targetType: input.targetType,
        targetId: contribution.id,
        after: { status: "pending", action: input.action },
      });
      return contribution;
    },

    async listPending(actor, targetType) {
      // FIX (achado QA ALTA): `targetType` era opcional e, quando OMITIDO,
      // nenhuma permissão era checada — qualquer autenticado (inclusive
      // 'user' sem nenhum `*.approve`) via a fila de moderação inteira de
      // todos os autores/tipos. Correção (RN-05, doc 28 — fila visível "ao
      // autor e aos revisores"): com `targetType`, exige a permissão daquela
      // área; sem `targetType` ("ver tudo"), só quem pode revisar TODAS as
      // áreas (hoje: coordinator/admin) enxerga a fila completa — ninguém
      // sem nenhuma permissão de aprovação passa por aqui.
      if (targetType) {
        if (!authz.can(actor, approvePermission(targetType))) throw new ForbiddenError();
        return repo.listPending(targetType);
      }
      const canReviewEverything = ALL_TARGET_TYPES.every((t) => authz.can(actor, approvePermission(t)));
      if (!canReviewEverything) throw new ForbiddenError();
      return repo.listPending(targetType);
    },

    async approve(actor, contributionId) {
      const contribution = await repo.findById(contributionId);
      if (!contribution) throw new NotFoundError("Contribuição não encontrada");
      if (!authz.can(actor, approvePermission(contribution.targetType))) throw new ForbiddenError();
      if (contribution.status !== "pending") {
        throw new ConflictError(`Contribuição já está em status '${contribution.status}'`);
      }

      const applier = appliers[contribution.targetType];
      if (!applier) {
        throw new ValidationError(`Nenhum applier registrado para target_type '${contribution.targetType}'`);
      }

      let targetId = contribution.targetId;
      let snapshot: Record<string, unknown>;

      if (contribution.action === "create") {
        const result = await applier.applyCreate(contribution.payload, actor.id);
        targetId = result.id;
        snapshot = result.snapshot;
      } else if (contribution.action === "update") {
        const result = await applier.applyUpdate(contribution.targetId as string, contribution.payload, actor.id);
        snapshot = result.snapshot;
      } else {
        const result = await applier.applyDelete(contribution.targetId as string, actor.id);
        snapshot = result.snapshot;
      }

      const revisionNumber = await repo.nextRevisionNumber(contribution.targetType, targetId as string);
      await repo.insertRevision({
        targetType: contribution.targetType,
        targetId: targetId as string,
        revisionNumber,
        snapshot,
        changeSummary: `Contribuição ${contribution.action} aprovada`,
        editedBy: actor.id,
        contributionId: contribution.id,
      });

      const updated = await repo.markReviewed(contributionId, {
        status: "approved",
        reviewNote: null,
        reviewedBy: actor.id,
      });

      await recordAudit(db, {
        actorId: actor.id,
        action: "contribution.approve",
        targetType: contribution.targetType,
        targetId: targetId as string,
        before: { status: "pending" },
        after: { status: "approved" },
      });

      return updated;
    },

    async reject(actor, contributionId, reviewNote) {
      if (!reviewNote || !reviewNote.trim()) {
        throw new ValidationError("review_note é obrigatório ao rejeitar (SPEC 09 §4)");
      }
      const contribution = await repo.findById(contributionId);
      if (!contribution) throw new NotFoundError("Contribuição não encontrada");
      if (!authz.can(actor, approvePermission(contribution.targetType))) throw new ForbiddenError();
      if (contribution.status !== "pending") {
        throw new ConflictError(`Contribuição já está em status '${contribution.status}'`);
      }

      const updated = await repo.markReviewed(contributionId, {
        status: "rejected",
        reviewNote,
        reviewedBy: actor.id,
      });

      await recordAudit(db, {
        actorId: actor.id,
        action: "contribution.reject",
        targetType: contribution.targetType,
        targetId: contribution.id,
        before: { status: "pending" },
        after: { status: "rejected", reviewNote },
      });

      return updated;
    },

    async withdraw(actor, contributionId) {
      const contribution = await repo.findById(contributionId);
      if (!contribution) throw new NotFoundError("Contribuição não encontrada");
      if (contribution.authorId !== actor.id) {
        throw new ForbiddenError("Só o autor pode retirar a própria contribuição");
      }
      if (contribution.status !== "pending") {
        throw new ConflictError(`Contribuição já está em status '${contribution.status}'`);
      }
      return repo.markReviewed(contributionId, {
        status: "withdrawn",
        reviewNote: null,
        reviewedBy: actor.id,
      });
    },
  };
}
