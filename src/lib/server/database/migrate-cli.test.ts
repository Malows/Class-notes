import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { runMigrationCli } from "./migrate-cli";

const temporaryDirs: string[] = [];

function makeTempDir(): string {
  const directory = mkdtempSync(path.join(tmpdir(), "class-notes-migrate-cli-"));
  temporaryDirs.push(directory);
  return directory;
}

afterEach(() => {
  for (const directory of temporaryDirs.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("migration phase", () => {
  it("exits non-zero naming the variable when DATABASE_PATH is missing", () => {
    const result = runMigrationCli({});

    expect(result.exitCode).toBe(1);
    expect(result.messages.join("\n")).toContain("DATABASE_PATH");
  });

  it("migrates the configured database and reports what it applied", () => {
    const directory = makeTempDir();
    const databasePath = path.join(directory, "class-notes.db");

    const result = runMigrationCli({ DATABASE_PATH: databasePath });

    expect(result.exitCode).toBe(0);
    expect(result.messages.join("\n")).toMatch(/applied \d+ migration/);
    expect(result.messages.join("\n")).toContain(databasePath);
  });

  it("is a no-op on a second run", () => {
    const directory = makeTempDir();
    const databasePath = path.join(directory, "class-notes.db");

    runMigrationCli({ DATABASE_PATH: databasePath });
    const second = runMigrationCli({ DATABASE_PATH: databasePath });

    expect(second.exitCode).toBe(0);
    expect(second.messages.join("\n")).toContain("no pending migrations");
  });

  it("exits non-zero when a migration fails", () => {
    const directory = makeTempDir();
    const migrationsDir = path.join(directory, "migrations");
    mkdirSync(path.join(migrationsDir, "20990101000000_broken"), { recursive: true });
    writeFileSync(
      path.join(migrationsDir, "20990101000000_broken", "migration.sql"),
      "CREATE TABLE broken (id INTEGER",
    );

    const result = runMigrationCli({
      DATABASE_PATH: path.join(directory, "class-notes.db"),
      MIGRATIONS_DIR: migrationsDir,
    });

    expect(result.exitCode).toBe(1);
    expect(result.messages.join("\n")).toContain("failed");
  });
});
