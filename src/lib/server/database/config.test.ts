import { describe, expect, it } from "vitest";

import { DEFAULT_DATABASE_FILE, resolveDatabasePath, shouldSeedDemoData } from "./config";

describe("resolveDatabasePath", () => {
  it("uses the explicitly configured path", () => {
    expect(resolveDatabasePath({ env: { DATABASE_PATH: "/app/data/class-notes.db" } })).toBe(
      "/app/data/class-notes.db",
    );
  });

  it("always uses an in-memory database in tests, even when a path is configured", () => {
    expect(
      resolveDatabasePath({
        env: { DATABASE_PATH: "/app/data/class-notes.db" },
        isTest: true,
      }),
    ).toBe(":memory:");
  });

  it("fails fast in production when the variable is missing", () => {
    expect(() => resolveDatabasePath({ env: {}, isProduction: true })).toThrow(/DATABASE_PATH/);
  });

  it("falls back to a local file outside production", () => {
    expect(resolveDatabasePath({ env: {} })).toBe(DEFAULT_DATABASE_FILE);
  });

  it("ignores whitespace-only values", () => {
    expect(() => resolveDatabasePath({ env: { DATABASE_PATH: "  " }, isProduction: true })).toThrow(
      /DATABASE_PATH/,
    );
  });
});

describe("shouldSeedDemoData", () => {
  it("seeds a development build with no configuration", () => {
    expect(shouldSeedDemoData({ env: {}, isProductionBuild: false })).toBe(true);
  });

  it("never seeds a production build, even with NODE_ENV=development", () => {
    expect(
      shouldSeedDemoData({
        env: { NODE_ENV: "development" },
        isProductionBuild: true,
      }),
    ).toBe(false);
  });

  it("seeds a production build only through the explicit opt-in", () => {
    expect(shouldSeedDemoData({ env: { SEED_DEMO_DATA: "true" }, isProductionBuild: true })).toBe(
      true,
    );
  });

  it("lets the explicit opt-out win in development", () => {
    expect(shouldSeedDemoData({ env: { SEED_DEMO_DATA: "false" }, isProductionBuild: false })).toBe(
      false,
    );
  });

  it("rejects values it cannot interpret", () => {
    expect(() => shouldSeedDemoData({ env: { SEED_DEMO_DATA: "maybe" } })).toThrow(
      /SEED_DEMO_DATA/,
    );
  });
});
