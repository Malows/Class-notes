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
    const mockData = [{ id: 1, subject_id: 1, period_id: 1, name: "Commission A", slug: "commission-a", student_count: 0 }];
    mockService.getAll.mockResolvedValue(mockData);

    await store.load();
    await store.load(); // Test early return

    expect(store.items).toEqual(mockData);
    expect(mockService.getAll).toHaveBeenCalledTimes(1);
  });

  it("should create a new commission", async () => {
    const newCommission = {
      id: 2,
      subject_id: 1,
      period_id: 1,
      name: "Commission B",
      slug: "commission-b",
      student_count: 0,
    };
    mockService.create.mockResolvedValue(newCommission);

    await store.create(1, 1, "Commission B");

    expect(store.items).toContainEqual(newCommission);
  });

  it("should update a commission", async () => {
    store.items = [{ id: 1, subject_id: 1, period_id: 1, name: "Commission A", slug: "commission-a", student_count: 0 }];
    const updated = {
      id: 1,
      subject_id: 1,
      period_id: 1,
      name: "Commission A Updated",
      slug: "commission-a-updated",
      student_count: 0,
    };
    mockService.update.mockResolvedValue(updated);

    await store.updateItem(1, "Commission A Updated");

    expect(store.items[0].name).toBe("Commission A Updated");
  });

  it("resolves a commission by subject, period and slug", async () => {
    mockService.getAll.mockResolvedValue([
      {
        id: 1,
        subject_id: 1,
        period_id: 1,
        name: "Comm A",
        slug: "comm-a",
        student_count: 0,
      },
      {
        id: 2,
        subject_id: 1,
        period_id: 2,
        name: "Comm A",
        slug: "comm-a",
        student_count: 0,
      },
    ]);

    await store.load();

    expect(store.findInScope(1, 1, "comm-a")?.id).toBe(1);
    expect(store.findInScope(1, 2, "comm-a")?.id).toBe(2);
    expect(store.findInScope(9, 9, "comm-a")).toBeUndefined();
  });

  it("should delete a commission", async () => {
    store.items = [{ id: 1, subject_id: 1, period_id: 1, name: "Commission A", slug: "commission-a", student_count: 0 }];
    mockService.delete.mockResolvedValue(undefined);

    await store.deleteItem(1);

    expect(store.items).toHaveLength(0);
  });
});
