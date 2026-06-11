import { describe, it, expect, vi, beforeEach } from "vitest";
import { SubjectsStore } from "./subjects.svelte";

describe("SubjectsStore", () => {
  let store: SubjectsStore;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    store = new SubjectsStore(mockService);
  });

  it("should load subjects", async () => {
    const mockData = [{ id: 1, faculty_id: 1, name: "Subject A", faculty_name: "Fac A" }];
    mockService.getAll.mockResolvedValue(mockData);

    await store.load();
    await store.load(); // Test early return

    expect(store.items).toEqual(mockData);
    expect(mockService.getAll).toHaveBeenCalledTimes(1);
  });

  it("should create a new subject", async () => {
    const newSubject = { id: 2, faculty_id: 1, name: "Subject B", faculty_name: "Fac A" };
    mockService.create.mockResolvedValue(newSubject);

    await store.create(1, "Subject B");

    expect(store.items).toContainEqual(newSubject);
  });

  it("should update a subject", async () => {
    store.items = [{ id: 1, faculty_id: 1, name: "Subject A", faculty_name: "Fac A" }];
    const updated = { id: 1, faculty_id: 1, name: "Subject A Updated", faculty_name: "Fac A" };
    mockService.update.mockResolvedValue(updated);

    await store.updateItem(1, "Subject A Updated");

    expect(store.items[0].name).toBe("Subject A Updated");
  });

  it("should delete a subject", async () => {
    store.items = [{ id: 1, faculty_id: 1, name: "Subject A", faculty_name: "Fac A" }];
    mockService.delete.mockResolvedValue(undefined);

    await store.deleteItem(1);

    expect(store.items).toHaveLength(0);
  });
});
