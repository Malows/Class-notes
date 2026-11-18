import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { loadTranslations } from "$lib/common/i18n/config";

import TakeAttendanceCard from "./TakeAttendanceCard.svelte";

let component: ReturnType<typeof mount>;

beforeEach(async () => {
  await loadTranslations("es", "/");
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  if (component) unmount(component);
  document.body.innerHTML = "";
});

function pointer(type: string, x: number, y: number, time = 0) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y });
  Object.defineProperty(event, "pointerId", { value: 1 });
  Object.defineProperty(event, "pointerType", { value: "touch" });
  Object.defineProperty(event, "timeStamp", { value: time });
  return event;
}

function mountCard(onDecide = vi.fn()) {
  component = mount(TakeAttendanceCard, {
    target: document.body,
    props: {
      studentName: "Ana Martínez",
      legajo: "ING-004",
      commissionName: "Comisión Mañana",
      status: null,
      current: 0,
      total: 3,
      onDecide,
      onUndo: vi.fn(),
      canUndo: false,
    },
  });
  flushSync();
  const card = document.body.querySelector('[data-test-id="take-card"]') as HTMLElement;
  return { onDecide, card };
}

function drag(card: HTMLElement, fromX: number, fromY: number, toX: number, toY: number) {
  card.dispatchEvent(pointer("pointerdown", fromX, fromY, 0));
  card.dispatchEvent(pointer("pointermove", toX, toY, 250));
  card.dispatchEvent(pointer("pointerup", toX, toY, 260));
  flushSync();
}

test("a right swipe decides present after the fly-out", () => {
  const { onDecide, card } = mountCard();

  drag(card, 100, 100, 240, 110);
  expect(onDecide).not.toHaveBeenCalled();

  vi.advanceTimersByTime(200);
  expect(onDecide).toHaveBeenCalledWith("present");
});

test("a left swipe decides absent", () => {
  const { onDecide, card } = mountCard();

  drag(card, 240, 100, 100, 110);
  vi.advanceTimersByTime(200);
  expect(onDecide).toHaveBeenCalledWith("absent");
});

test("an upward swipe decides skip", () => {
  const { onDecide, card } = mountCard();

  drag(card, 100, 200, 110, 60);
  vi.advanceTimersByTime(200);
  expect(onDecide).toHaveBeenCalledWith("skip");
});

test("a short drag snaps back without deciding", () => {
  const { onDecide, card } = mountCard();

  drag(card, 100, 100, 140, 105);
  vi.advanceTimersByTime(200);
  expect(onDecide).not.toHaveBeenCalled();
  expect((card as HTMLElement).style.transform).toBe("translate(0px, 0px) rotate(0deg)");
});

test("a cancelled gesture never decides", () => {
  const { onDecide, card } = mountCard();

  card.dispatchEvent(pointer("pointerdown", 100, 100));
  card.dispatchEvent(pointer("pointermove", 260, 110));
  card.dispatchEvent(pointer("pointercancel", 260, 110));
  vi.advanceTimersByTime(200);

  expect(onDecide).not.toHaveBeenCalled();
});

test("the present stamp fades in while dragging right", () => {
  const { card } = mountCard();

  card.dispatchEvent(pointer("pointerdown", 100, 100, 0));
  card.dispatchEvent(pointer("pointermove", 180, 100, 250));
  flushSync();

  const stamp = document.body.querySelector(".take-stamp--present") as HTMLElement;
  expect(Number(stamp.style.opacity)).toBeGreaterThan(0.5);
  expect((document.body.querySelector(".take-stamp--absent") as HTMLElement).style.opacity).toBe(
    "0",
  );
});

test("a diagonal drag never shows two stamps at once", () => {
  const { card } = mountCard();

  card.dispatchEvent(pointer("pointerdown", 100, 200, 0));
  card.dispatchEvent(pointer("pointermove", 190, 110, 250));
  flushSync();

  const opacity = (selector: string) =>
    Number((document.body.querySelector(selector) as HTMLElement).style.opacity);
  const shown = ["present", "absent", "skip"].filter(
    (name) => opacity(`.take-stamp--${name}`) > 0,
  );
  expect(shown).toHaveLength(1);
});

test("nothing is shown inside the dead zone", () => {
  const { card } = mountCard();

  card.dispatchEvent(pointer("pointerdown", 100, 100, 0));
  card.dispatchEvent(pointer("pointermove", 122, 96, 250));
  flushSync();

  const opacity = (selector: string) =>
    Number((document.body.querySelector(selector) as HTMLElement).style.opacity);
  expect(opacity(".take-stamp--present")).toBe(0);
  expect(opacity(".take-stamp--absent")).toBe(0);
  expect(opacity(".take-stamp--skip")).toBe(0);
});

test("a quick flick decides with a short run", () => {
  const { onDecide, card } = mountCard();

  card.dispatchEvent(pointer("pointerdown", 100, 100, 0));
  card.dispatchEvent(pointer("pointermove", 158, 100, 16));
  card.dispatchEvent(pointer("pointerup", 158, 100, 20));
  vi.advanceTimersByTime(200);

  expect(onDecide).toHaveBeenCalledWith("present");
});

test("pausing before release cancels the flick", () => {
  const { onDecide, card } = mountCard();

  card.dispatchEvent(pointer("pointerdown", 100, 100, 0));
  card.dispatchEvent(pointer("pointermove", 158, 100, 16));
  card.dispatchEvent(pointer("pointerup", 158, 100, 500));
  vi.advanceTimersByTime(200);

  expect(onDecide).not.toHaveBeenCalled();
});
