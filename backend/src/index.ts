// index.ts — bootstrap: carrega config, abre o pool de banco, carrega o
// índice de permissões (`role_permissions`) e sobe o servidor HTTP.

import { loadConfig } from "./core/config";
import { createDb } from "./core/db";
import { loadPermissionsIndex } from "./core/authz";
import { createApp } from "./app";
import { logger } from "./core/logging";

async function main() {
  const config = loadConfig(); // fail-fast se faltar env obrigatória
  const db = createDb(config);
  const permissionsIndex = await loadPermissionsIndex(db);
  const app = createApp(db, config, permissionsIndex);

  const server = app.listen(config.port, () => {
    logger.info("Servidor iniciado", { port: config.port, nodeEnv: config.nodeEnv });
  });

  const shutdown = async (signal: string) => {
    logger.info("Encerrando servidor", { signal });
    server.close(async () => {
      await db.close();
      process.exit(0);
    });
  };
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(JSON.stringify({ level: "error", message: "Falha fatal no bootstrap", error: String(err) }));
  process.exit(1);
});
