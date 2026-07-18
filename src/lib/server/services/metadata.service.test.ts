import { describe, expect, it, vi } from "vitest";

import { metadataService } from "./metadata.service";

vi.mock("../repositories/period.repository", () => ({
  periodRepository: {
    getActiveMetadata: vi.fn(() => ({
      periodData: { year: 2026, term: "Cuatrimestre I" },
      subjects: [{ id: "1", name: "Algoritmos", href: "/faculties/1/subjects/1/periods" }],
    })),
  },
}));

describe("server metadataService", () => {
  it("returns server-side metadata from the repository when SSR", async () => {
    const payload = await metadataService.getAcademicMetadata();

    expect(payload).toEqual({
      periodData: { year: 2026, term: "Cuatrimestre I" },
      subjects: [{ id: "1", name: "Algoritmos", href: "/faculties/1/subjects/1/periods" }],
    });
  });
});
