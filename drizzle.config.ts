import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/server/database/schema.ts",
  out: "./src/lib/server/database/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || "./class-notes.db",
  },
  verbose: true,
  strict: true,
});
