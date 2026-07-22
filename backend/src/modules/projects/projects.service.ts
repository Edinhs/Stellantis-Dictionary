// FIX (achado QA ALTA — RN-06/RN-10, doc 28): edição/exclusão DIRETA de
// coordinator/admin agora grava `content_revisions` + `audit_log`, igual ao
// caminho de aprovação de `contributions`. Ver dictionary.service.ts (mesmo
// padrão) e core/history + core/audit.

import type { Authz, AuthUser } from "../../core/authz";
import { ForbiddenError, NotFoundError } from "../../core/errors";
import type { Db } from "../../core/db";
import { recordAudit } from "../../core/audit";
import { recordRevision } from "../../core/history";
import type { ProjectsRepository } from "./projects.repository";
import type { Project, ProjectInput, ProjectStatus } from "./projects.types";
import type { TargetApplier } from "../contributions/contributions.types";

export interface ProjectsService {
  list(filters: { status?: ProjectStatus }): Promise<Project[]>;
  getBySlug(slug: string): Promise<Project>;
  createDirect(actor: AuthUser, input: ProjectInput): Promise<Project>;
  updateDirect(actor: AuthUser, id: string, input: Partial<ProjectInput>): Promise<Project>;
  deleteDirect(actor: AuthUser, id: string): Promise<Project>;
  applier: TargetApplier;
}

export function createProjectsService(repo: ProjectsRepository, authz: Authz, db: Db): ProjectsService {
  const applier: TargetApplier = {
    async applyCreate(payload, actorId) {
      const project = await repo.create(payload as unknown as ProjectInput, actorId);
      return { id: project.id, snapshot: { ...project } };
    },
    async applyUpdate(targetId, payload) {
      const project = await repo.update(targetId, payload as Partial<ProjectInput>);
      return { snapshot: { ...project } };
    },
    async applyDelete(targetId) {
      const project = await repo.softDelete(targetId);
      return { snapshot: { ...project } };
    },
  };

  return {
    applier,
    list: (filters) => repo.list(filters),
    async getBySlug(slug) {
      const project = await repo.findBySlug(slug);
      if (!project) throw new NotFoundError("Projeto não encontrado");
      return project;
    },
    async createDirect(actor, input) {
      if (!authz.can(actor, "project.edit")) throw new ForbiddenError();
      const project = await repo.create(input, actor.id);
      await recordRevision(db, {
        targetType: "project",
        targetId: project.id,
        snapshot: { ...project },
        changeSummary: "Criação direta (coordinator/admin)",
        editedBy: actor.id,
      });
      await recordAudit(db, {
        actorId: actor.id,
        action: "project.create",
        targetType: "project",
        targetId: project.id,
        after: { ...project },
      });
      return project;
    },
    async updateDirect(actor, id, input) {
      if (!authz.can(actor, "project.edit")) throw new ForbiddenError();
      const existing = await repo.findById(id);
      if (!existing) throw new NotFoundError("Projeto não encontrado");
      const updated = await repo.update(id, input);
      await recordRevision(db, {
        targetType: "project",
        targetId: id,
        snapshot: { ...updated },
        changeSummary: "Edição direta (coordinator/admin)",
        editedBy: actor.id,
      });
      await recordAudit(db, {
        actorId: actor.id,
        action: "project.update",
        targetType: "project",
        targetId: id,
        before: { ...existing },
        after: { ...updated },
      });
      return updated;
    },
    async deleteDirect(actor, id) {
      if (!authz.can(actor, "project.delete")) throw new ForbiddenError();
      const existing = await repo.findById(id);
      if (!existing) throw new NotFoundError("Projeto não encontrado");
      const deleted = await repo.softDelete(id);
      await recordRevision(db, {
        targetType: "project",
        targetId: id,
        snapshot: { ...deleted },
        changeSummary: "Exclusão direta (soft delete, coordinator/admin)",
        editedBy: actor.id,
      });
      await recordAudit(db, {
        actorId: actor.id,
        action: "project.delete",
        targetType: "project",
        targetId: id,
        before: { ...existing },
        after: { ...deleted },
      });
      return deleted;
    },
  };
}
