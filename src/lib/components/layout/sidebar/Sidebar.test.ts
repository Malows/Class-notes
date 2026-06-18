import { mount, unmount, flushSync } from "svelte";
import { expect, test, afterEach } from "vitest";

import Sidebar from "./Sidebar.svelte";

let component: ReturnType<typeof mount>;
afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
});

test("Sidebar renderizado inicial", () => {
  component = mount(Sidebar, { target: document.body });
  flushSync();
  expect(document.body.querySelector("aside")).toBeTruthy();
});
