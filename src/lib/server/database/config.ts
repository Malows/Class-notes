export const DEFAULT_DATABASE_FILE = "class-notes.db";

export interface DatabasePathOptions {
  env?: Record<string, string | undefined>;
  isTest?: boolean;
  isProduction?: boolean;
}

/**
 * Resolves the SQLite file the process should open.
 *
 * - tests always run against an in-memory database;
 * - `DATABASE_PATH` wins everywhere else;
 * - production refuses to start without it instead of silently creating a file
 *   in the working directory (which is how data ended up outside the volume);
 * - development falls back to a local file next to the server.
 */
export function resolveDatabasePath(options: DatabasePathOptions = {}): string {
  const { env = process.env, isTest = false, isProduction = false } = options;

  if (isTest) return ":memory:";

  const configured = env.DATABASE_PATH?.trim();
  if (configured) return configured;

  if (isProduction) {
    throw new Error(
      "DATABASE_PATH is required in production: set it to the absolute path of the SQLite file (for example /app/data/class-notes.db)",
    );
  }

  return DEFAULT_DATABASE_FILE;
}

const TRUTHY = new Set(["1", "true", "yes", "on"]);
const FALSY = new Set(["0", "false", "no", "off"]);

export interface SeedPolicyOptions {
  env?: Record<string, string | undefined>;
  isProductionBuild?: boolean;
}

/**
 * Demo fixtures are a development convenience and an explicit opt-in anywhere
 * else. `isProductionBuild` is a build-time constant (`import.meta.env.PROD`),
 * so a production image never seeds, even when started with `NODE_ENV=development`.
 */
export function shouldSeedDemoData(options: SeedPolicyOptions = {}): boolean {
  const { env = process.env, isProductionBuild = false } = options;
  const raw = env.SEED_DEMO_DATA?.trim().toLowerCase();

  if (raw) {
    if (TRUTHY.has(raw)) return true;
    if (FALSY.has(raw)) return false;
    throw new Error(`SEED_DEMO_DATA must be true or false, received "${raw}"`);
  }

  return !isProductionBuild;
}
