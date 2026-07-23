// dictionary.service — camada SERVIÇO: CRUD de `terms` + fonte única da
// verdade por `slug` (SPEC 02 §3.2/§4). Edição/criação DIRETA exige
// `dictionary.edit` (coordinator/admin, seed real); `user` só entra por
// `contributions.propose` (módulo contributions, não aqui). Também expõe um
// `TargetApplier` (contrato de contributions.types) para que a aprovação de
// uma proposta 'term' vire de fato uma linha em `terms`, sem contributions
// importar o interior deste módulo.
//
// FIX (achado QA ALTA — RN-06/RN-10, doc 28): edição/exclusão DIRETA de
// coordinator/admin também precisa gravar `content_revisions` (versionada)
// e `audit_log` (quem/quando), exatamente como o caminho de aprovação de
// `contributions`. Por isso o serviço agora recebe `db` e usa
// `core/history.recordRevision` + `core/audit.recordAudit`.

import type { Authz, AuthUser } from "../../core/authz";
import { ForbiddenError, NotFoundError, ValidationError } from "../../core/errors";
import type { Db } from "../../core/db";
import { recordAudit } from "../../core/audit";
import { recordRevision } from "../../core/history";
import type { DictionaryRepository } from "./dictionary.repository";
import type { Term, TermCategory, TermInput } from "./dictionary.types";
import type { TargetApplier } from "../contributions/contributions.types";

export interface DictionaryService {
  list(filters: { category?: TermCategory; search?: string }): Promise<Term[]>;
  getBySlug(slug: string): Promise<Term>;
  createDirect(actor: AuthUser, input: TermInput): Promise<Term>;
  updateDirect(actor: AuthUser, id: string, input: Partial<TermInput>): Promise<Term>;
  deleteDirect(actor: AuthUser, id: string, hard?: boolean): Promise<Term>;
  applier: TargetApplier;
}

function toPayload(term: Term): Record<string, unknown> {
  return { ...term };
}

export function createDictionaryService(repo: DictionaryRepository, authz: Authz, db: Db): DictionaryService {
  const applier: TargetApplier = {
    async applyCreate(payload, actorId) {
      const term = await repo.create(payload as unknown as TermInput, actorId);
      return { id: term.id, snapshot: toPayload(term) };
    },
    async applyUpdate(targetId, payload) {
      const term = await repo.update(targetId, payload as Partial<TermInput>);
      return { snapshot: toPayload(term) };
    },
    async applyDelete(targetId) {
      const term = await repo.softDelete(targetId);
      return { snapshot: toPayload(term) };
    },
  };

  return {
    applier,

    async list(filters) {
      return repo.list(filters);
    },

    async getBySlug(slug) {
      const term = await repo.findBySlug(slug);
      if (!term) throw new NotFoundError("Termo não encontrado");
      return term;
    },

    async createDirect(actor, input) {
      if (!authz.can(actor, "dictionary.edit")) {
        throw new ForbiddenError("Edição direta exige cargo coordinator/admin; use contributions.propose");
      }
      // Publicar exige categoria canônica (CHECK terms_published_requires_category,
      // migração 0008) — barra antes de tocar o banco.
      if (input.status === "published" && !input.category) {
        throw new ValidationError("Categoria é obrigatória para publicar o verbete");
      }
      const term = await repo.create(input, actor.id);
      await recordRevision(db, {
        targetType: "term",
        targetId: term.id,
        snapshot: toPayload(term),
        changeSummary: "Criação direta (coordinator/admin)",
        editedBy: actor.id,
      });
      await recordAudit(db, {
        actorId: actor.id,
        action: "dictionary.create",
        targetType: "term",
        targetId: term.id,
        after: toPayload(term),
      });
      return term;
    },

    async updateDirect(actor, id, input) {
      if (!authz.can(actor, "dictionary.edit")) {
        throw new ForbiddenError("Edição direta exige cargo coordinator/admin; use contributions.propose");
      }
      const existing = await repo.findById(id);
      if (!existing) throw new NotFoundError("Termo não encontrado");
      // Estado efetivo pós-merge: publicar (ou já publicado) exige categoria.
      const effectiveStatus = input.status ?? existing.status;
      const effectiveCategory = input.category !== undefined ? input.category : existing.category;
      if (effectiveStatus === "published" && !effectiveCategory) {
        throw new ValidationError("Categoria é obrigatória para publicar o verbete");
      }
      const updated = await repo.update(id, input);
      await recordRevision(db, {
        targetType: "term",
        targetId: id,
        snapshot: toPayload(updated),
        changeSummary: "Edição direta (coordinator/admin)",
        editedBy: actor.id,
      });
      await recordAudit(db, {
        actorId: actor.id,
        action: "dictionary.update",
        targetType: "term",
        targetId: id,
        before: toPayload(existing),
        after: toPayload(updated),
      });
      return updated;
    },

    async deleteDirect(actor, id, hard = false) {
      const existing = await repo.findById(id);
      if (!existing) throw new NotFoundError("Termo não encontrado");
      if (hard) {
        // Hard delete só admin (SPEC 09 §6.5) — permissão distinta.
        if (!authz.can(actor, "dictionary.delete.hard")) throw new ForbiddenError();
        throw new ValidationError("Hard delete físico não implementado nesta rodada (fora de escopo MVP)");
      }
      if (!authz.can(actor, "dictionary.delete")) throw new ForbiddenError();
      const deleted = await repo.softDelete(id);
      await recordRevision(db, {
        targetType: "term",
        targetId: id,
        snapshot: toPayload(deleted),
        changeSummary: "Exclusão direta (soft delete, coordinator/admin)",
        editedBy: actor.id,
      });
      await recordAudit(db, {
        actorId: actor.id,
        action: "dictionary.delete",
        targetType: "term",
        targetId: id,
        before: toPayload(existing),
        after: toPayload(deleted),
      });
      return deleted;
    },
  };
}
