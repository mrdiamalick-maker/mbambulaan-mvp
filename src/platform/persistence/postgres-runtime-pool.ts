import { Pool } from "pg";
import type { SqlExecutor } from "./postgres-platform-adapters";

declare global {
  var __mbambulaanPostgresPool: Pool | undefined;
}

export function hasRuntimeDatabase() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getRuntimeSqlExecutor(): SqlExecutor {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) throw new Error("DATABASE_URL est obligatoire pour la persistance PostgreSQL.");
  globalThis.__mbambulaanPostgresPool ??= new Pool({
    connectionString: databaseUrl,
    max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    min: Number(process.env.DATABASE_POOL_MIN ?? 0),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
  return {
    async query<TRow = Record<string, unknown>>(sql: string, parameters?: unknown[]) {
      const result = await globalThis.__mbambulaanPostgresPool!.query(sql, parameters);
      return { rows: result.rows as TRow[], rowCount: result.rowCount ?? 0 };
    },
  };
}
