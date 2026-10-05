import { describe, expect, it } from "vitest";

import { buildUniqueSlug, slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates words", () => {
    expect(slugify("Álgebra Lineal")).toBe("algebra-lineal");
    expect(slugify("Historia de la Ciencia")).toBe("historia-de-la-ciencia");
  });

  it("strips diacritics and normalizes separators", () => {
    expect(slugify("Cálculo Diferencial")).toBe("calculo-diferencial");
    expect(slugify("  Física   General I  ")).toBe("fisica-general-i");
    expect(slugify("ñandú")).toBe("nandu");
  });

  it("removes punctuation and collapses repeated separators", () => {
    expect(slugify("Comisión (Mañana)")).toBe("comision-manana");
    expect(slugify("A -- B")).toBe("a-b");
  });

  it("falls back to a token when nothing usable remains", () => {
    expect(slugify("!!!")).toBe("item");
    expect(slugify("   ")).toBe("item");
  });
});

describe("buildUniqueSlug", () => {
  it("returns the base when it is free", () => {
    expect(buildUniqueSlug("algebra", () => false)).toBe("algebra");
  });

  it("appends a numeric suffix on collision", () => {
    expect(buildUniqueSlug("algebra", (candidate) => candidate === "algebra")).toBe("algebra-2");
  });

  it("keeps incrementing until a free candidate is found", () => {
    const taken = new Set(["algebra", "algebra-2", "algebra-3"]);
    expect(buildUniqueSlug("algebra", (candidate) => taken.has(candidate))).toBe("algebra-4");
  });
});
