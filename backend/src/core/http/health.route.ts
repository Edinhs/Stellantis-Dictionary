// core/http/health.route — implementação real do contrato fixado em
// health.route.placeholder.ts (removido nesta entrega, T07/T08 concluídas).
// GET /api/health — público, sem auth. 200 { status: 'ok' } se app + banco
// ok; 503 { status: 'degraded' } se o banco estiver inacessível. Nunca vaza
// versão/stack (skill backend-api).

import { Router } from "express";
import type { Db } from "../db";

export function healthRoute(db: Db): Router {
  const router = Router();
  router.get("/health", async (_req, res) => {
    const dbOk = await db.ping();
    res.status(dbOk ? 200 : 503).json({ status: dbOk ? "ok" : "degraded" });
  });
  return router;
}
