// users.service — camada SERVIÇO. `assignRole` implementa RN-04
// (anti-escalonamento, SPEC 09 §3) — pendência F1 apontada pela Segurança no
// fechamento da Etapa 9/11: a trava NÃO pode viver só em `role_permissions`
// (que só resolve "o cargo X tem a permissão role.assign", não "para qual
// cargo alvo"); por isso a regra contextual mora aqui, na camada de serviço,
// e é coberta por teste (users.service.test.ts).
//
// RN-04 (doc 28 §RN-04):
//   (a) `coordinator` NUNCA promove ninguém a `admin` nem edita um `admin`.
//   (b) NINGUÉM altera o próprio cargo (nem admin).
//   (c) Toda mudança de cargo grava `audit_log` (actor, before, after).
// Guardrail (S4, doc 25 §4): esta função nunca lê XP/nível/gamificação —
// `can()` e as travas acima resolvem 100% da decisão de cargo.

import type { Authz, AuthUser, Role } from "../../core/authz";
import { ForbiddenError, NotFoundError, ValidationError } from "../../core/errors";
import type { Db } from "../../core/db";
import { recordAudit } from "../../core/audit";
import type { UsersRepository } from "./users.repository";
import type { UserProfile } from "./users.types";

const ASSIGNABLE_ROLES: readonly Role[] = ["user", "coordinator", "admin"];

export interface UsersService {
  getProfile(id: string): Promise<UserProfile>;
  assignRole(actor: AuthUser, targetUserId: string, newRole: Role): Promise<UserProfile>;
}

export function createUsersService(repo: UsersRepository, authz: Authz, db: Db): UsersService {
  return {
    async getProfile(id) {
      const profile = await repo.findById(id);
      if (!profile) throw new NotFoundError("Usuário não encontrado");
      return profile;
    },

    async assignRole(actor, targetUserId, newRole) {
      if (!ASSIGNABLE_ROLES.includes(newRole)) {
        throw new ValidationError(`Cargo inválido: '${newRole}'`);
      }

      // Permissão nomeada (nunca `if role === 'admin'`): quem NÃO tem
      // `role.assign` (ou seja, `user`) nem chega às travas contextuais.
      if (!authz.can(actor, "role.assign")) {
        throw new ForbiddenError("Sem permissão para atribuir cargos");
      }

      // RN-04 (b): ninguém altera o próprio cargo — vale para admin também.
      if (actor.id === targetUserId) {
        throw new ForbiddenError("Não é permitido alterar o próprio cargo");
      }

      const target = await repo.findById(targetUserId);
      if (!target) throw new NotFoundError("Usuário-alvo não encontrado");

      // RN-04 (a): coordinator só transita user <-> coordinator; nunca cria
      // nem edita um admin. Travas duras, independentes de `can()`.
      if (actor.role === "coordinator") {
        if (target.role === "admin") {
          throw new ForbiddenError("coordinator não pode alterar o cargo de um admin");
        }
        if (newRole === "admin") {
          throw new ForbiddenError("coordinator não pode promover ninguém a admin");
        }
      }

      const before = target.role;
      const updated = await repo.updateRole(targetUserId, newRole);

      // RN-04 (c): toda mudança de cargo grava audit_log.
      await recordAudit(db, {
        actorId: actor.id,
        action: "role.assign",
        targetType: "user",
        targetId: targetUserId,
        before: { role: before },
        after: { role: newRole },
      });

      return updated;
    },
  };
}
