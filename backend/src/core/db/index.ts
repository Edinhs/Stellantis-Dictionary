// core/db — pool Postgres + helper de transação. Única camada que abre
// conexão; repositórios de módulos consomem `Db`, nunca `pg` direto.
// Ref.: docs/13-arquitetura-modular.md §4.1.

import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";
import type { AppConfig } from "../config";

export interface Db {
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[]
  ): Promise<QueryResult<T>>;
  withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T>;
  ping(): Promise<boolean>;
  close(): Promise<void>;
}

export function createDb(config: AppConfig): Db {
  const pool = new Pool({ connectionString: config.databaseUrl });

  return {
    query(text, params) {
      return pool.query(text, params as unknown[]);
    },
    async withTransaction(fn) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await fn(client);
        await client.query("COMMIT");
        return result;
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    },
    async ping() {
      try {
        await pool.query("SELECT 1");
        return true;
      } catch {
        return false;
      }
    },
    async close() {
      await pool.end();
    },
  };
}
