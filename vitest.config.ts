import { defineConfig } from "vitest/config";
import { sveltekit } from "@sveltejs/kit/vite";
import path from "path";

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    environment: "jsdom",
    globals: true,
    server: {
      deps: {
        inline: ["@testing-library/svelte"],
      },
    },
  },
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, "./src/lib"),
    },
    conditions: ["browser"],
  },
});
