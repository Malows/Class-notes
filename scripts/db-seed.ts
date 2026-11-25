/**
 * Explicit demo-data opt-in: `pnpm db:seed`.
 *
 * Applies pending migrations first, then inserts the demo fixtures (idempotent:
 * `insertSeed` upserts by id). Never called by the production entrypoint.
 */
import Database from "better-sqlite3";

import { resolveDatabasePath } from "../src/lib/server/database/config";
import { applyDrizzleMigrations, resolveMigrationsDir } from "../src/lib/server/database/migrate";
import { insertSeed } from "../src/lib/server/database/seed";

const databasePath = resolveDatabasePath({ env: process.env });
const migrationsDir = resolveMigrationsDir();

if (process.env.NODE_ENV === "production") {
  console.warn(
    "[seed] NODE_ENV=production: you asked for demo data explicitly, so it will be inserted.",
  );
}

const targetDb = new Database(databasePath);

try {
  if (databasePath !== ":memory:") targetDb.pragma("journal_mode = WAL");
  targetDb.pragma("foreign_keys = ON");

  const migrations = applyDrizzleMigrations(targetDb, { migrationsDir });
  console.log(
    `[seed] migrations: ${migrations.applied.length} applied, ${migrations.baselined.length} baselined`,
  );

  insertSeed(targetDb);

  const count = (table: string) =>
    (targetDb.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as { count: number }).count;

  console.log(`[seed] database: ${databasePath}`);
  console.log(
    `[seed] faculties=${count("faculties")} persons=${count("persons")} enrollments=${count("enrollments")} assignments=${count("assignments")} deliveries=${count("deliveries")}`,
  );
} finally {
  targetDb.close();
}
