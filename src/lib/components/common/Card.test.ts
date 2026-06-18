import { mount, unmount, flushSync } from "svelte";
import { expect, test, afterEach } from "vitest";

import CardWrapper from "./CardWrapper.svelte";

let component: ReturnType<typeof mount>;

afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
});

test("Card renderizado con contenido", () => {
  component = mount(CardWrapper, {
    target: document.body,
  });

  flushSync();

  expect(document.body.textContent).toContain("Card Content");

  const div = document.body.querySelector("div");
  expect(div?.className).toContain("sketch-border");
  expect(div?.className).toContain("sketch-shadow");
});
