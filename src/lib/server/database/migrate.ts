import Database from "better-sqlite3";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

export function applyDrizzleMigrations(targetDb: Database.Database): void {
  const migrationsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "migrations");
  const entries = readdirSync(migrationsDir, { withFileTypes: true });
  const sqlFiles: string[] = [];

  // New drizzle-kit format: one folder per migration containing migration.sql.
  const folders = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
  for (const folder of folders) {
    sqlFiles.push(path.join(migrationsDir, folder, "migration.sql"));
  }

  // Legacy flat format: *.sql files directly under migrations/.
  const flatFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
  for (const file of flatFiles) {
    sqlFiles.push(path.join(migrationsDir, file));
  }

  for (const sqlFile of sqlFiles) {
    const sql = readFileSync(sqlFile, "utf8");

    try {
      targetDb.exec(sql);
    } catch (error) {
      if (error instanceof Error && /already exists|duplicate|index|table/i.test(error.message)) {
        continue;
      }
      throw error;
    }
  }
}