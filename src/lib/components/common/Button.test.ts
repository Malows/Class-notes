import { mount, unmount, flushSync } from "svelte";
import { expect, test, afterEach, vi } from "vitest";

import ButtonWrapper from "./ButtonWrapper.svelte";

let component: ReturnType<typeof mount>;

afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
});

test("Button con href renderiza un link", () => {
  component = mount(ButtonWrapper, {
    target: document.body,
    props: {
      href: "/test",
      children: "Test Link",
    },
  });

  flushSync();

  const link = document.body.querySelector("a");
  expect(link).toBeTruthy();
  expect(link?.getAttribute("href")).toBe("/test");
  expect(link?.textContent).toContain("Test Link");
});

test("Button ejecuta onclick al hacer click", () => {
  const clickSpy = vi.fn();
  component = mount(ButtonWrapper, {
    target: document.body,
    props: {
      onclick: clickSpy,
      children: "Test Button",
    },
  });

  flushSync();

  const button = document.body.querySelector("button");
  expect(button).toBeTruthy();
  button?.click();
  expect(clickSpy).toHaveBeenCalled();
});
