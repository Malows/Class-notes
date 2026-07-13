import { describe, it, expect, vi, beforeEach } from "vitest";

import { CommissionsStore } from "./commissions.svelte";

describe("CommissionsStore", () => {
  let store: CommissionsStore;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    store = new CommissionsStore(mockService);
  });

  it("should load commissions", async () => {
    const mockData = [{ id: 1, period_id: 1, name: "Commission A", student_count: 0 }];
    mockService.getAll.mockResolvedValue(mockData);

    await store.load();
    await store.load(); // Test early return

    expect(store.items).toEqual(mockData);
    expect(mockService.getAll).toHaveBeenCalledTimes(1);
  });

  it("should create a new commission", async () => {
    const newCommission = {
      id: 2,
      period_id: 1,
      name: "Commission B",
      student_count: 0,
    };
    mockService.create.mockResolvedValue(newCommission);

    await store.create(1, "Commission B");

    expect(store.items).toContainEqual(newCommission);
  });

  it("should update a commission", async () => {
    store.items = [{ id: 1, period_id: 1, name: "Commission A", student_count: 0 }];
    const updated = {
      id: 1,
      period_id: 1,
      name: "Commission A Updated",
      student_count: 0,
    };
    mockService.update.mockResolvedValue(updated);

    await store.updateItem(1, "Commission A Updated");

    expect(store.items[0].name).toBe("Commission A Updated");
  });

  it("should delete a commission", async () => {
    store.items = [{ id: 1, period_id: 1, name: "Commission A", student_count: 0 }];
    mockService.delete.mockResolvedValue(undefined);

    await store.deleteItem(1);

    expect(store.items).toHaveLength(0);
  });
});
