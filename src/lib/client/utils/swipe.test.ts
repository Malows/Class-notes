import { describe, expect, it } from "vitest";

import { deadZone, flickSpeed, resolveIntent, resolveSwipe, swipeThreshold } from "./swipe";

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

  it("lets a fast flick decide with less distance", () => {
    expect(flickSpeed).toBeGreaterThan(0);
    expect(resolveSwipe(50, 0, width, flickSpeed)).toBe("present");
    expect(resolveSwipe(50, 0, width, 0)).toBeNull();
    // A flick still needs to leave the dead zone.
    expect(resolveSwipe(deadZone, 0, width, flickSpeed)).toBeNull();
  });
});

describe("resolveIntent", () => {
  it("stays neutral inside the dead zone", () => {
    expect(resolveIntent(20, -20, null)).toBeNull();
    expect(resolveIntent(deadZone - 1, 0, null)).toBeNull();
  });

  it("reports a single direction for a diagonal drag", () => {
    expect(resolveIntent(60, -60, null)).toBe("present");
    expect(resolveIntent(-60, -60, null)).toBe("absent");
  });

  it("needs a clear vertical win to switch to skip", () => {
    expect(resolveIntent(60, -50, "present")).toBe("present");
    expect(resolveIntent(60, -110, "present")).toBe("skip");
  });

  it("needs a clear horizontal win to leave skip", () => {
    expect(resolveIntent(80, -120, "skip")).toBe("skip");
    expect(resolveIntent(120, -80, "skip")).toBe("present");
  });

  it("never shows two directions at once", () => {
    const previous = "present";
    const samples: Array<[number, number]> = [
      [40, -40],
      [100, -90],
      [140, -140],
      [90, -140],
      [-90, -140],
      [-140, 20],
    ];

    for (const [dx, dy] of samples) {
      const first = resolveIntent(dx, dy, previous);
      expect(first === null || typeof first === "string").toBe(true);
      const again = resolveIntent(dx, dy, first);
      expect(again).toBe(first);
    }
  });

  it("ignores a downward drag", () => {
    expect(resolveIntent(0, 120, null)).toBeNull();
    expect(resolveIntent(0, 120, "skip")).toBeNull();
  });
});
