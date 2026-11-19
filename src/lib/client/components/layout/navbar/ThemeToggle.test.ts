import { render, screen, fireEvent, configure } from "@testing-library/svelte";
import { expect, test } from "vitest";
import { loadTranslations } from "$lib/common/i18n/config";
import { flushSync } from "svelte";
import ThemeToggle from "./ThemeToggle.svelte";

configure({ testIdAttribute: "data-test-id" });

test("ThemeToggle keeps a stable name and exposes the dark state with aria-pressed", async () => {
  await loadTranslations("en", "/");
  render(ThemeToggle);
  flushSync();

  const toggleBtn = screen.getByTestId("theme-toggle-btn") as HTMLButtonElement;

  // The name identifies the switch, not the next action, so it stays coherent
  // with aria-pressed in both themes.
  expect(toggleBtn.getAttribute("aria-label")).toBe("Dark theme");
  expect(toggleBtn.getAttribute("aria-pressed")).toBe("false");

  await fireEvent.click(toggleBtn);

  expect(toggleBtn.getAttribute("aria-pressed")).toBe("true");
});
