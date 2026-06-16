import { mount, unmount, flushSync } from "svelte";
import { expect, test, afterEach, vi } from "vitest";
import { goto } from "$app/navigation";
import ButtonWrapper from "./ButtonWrapper.svelte";

vi.mock("$app/navigation", () => ({
  goto: vi.fn(),
}));

let component: ReturnType<typeof mount>;

afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

test("Button con href ejecuta goto", () => {
  component = mount(ButtonWrapper, {
    target: document.body,
    props: {
      href: "/test",
      children: "Test Link",
    },
  });

  flushSync();

  const button = document.body.querySelector("button");
  expect(button).toBeTruthy();
  expect(button?.textContent).toContain("Test Link");
  
  button?.click();
  expect(goto).toHaveBeenCalledWith("/test");
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
