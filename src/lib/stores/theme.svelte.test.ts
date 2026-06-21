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

  it("initializes locale and alternates flags on toggleLanguage", () => {
    const store = new ThemeStore();
    // Default initial locale is en
    expect(store.currentLocale).toBe("en");
    expect(store.esFlag).toBe("🇦🇷"); // Default even (0) count is 🇦🇷

    // Toggle 1: en -> es (click count 1 -> odd -> Colombia 🇨🇴)
    store.toggleLanguage();
    expect(store.currentLocale).toBe("es");
    expect(store.esFlag).toBe("🇨🇴");

    // Toggle 2: es -> en
    store.toggleLanguage();
    expect(store.currentLocale).toBe("en");

    // Toggle 3: en -> es (click count 2 -> even -> Argentina 🇦🇷)
    store.toggleLanguage();
    expect(store.currentLocale).toBe("es");
    expect(store.esFlag).toBe("🇦🇷");
  });
});
