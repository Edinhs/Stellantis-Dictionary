// core/audit — gravação de `audit_log` (append-only). Quem fez o quê, quando
// (SPEC 09 §6.4, doc 13 §6.1). Transversal: qualquer módulo chama
// `recordAudit`, nenhum reimplementa INSERT direto na tabela.
//
// F2 (hardening pedido pela Segurança na Etapa 9/11): a aplicação NUNCA deve
// ter UPDATE/DELETE em `audit_log` — só INSERT. Este módulo só expõe
// `recordAudit` (INSERT); não há `updateAudit`/`deleteAudit` por desenho, e a
// função abaixo documenta o GRANT/REVOKE que o usuário de banco da aplicação
// precisa ter em produção. A CRIAÇÃO do role de banco restrito fica com o
// DevOps Lead (depende do usuário/role real do ambiente-alvo, D6, ainda em
// aberto) — ver `db/hardening/audit-log-grants.sql` (script de referência,
// não aplicado automaticamente por esta migração/app).

import type { Db } from "../db";

export interface AuditEntry {
  actorId: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  before?: unknown;
  after?: unknown;
  ip?: string | null;
  metadata?: Record<string, unknown>;
}

export async function recordAudit(db: Db, entry: AuditEntry): Promise<void> {
  await db.query(
    `INSERT INTO audit_log (actor_id, action, target_type, target_id, before, after, ip, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      entry.actorId,
      entry.action,
      entry.targetType ?? null,
      entry.targetId ?? null,
      entry.before ? JSON.stringify(entry.before) : null,
      entry.after ? JSON.stringify(entry.after) : null,
      entry.ip ?? null,
      JSON.stringify(entry.metadata ?? {}),
    ]
  );
}
