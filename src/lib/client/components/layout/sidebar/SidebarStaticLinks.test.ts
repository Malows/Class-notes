import { loadTranslations } from "$lib/common/i18n/config";
import { mount, unmount, flushSync } from "svelte";
import { expect, test, afterEach } from "vitest";

import SidebarStaticLinks from "./SidebarStaticLinks.svelte";

let component: ReturnType<typeof mount>;
afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
});

test("Links renderizan", async () => {
  await loadTranslations("en", "/");
  component = mount(SidebarStaticLinks, {
    target: document.body,
    props: { isCollapsed: false },
  });
  flushSync();
  expect(document.body.textContent).toContain("Dashboard");
  expect(document.body.textContent).toContain("Periods");
});

test("includes the students registry quick access link", async () => {
  await loadTranslations("en", "/");
  component = mount(SidebarStaticLinks, {
    target: document.body,
    props: { isCollapsed: false },
  });
  flushSync();

  const links = [...document.body.querySelectorAll("a")].map((anchor) =>
    anchor.getAttribute("href"),
  );
  expect(links).toContain("/persons");
  expect(document.body.textContent).toContain("Students");
});
