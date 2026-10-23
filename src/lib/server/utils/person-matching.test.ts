import { describe, expect, it } from "vitest";

import { findPersonMatch, normalizePersonName } from "./person-matching";

const candidates = [
  { id: 1, name: "Juan Perez", legajo: null },
  { id: 2, name: "María Rodríguez", legajo: "ING-002" },
  { id: 3, name: "Persona Distinta", legajo: "ING-003" },
];

describe("normalizePersonName", () => {
  it("trims, collapses whitespace and lowercases ASCII letters", () => {
    expect(normalizePersonName("  Juan   Perez  ")).toBe("juan perez");
    expect(normalizePersonName("ANA")).toBe("ana");
  });

  it("keeps accented characters untouched", () => {
    expect(normalizePersonName("José")).toBe("josé");
    expect(normalizePersonName("JOSÉ")).toBe("josÉ");
  });
});

describe("findPersonMatch", () => {
  it("matches an exact name ignoring ASCII case and extra whitespace", () => {
    expect(findPersonMatch({ name: "  JUAN   PEREZ " }, candidates)?.id).toBe(1);
  });

  it("does not match an accented name written in different case", () => {
    expect(findPersonMatch({ name: "JOSÉ" }, [{ id: 9, name: "José", legajo: null }])).toBe(
      undefined,
    );
  });

  it("prefers the legajo match over a name match", () => {
    const match = findPersonMatch({ name: "Persona Distinta", legajo: "ING-002" }, candidates);
    expect(match?.id).toBe(2);
  });

  it("falls back to the name when the legajo matches nobody", () => {
    const match = findPersonMatch({ name: "Juan Perez", legajo: "NOPE-999" }, candidates);
    expect(match?.id).toBe(1);
  });

  it("returns undefined when nothing matches", () => {
    expect(findPersonMatch({ name: "Nadie Conocido", legajo: "NOPE-998" }, candidates)).toBe(
      undefined,
    );
    expect(findPersonMatch({ name: "   " }, candidates)).toBe(undefined);
  });
});
