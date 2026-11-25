import Database from "better-sqlite3";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  applyDrizzleMigrations,
  listMigrations,
  MIGRATIONS_TABLE,
  resolveMigrationsDir,
} from "./migrate";

const temporaryDirs: string[] = [];

function makeTempDir(): string {
  const directory = mkdtempSync(path.join(tmpdir(), "class-notes-migrations-"));
  temporaryDirs.push(directory);
  return directory;
}

function migrationVersions(targetDb: Database.Database): string[] {
  const rows = targetDb
    .prepare(`SELECT version FROM ${MIGRATIONS_TABLE} ORDER BY version`)
    .all() as { version: string }[];
  return rows.map((row) => row.version);
}

afterEach(() => {
  for (const directory of temporaryDirs.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("applyDrizzleMigrations", () => {
  it("applies every shipped migration on a fresh database and records it", () => {
    const targetDb = new Database(":memory:");

    const result = applyDrizzleMigrations(targetDb);
    const shipped = listMigrations().map((migration) => migration.version);

    expect(result.applied).toEqual(shipped);
    expect(result.baselined).toEqual([]);
    expect(migrationVersions(targetDb)).toEqual([...shipped].sort((a, b) => a.localeCompare(b)));
  });

  it("is a no-op on the second run", () => {
    const targetDb = new Database(":memory:");

    applyDrizzleMigrations(targetDb);
    const second = applyDrizzleMigrations(targetDb);

    expect(second.applied).toEqual([]);
    expect(second.baselined).toEqual([]);
  });

  it("baselines a legacy database instead of re-running its migrations", () => {
    const targetDb = new Database(":memory:");

    applyDrizzleMigrations(targetDb);
    const facultiesBefore = targetDb.prepare("SELECT COUNT(*) AS count FROM faculties").get();
    targetDb.exec(`DROP TABLE ${MIGRATIONS_TABLE}`);

    const result = applyDrizzleMigrations(targetDb);

    expect(result.applied).toEqual([]);
    expect(result.baselined).toEqual(listMigrations().map((migration) => migration.version));
    expect(targetDb.prepare("SELECT COUNT(*) AS count FROM faculties").get()).toEqual(
      facultiesBefore,
    );
  });

  it("starts from scratch when neither the tracking table nor the schema exists", () => {
    const targetDb = new Database(":memory:");

    const result = applyDrizzleMigrations(targetDb);

    expect(result.baselined).toEqual([]);
    expect(result.applied.length).toBeGreaterThan(0);
  });

  it("propagates a migration that fails for a reason other than being applied already", () => {
    const directory = makeTempDir();
    const broken = path.join(directory, "20990101000000_broken");
    mkdirSync(broken);
    writeFileSync(path.join(broken, "migration.sql"), "CREATE TABLE broken (id INTEGER");

    expect(() =>
      applyDrizzleMigrations(new Database(":memory:"), { migrationsDir: directory }),
    ).toThrow();
  });

  it("records nothing for a migration that failed inside its transaction", () => {
    const directory = makeTempDir();
    const broken = path.join(directory, "20990101000000_broken");
    mkdirSync(broken);
    writeFileSync(path.join(broken, "migration.sql"), "CREATE TABLE broken (id INTEGER");

    const targetDb = new Database(":memory:");
    expect(() => applyDrizzleMigrations(targetDb, { migrationsDir: directory })).toThrow();
    expect(migrationVersions(targetDb)).toEqual([]);
  });
});

describe("resolveMigrationsDir", () => {
  it("honours MIGRATIONS_DIR so the image can ship the SQL outside the source tree", () => {
    const directory = makeTempDir();
    expect(resolveMigrationsDir(directory)).toBe(directory);
  });

  it("defaults to the migrations folder next to the module", () => {
    expect(resolveMigrationsDir("")).toMatch(/migrations$/);
  });
});
