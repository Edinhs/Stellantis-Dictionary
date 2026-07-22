// FIX (achado QA ALTA — RN-06/RN-10, doc 28): edição/exclusão DIRETA de
// coordinator/admin agora grava `content_revisions` + `audit_log`, igual ao
// caminho de aprovação de `contributions`. Ver dictionary.service.ts (mesmo
// padrão) e core/history + core/audit.

import type { Authz, AuthUser } from "../../core/authz";
import { ForbiddenError, NotFoundError } from "../../core/errors";
import type { Db } from "../../core/db";
import { recordAudit } from "../../core/audit";
import { recordRevision } from "../../core/history";
import type { ComponentsRepository } from "./components.repository";
import type { Component, ComponentInput } from "./components.types";
import type { TargetApplier } from "../contributions/contributions.types";

export interface ComponentsService {
  list(filters: { categoryId?: string; supplierId?: string }): Promise<Component[]>;
  getBySlug(slug: string): Promise<Component>;
  createDirect(actor: AuthUser, input: ComponentInput): Promise<Component>;
  updateDirect(actor: AuthUser, id: string, input: Partial<ComponentInput>): Promise<Component>;
  deleteDirect(actor: AuthUser, id: string): Promise<Component>;
  applier: TargetApplier;
}

export function createComponentsService(repo: ComponentsRepository, authz: Authz, db: Db): ComponentsService {
  const applier: TargetApplier = {
    async applyCreate(payload, actorId) {
      const component = await repo.create(payload as unknown as ComponentInput, actorId);
      return { id: component.id, snapshot: { ...component } };
    },
    async applyUpdate(targetId, payload) {
      const component = await repo.update(targetId, payload as Partial<ComponentInput>);
      return { snapshot: { ...component } };
    },
    async applyDelete(targetId) {
      const component = await repo.softDelete(targetId);
      return { snapshot: { ...component } };
    },
  };

  return {
    applier,
    list: (filters) => repo.list(filters),
    async getBySlug(slug) {
      const component = await repo.findBySlug(slug);
      if (!component) throw new NotFoundError("Componente não encontrado");
      return component;
    },
    async createDirect(actor, input) {
      if (!authz.can(actor, "component.edit")) throw new ForbiddenError();
      const component = await repo.create(input, actor.id);
      await recordRevision(db, {
        targetType: "component",
        targetId: component.id,
        snapshot: { ...component },
        changeSummary: "Criação direta (coordinator/admin)",
        editedBy: actor.id,
      });
      await recordAudit(db, {
        actorId: actor.id,
        action: "component.create",
        targetType: "component",
        targetId: component.id,
        after: { ...component },
      });
      return component;
    },
    async updateDirect(actor, id, input) {
      if (!authz.can(actor, "component.edit")) throw new ForbiddenError();
      const existing = await repo.findById(id);
      if (!existing) throw new NotFoundError("Componente não encontrado");
      const updated = await repo.update(id, input);
      await recordRevision(db, {
        targetType: "component",
        targetId: id,
        snapshot: { ...updated },
        changeSummary: "Edição direta (coordinator/admin)",
        editedBy: actor.id,
      });
      await recordAudit(db, {
        actorId: actor.id,
        action: "component.update",
        targetType: "component",
        targetId: id,
        before: { ...existing },
        after: { ...updated },
      });
      return updated;
    },
    async deleteDirect(actor, id) {
      if (!authz.can(actor, "component.delete")) throw new ForbiddenError();
      const existing = await repo.findById(id);
      if (!existing) throw new NotFoundError("Componente não encontrado");
      const deleted = await repo.softDelete(id);
      await recordRevision(db, {
        targetType: "component",
        targetId: id,
        snapshot: { ...deleted },
        changeSummary: "Exclusão direta (soft delete, coordinator/admin)",
        editedBy: actor.id,
      });
      await recordAudit(db, {
        actorId: actor.id,
        action: "component.delete",
        targetType: "component",
        targetId: id,
        before: { ...existing },
        after: { ...deleted },
      });
      return deleted;
    },
  };
}
