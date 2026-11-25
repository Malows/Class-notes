import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/server/database/schema.ts",
  out: "./src/lib/server/database/migrations",
  dialect: "sqlite",
  dbCredentials: {
    // Keep CLI tooling (`db:generate`, `db:studio`) pointed at the same file the
    // runtime uses: DATABASE_PATH wins, DATABASE_URL stays as a drizzle-kit escape hatch.
    url: process.env.DATABASE_PATH || process.env.DATABASE_URL || "./class-notes.db",
  },
  verbose: true,
  strict: true,
});
