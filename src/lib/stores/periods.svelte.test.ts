import { describe, it, expect, vi, beforeEach } from "vitest";

import { PeriodsStore } from "./periods.svelte";

describe("PeriodsStore", () => {
  let store: PeriodsStore;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    store = new PeriodsStore(mockService);
  });

  it("should load periods", async () => {
    const mockData = [{ id: 1, subject_id: 1, year: 2026, semester: 1 }];
    mockService.getAll.mockResolvedValue(mockData);

    await store.load(1);

    expect(store.items).toEqual(mockData);
  });

  it("should create a new period", async () => {
    const newPeriod = { id: 2, subject_id: 1, year: 2026, semester: 2 };
    mockService.create.mockResolvedValue(newPeriod);

    await store.create(1, 2026, 2);

    expect(store.items).toContainEqual(newPeriod);
  });

  it("should update a period", async () => {
    store.items = [{ id: 1, subject_id: 1, year: 2026, semester: 1 }];
    const updated = { id: 1, subject_id: 1, year: 2027, semester: 2 };
    mockService.update.mockResolvedValue(updated);

    await store.updateItem(1, 2027, 2);

    expect(store.items[0]).toEqual(updated);
  });

  it("should delete a period", async () => {
    store.items = [{ id: 1, subject_id: 1, year: 2026, semester: 1 }];
    mockService.delete.mockResolvedValue(undefined);

    await store.deleteItem(1);

    expect(store.items).toHaveLength(0);
  });
});
