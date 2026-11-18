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

function pointer(type: string, x: number, y: number) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y });
  Object.defineProperty(event, "pointerId", { value: 1 });
  Object.defineProperty(event, "pointerType", { value: "touch" });
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
  card.dispatchEvent(pointer("pointerdown", fromX, fromY));
  card.dispatchEvent(pointer("pointermove", toX, toY));
  card.dispatchEvent(pointer("pointerup", toX, toY));
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

  card.dispatchEvent(pointer("pointerdown", 100, 100));
  card.dispatchEvent(pointer("pointermove", 180, 100));
  flushSync();

  const stamp = document.body.querySelector(".take-stamp--present") as HTMLElement;
  expect(Number(stamp.style.opacity)).toBeGreaterThan(0.5);
  expect((document.body.querySelector(".take-stamp--absent") as HTMLElement).style.opacity).toBe(
    "0",
  );
});
