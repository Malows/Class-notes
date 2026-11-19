import { loadTranslations, locale } from "$lib/common/i18n/config";
import { StoreKey } from "$lib/common";
import { SidebarUiStore } from "$lib/client/stores/sidebar-ui.svelte";
import { mount, unmount, flushSync } from "svelte";
import { expect, test, afterEach } from "vitest";
import { fireEvent } from "@testing-library/svelte";

import NavBar from "./NavBar.svelte";

let component: ReturnType<typeof mount>;
let sidebarUi: SidebarUiStore;

function mountNavBar() {
  sidebarUi = new SidebarUiStore();
  component = mount(NavBar, {
    target: document.body,
    context: new Map<StoreKey, unknown>([[StoreKey.SIDEBAR_UI, sidebarUi]]),
  });
  flushSync();
}

afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
});

test("NavBar renderiza marca y tema", async () => {
  await loadTranslations("en", "/");
  mountNavBar();
  expect(document.body.textContent).toContain("Class Notes");
  expect(document.body.querySelector("button")).toBeTruthy();
});

test("NavBar toggles the sidebar from the navbar menu control", async () => {
  await loadTranslations("en", "/");
  mountNavBar();

  const menuBtn = document.body.querySelector(
    '[data-test-id="nav-menu-toggle"]',
  ) as HTMLButtonElement;
  expect(menuBtn).toBeTruthy();
  expect(menuBtn.getAttribute("aria-expanded")).toBe("false");

  await fireEvent.click(menuBtn);
  flushSync();

  expect(sidebarUi.isOpen).toBe(true);
  expect(menuBtn.getAttribute("aria-expanded")).toBe("true");
});

test("NavBar renderiza el selector de idioma y responde al clic alternando banderas", async () => {
  await loadTranslations("en", "/");
  let currentLocale = "";
  const unsubscribe = locale.subscribe((val) => {
    currentLocale = val;
  });

  component = mount(NavBar, {
    target: document.body,
    context: new Map<StoreKey, unknown>([[StoreKey.SIDEBAR_UI, new SidebarUiStore()]]),
  });
  flushSync();

  const toggleBtn = document.body.querySelector(
    '[data-test-id="language-toggle-btn"]',
  ) as HTMLButtonElement;
  expect(toggleBtn).toBeTruthy();

  // Inverted logic: If in English, the button displays only the UK flag!
  expect(toggleBtn.textContent?.trim()).toBe("🇬🇧");

  // First click: English -> Spanish (Click count increments to 1: odd -> Colombia 🇨🇴)
  await fireEvent.click(toggleBtn);
  await new Promise((resolve) => setTimeout(resolve, 100));
  flushSync();

  expect(currentLocale).toBe("es");
  expect(toggleBtn.textContent?.trim()).toBe("🇨🇴");

  // Second click: Spanish -> English
  await fireEvent.click(toggleBtn);
  await new Promise((resolve) => setTimeout(resolve, 100));
  flushSync();

  expect(currentLocale).toBe("en");
  expect(toggleBtn.textContent?.trim()).toBe("🇬🇧");

  // Third click: English -> Spanish (Click count increments to 2: even -> Argentina 🇦🇷)
  await fireEvent.click(toggleBtn);
  await new Promise((resolve) => setTimeout(resolve, 100));
  flushSync();

  expect(currentLocale).toBe("es");
  expect(toggleBtn.textContent?.trim()).toBe("🇦🇷");

  unsubscribe();
});
