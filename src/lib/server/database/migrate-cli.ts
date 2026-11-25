import Database from "better-sqlite3";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { applyDrizzleMigrations, resolveMigrationsDir } from "./migrate";

export interface MigrationCliResult {
  exitCode: number;
  messages: string[];
}

/**
 * Standalone migration phase, compiled to `build/migrate.js` and executed by
 * the container entrypoint before the server starts. Never seeds.
 */
export function runMigrationCli(
  env: Record<string, string | undefined> = process.env,
): MigrationCliResult {
  const messages: string[] = [];
  const databasePath = env.DATABASE_PATH?.trim();

  if (!databasePath) {
    messages.push(
      "[migrate] DATABASE_PATH is required: set it to the absolute path of the SQLite file",
    );
    return { exitCode: 1, messages };
  }

  const migrationsDir = resolveMigrationsDir(env.MIGRATIONS_DIR);
  messages.push(`[migrate] database: ${databasePath}`);
  messages.push(`[migrate] migrations: ${migrationsDir}`);

  let targetDb: Database.Database | undefined;
  try {
    targetDb = new Database(databasePath);
    targetDb.pragma("foreign_keys = ON");
    targetDb.pragma("journal_mode = WAL");

    const result = applyDrizzleMigrations(targetDb, { migrationsDir });

    if (result.baselined.length > 0) {
      messages.push(
        `[migrate] baselined ${result.baselined.length} existing migration(s) on a legacy database: ${result.baselined.join(", ")}`,
      );
    }
    if (result.applied.length > 0) {
      messages.push(
        `[migrate] applied ${result.applied.length} migration(s): ${result.applied.join(", ")}`,
      );
    }
    if (result.applied.length === 0 && result.baselined.length === 0) {
      messages.push("[migrate] no pending migrations");
    }

    return { exitCode: 0, messages };
  } catch (error) {
    messages.push(`[migrate] failed: ${error instanceof Error ? error.message : String(error)}`);
    return { exitCode: 1, messages };
  } finally {
    targetDb?.close();
  }
}

function isExecutedDirectly(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return import.meta.url === pathToFileURL(path.resolve(entry)).href;
  } catch {
    return false;
  }
}

if (isExecutedDirectly()) {
  const { exitCode, messages } = runMigrationCli();
  const write = exitCode === 0 ? console.log : console.error;
  for (const message of messages) write(message);
  process.exit(exitCode);
}
