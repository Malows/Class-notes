import { loadTranslations } from "$lib/common/i18n/config";
import { mount, unmount, flushSync } from "svelte";
import { expect, test, afterEach } from "vitest";

import SidebarHeader from "./SidebarHeader.svelte";

let component: ReturnType<typeof mount>;
afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
});

test("Sidebar header renders the brand link", async () => {
  await loadTranslations("en", "/");
  component = mount(SidebarHeader, { target: document.body });
  flushSync();

  const brand = document.body.querySelector('[data-test-id="sidebar-brand"]') as HTMLAnchorElement;
  expect(brand).toBeTruthy();
  expect(brand.getAttribute("href")).toBe("/");
  expect(brand.textContent).toContain("Class Notes");
});
