import Database from "better-sqlite3";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

export function applyDrizzleMigrations(targetDb: Database.Database): void {
  const migrationsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "migrations");
  const migrationFiles = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql") && file !== "meta")
    .sort((left, right) => left.localeCompare(right));

  for (const fileName of migrationFiles) {
    const migrationPath = path.join(migrationsDir, fileName);
    const sql = readFileSync(migrationPath, "utf8");

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
