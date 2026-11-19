import { expect, test } from "vitest";

import { abbreviateTitle } from "./abbreviate-title";

test("keeps the trailing number and abbreviates the words before it", () => {
  expect(abbreviateTitle("Trabajo Práctico 2")).toBe("TP2");
  expect(abbreviateTitle("Lab Exercise 12")).toBe("LE12");
  expect(abbreviateTitle("Lab 1")).toBe("L1");
});

test("keeps an already abbreviated prefix whole", () => {
  expect(abbreviateTitle("TP 1")).toBe("TP1");
});

test("falls back to the initials when there is no trailing number", () => {
  expect(abbreviateTitle("Discrete Mathematics")).toBe("DM");
  expect(abbreviateTitle("Guía de problemas")).toBe("GDP");
});

test("handles empty titles", () => {
  expect(abbreviateTitle("")).toBe("");
  expect(abbreviateTitle("   ")).toBe("");
});
