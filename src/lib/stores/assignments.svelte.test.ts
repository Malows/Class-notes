import { describe, it, expect, vi, beforeEach } from "vitest";

import { AssignmentsStore } from "./assignments.svelte";

describe("AssignmentsStore", () => {
  let store: AssignmentsStore;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      copy: vi.fn(),
    };
    store = new AssignmentsStore(mockService);
  });

  it("should load assignments", async () => {
    const mockData = [{ id: 1, period_id: 1, title: "Assignment A" }];
    mockService.getAll.mockResolvedValue(mockData);

    await store.load(1);

    expect(store.items).toEqual(mockData);
  });

  it("should create an assignment", async () => {
    const newAssignment = { id: 2, period_id: 1, title: "Assignment B" };
    mockService.create.mockResolvedValue(newAssignment);

    await store.create(1, "Assignment B");

    expect(store.items).toContainEqual(newAssignment);
  });

  it("should update an assignment", async () => {
    store.items = [{ id: 1, period_id: 1, title: "Assignment A" }];
    const updated = { id: 1, period_id: 1, title: "Assignment A Updated" };
    mockService.update.mockResolvedValue(updated);

    await store.updateItem(1, "Assignment A Updated");

    expect(store.items[0].title).toBe("Assignment A Updated");
  });

  it("should delete an assignment", async () => {
    store.items = [{ id: 1, period_id: 1, title: "Assignment A" }];
    mockService.delete.mockResolvedValue(undefined);

    await store.deleteItem(1);

    expect(store.items).toHaveLength(0);
  });

  it("should reset", async () => {
    store.items = [{ id: 1, period_id: 1, title: "Assignment A" }];
    store.loaded = true;

    store.reset();

    expect(store.items).toHaveLength(0);
    expect(store.loaded).toBe(false);
  });
});
