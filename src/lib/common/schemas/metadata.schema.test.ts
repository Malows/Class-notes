import { describe, expect, test } from "vitest";

import { MetadataDtoSchema } from "./metadata.schema";

describe("MetadataDtoSchema", () => {
  test("accepts a valid metadata payload", () => {
    const result = MetadataDtoSchema.safeParse({
      periodData: { year: 2026, term: "Cuatrimestre I" },
      subjects: [{ id: "1", name: "Algoritmos", href: "/subjects/1" }],
    });

    expect(result.success).toBe(true);
  });

  test("accepts nullable period data", () => {
    const result = MetadataDtoSchema.safeParse({
      periodData: null,
      subjects: [],
    });

    expect(result.success).toBe(true);
  });

  test("rejects an invalid term value", () => {
    const result = MetadataDtoSchema.safeParse({
      periodData: { year: 2026, term: "Invalid" },
      subjects: [],
    });

    expect(result.success).toBe(false);
  });
});
