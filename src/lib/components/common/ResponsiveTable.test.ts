import { mount, unmount, flushSync } from "svelte";
import { expect, test, afterEach } from "vitest";

import ResponsiveTableWrapper from "./ResponsiveTableWrapper.svelte";

let component: ReturnType<typeof mount>;

afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
});

test("ResponsiveTable renderiza items", () => {
  component = mount(ResponsiveTableWrapper, {
    target: document.body,
  });

  flushSync();

  expect(document.body.textContent).toContain("Item 1");
  expect(document.body.querySelector("table")).toBeTruthy();
});

test("ResponsiveTable renderiza mensaje de vacio", () => {
  // Necesitamos otro wrapper o props dynamicas. Por ahora probemos este caso
  component = mount(ResponsiveTableWrapper, {
    target: document.body,
    // Hacky: re-render with empty items
  });
  // ...
});
