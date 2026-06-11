import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock matchMedia at top level because singleton initializes on import
vi.stubGlobal(
  "matchMedia",
  vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
);

import { ThemeStore } from "./theme.svelte";

describe("ThemeStore", () => {
  beforeEach(() => {
    localStorage.clear();
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("dark");
    }
  });

  it("initializes with light theme by default", () => {
    const store = new ThemeStore();
    expect(store.current).toBe("light");
  });

  it("toggles theme correctly", () => {
    const store = new ThemeStore();
    store.toggle();
    expect(store.current).toBe("dark");
    if (typeof document !== "undefined") {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    }
    store.toggle();
    expect(store.current).toBe("light");
    if (typeof document !== "undefined") {
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    }
  });
});
