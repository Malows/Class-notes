import { describe, it, expect, vi, beforeEach } from "vitest";
import { StudentsStore } from "./students.svelte";

describe("StudentsStore", () => {
  let store: StudentsStore;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    store = new StudentsStore(mockService);
  });

  it("should load students", async () => {
    const mockData = [{ id: 1, commission_id: 1, name: "Student A", external_id: "" }];
    mockService.getAll.mockResolvedValue(mockData);

    await store.load(1);

    expect(store.items).toEqual(mockData);
  });

  it("should create students and reload", async () => {
    const mockData = [{ id: 1, commission_id: 1, name: "Student A", external_id: "" }];
    mockService.create.mockResolvedValue(undefined);
    mockService.getAll.mockResolvedValue(mockData);

    await store.create(1, ["Student A"]);

    expect(store.items).toEqual(mockData);
  });

  it("should update a student", async () => {
    store.items = [{ id: 1, commission_id: 1, name: "Student A", external_id: "" }];
    const updated = { id: 1, commission_id: 1, name: "Student A Updated", external_id: "" };
    mockService.update.mockResolvedValue(updated);

    await store.updateItem(1, "Student A Updated");

    expect(store.items[0].name).toBe("Student A Updated");
  });

  it("should delete a student and remove from store", async () => {
    store.items = [{ id: 1, commission_id: 1, name: "Student A", external_id: "" }];
    mockService.delete.mockResolvedValue(undefined);

    await store.deleteItem(1);

    expect(store.items).toHaveLength(0);
  });
});
