import { describe, expect, it } from "vitest";

import { resolveSwipe, swipeThreshold } from "./swipe";

describe("resolveSwipe", () => {
  const width = 320; // threshold = max(80, 64) = 80

  it("requires a real gesture", () => {
    expect(swipeThreshold(200)).toBe(80);
    expect(swipeThreshold(1000)).toBe(200);

    expect(resolveSwipe(40, 0, width)).toBeNull();
    expect(resolveSwipe(-40, 0, width)).toBeNull();
    expect(resolveSwipe(0, -40, width)).toBeNull();
  });

  it("maps a horizontal drag by direction", () => {
    expect(resolveSwipe(120, 10, width)).toBe("present");
    expect(resolveSwipe(-120, 10, width)).toBe("absent");
  });

  it("maps an upward drag to skip", () => {
    expect(resolveSwipe(10, -120, width)).toBe("skip");
  });

  it("ignores a downward drag", () => {
    expect(resolveSwipe(0, 120, width)).toBeNull();
  });

  it("lets the dominant axis win", () => {
    expect(resolveSwipe(120, -130, width)).toBe("skip");
    expect(resolveSwipe(-130, 120, width)).toBe("absent");
  });

  it("uses the card width for the threshold", () => {
    // 150px is below max(80, 0.2 * 1000 = 200).
    expect(resolveSwipe(150, 0, 1000)).toBeNull();
    expect(resolveSwipe(210, 0, 1000)).toBe("present");
  });
});
