import { expect, test } from "vitest";
import { loadTranslations } from "$lib/i18n/config";
import { navStore } from "./nav.svelte";

test("navStore.breadcrumbs exposes translation keys without throwing", async () => {
  await loadTranslations("en", "/");

  expect(() => navStore.breadcrumbs).not.toThrow();
  expect(navStore.breadcrumbs[0]?.key).toBe("layout.home");
  expect(navStore.breadcrumbs[0]?.href).toBe("/");
});
