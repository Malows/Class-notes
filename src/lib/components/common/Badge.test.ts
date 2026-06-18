import { mount, unmount, flushSync } from "svelte";
import { expect, test, afterEach } from "vitest";

import BadgeWrapper from "./BadgeWrapper.svelte";

let component: ReturnType<typeof mount>;

afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
});

test("Badge renderizado con contenido a través de wrapper", () => {
  component = mount(BadgeWrapper, {
    target: document.body,
  });

  flushSync(); // Asegurar renderizado

  expect(document.body.textContent).toContain("Test Badge");

  const span = document.body.querySelector("span");
  expect(span?.className).toContain("sketch-border");
  expect(span?.className).toContain("bg-surface-container");
});
