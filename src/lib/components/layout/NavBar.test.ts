import { loadTranslations } from "$lib/i18n/config";
import { mount, unmount, flushSync } from "svelte";
import { expect, test, afterEach } from "vitest";

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
