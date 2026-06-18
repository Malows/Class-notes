import { loadTranslations } from "$lib/i18n/config";
import { mount, unmount, flushSync } from "svelte";
import { expect, test, afterEach } from "vitest";

import ClassNoteFooter from "./ClassNoteFooter.svelte";

let component: ReturnType<typeof mount>;
afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
});

test("Footer renderiza", async () => {
  await loadTranslations("es", "/");
  component = mount(ClassNoteFooter, { target: document.body });
  flushSync();
  expect(document.body.textContent).toContain("Gestión Docente");
});
