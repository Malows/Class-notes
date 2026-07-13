import { beforeEach, describe, expect, it } from "vitest";
import { MetadataStore } from "./metadata.svelte";

describe("MetadataStore", () => {
  let store: MetadataStore;

  beforeEach(() => {
    store = new MetadataStore({
      getAcademicMetadata: async () => ({
        periodData: { year: 2026, term: "Cuatrimestre I" },
        subjects: [{ id: "1", name: "Algoritmos", href: "/faculties/1/subjects/1/periods" }],
      }),
    } as any);
  });

  it("initializes from an SSR payload", () => {
    store.initializeStore({
      periodData: { year: 2026, term: "Cuatrimestre II" },
      subjects: [{ id: "2", name: "Bases", href: "/faculties/1/subjects/2/periods" }],
    });

    expect(store.context?.periodData?.term).toBe("Cuatrimestre II");
    expect(store.loaded).toBe(true);
  });

  it("fetches metadata context asynchronously", async () => {
    await store.fetchMetadataContext();

    expect(store.loaded).toBe(true);
    expect(store.context?.periodData?.year).toBe(2026);
  });

  it("refreshes metadata context from the service", async () => {
    await store.refreshMetadata();

    expect(store.loaded).toBe(true);
    expect(store.context?.subjects[0]?.name).toBe("Algoritmos");
  });
});
