import { render, screen, fireEvent, configure } from "@testing-library/svelte";
import { expect, test, vi } from "vitest";
import { loadTranslations } from "$lib/common/i18n/config";
import { themeStore } from "$lib/client/stores/theme.svelte";
import { flushSync } from "svelte";
import LanguageToggle from "./LanguageToggle.svelte";

configure({ testIdAttribute: "data-test-id" });

test("LanguageToggle renders and triggers store toggles on click", async () => {
  await loadTranslations("en", "/");
  render(LanguageToggle);
  flushSync();

  const toggleBtn = screen.getByTestId("language-toggle-btn") as HTMLButtonElement;
  expect(toggleBtn).toBeTruthy();
  expect(toggleBtn.textContent?.trim()).toBe("🇬🇧 EN");

  // Stable name for the Spanish option; the state lives in aria-pressed, so the
  // accessible name never announces the opposite language.
  expect(toggleBtn.getAttribute("aria-label")).toBe("Language: Spanish");
  expect(toggleBtn.getAttribute("aria-pressed")).toBe("false");

  // Mock toggle function
  const spy = vi.spyOn(themeStore, "toggleLanguage");
  await fireEvent.click(toggleBtn);

  expect(spy).toHaveBeenCalled();
  await new Promise((resolve) => setTimeout(resolve, 100));
  flushSync();
  expect(toggleBtn.getAttribute("aria-pressed")).toBe("true");

  spy.mockRestore();
});
