import { render, screen, fireEvent } from "@testing-library/svelte";
import { expect, test, vi } from "vitest";
import { themeStore } from "$lib/stores/theme.svelte";
import { flushSync } from "svelte";
import LanguageToggle from "./LanguageToggle.svelte";

test("LanguageToggle renders and triggers store toggles on click", async () => {
  render(LanguageToggle);
  flushSync();

  const toggleBtn = screen.getByRole("button") as HTMLButtonElement;
  expect(toggleBtn).toBeTruthy();
  expect(toggleBtn.textContent?.trim()).toBe("🇬🇧");

  // Mock toggle function
  const spy = vi.spyOn(themeStore, "toggleLanguage");
  await fireEvent.click(toggleBtn);

  expect(spy).toHaveBeenCalled();

  spy.mockRestore();
});
