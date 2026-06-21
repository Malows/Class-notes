import { loadTranslations, locale } from "$lib/i18n/config";
import { mount, unmount, flushSync } from "svelte";
import { expect, test, afterEach } from "vitest";
import { fireEvent } from "@testing-library/svelte";

import NavBar from "./NavBar.svelte";

let component: ReturnType<typeof mount>;
afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
});

test("NavBar renderiza marca y tema", async () => {
  await loadTranslations("en", "/");
  component = mount(NavBar, { target: document.body });
  flushSync();
  expect(document.body.textContent).toContain("Class Notes");
  expect(document.body.querySelector("button")).toBeTruthy();
});

test("NavBar renderiza el selector de idioma y responde al clic alternando banderas", async () => {
  await loadTranslations("en", "/");
  let currentLocale = "";
  const unsubscribe = locale.subscribe((val) => {
    currentLocale = val;
  });

  component = mount(NavBar, { target: document.body });
  flushSync();

  const toggleBtn = document.body.querySelector(
    '[data-test-id="language-toggle-btn"]',
  ) as HTMLButtonElement;
  expect(toggleBtn).toBeTruthy();

  // Inverted logic: If in English, the button displays English!
  expect(toggleBtn.textContent?.trim()).toContain("English");

  // First click: English -> Spanish (Click count increments to 1: odd -> Colombia 🇨🇴)
  await fireEvent.click(toggleBtn);
  await new Promise((resolve) => setTimeout(resolve, 100));
  flushSync();

  expect(currentLocale).toBe("es");
  expect(toggleBtn.textContent?.trim()).toContain("🇨🇴 Español");

  // Second click: Spanish -> English
  await fireEvent.click(toggleBtn);
  await new Promise((resolve) => setTimeout(resolve, 100));
  flushSync();

  expect(currentLocale).toBe("en");
  expect(toggleBtn.textContent?.trim()).toContain("English");

  // Third click: English -> Spanish (Click count increments to 2: even -> Argentina 🇦🇷)
  await fireEvent.click(toggleBtn);
  await new Promise((resolve) => setTimeout(resolve, 100));
  flushSync();

  expect(currentLocale).toBe("es");
  expect(toggleBtn.textContent?.trim()).toContain("🇦🇷 Español");

  unsubscribe();
});
