import { render, screen, fireEvent, configure } from "@testing-library/svelte";
import { expect, test, vi } from "vitest";
import { themeStore } from "$lib/stores/theme.svelte";
import { flushSync } from "svelte";
import LanguageToggle from "./LanguageToggle.svelte";

configure({ testIdAttribute: "data-test-id" });

test("LanguageToggle renders and triggers store toggles on click", async () => {
  render(LanguageToggle);
  flushSync();

  const toggleBtn = screen.getByTestId("language-toggle-btn") as HTMLButtonElement;
  expect(toggleBtn).toBeTruthy();
  expect(toggleBtn.textContent?.trim()).toBe("🇬🇧");

  // Mock toggle function
  const spy = vi.spyOn(themeStore, "toggleLanguage");
  await fireEvent.click(toggleBtn);

  expect(spy).toHaveBeenCalled();

  spy.mockRestore();
});
