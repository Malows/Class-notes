import { describe, it, expect, vi, beforeEach } from "vitest";
import { FacultiesStore } from "./faculties.svelte";

describe("FacultiesStore", () => {
  let store: FacultiesStore;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    store = new FacultiesStore(mockService);
  });

  it("should load faculties", async () => {
    const mockData = [{ id: 1, name: "Facultad A" }];
    mockService.getAll.mockResolvedValue(mockData);

    await store.load();

    expect(store.items).toEqual(mockData);
    expect(mockService.getAll).toHaveBeenCalledTimes(1);
  });

  it("should not reload if already loaded", async () => {
    const mockData = [{ id: 1, name: "Facultad A" }];
    mockService.getAll.mockResolvedValue(mockData);

    await store.load();
    await store.load();

    expect(mockService.getAll).toHaveBeenCalledTimes(1);
  });

  it("should create a new faculty and update store", async () => {
    const newFaculty = { id: 2, name: "Facultad B" };
    mockService.create.mockResolvedValue(newFaculty);

    await store.create("Facultad B");

    expect(store.items).toContainEqual(newFaculty);
    expect(mockService.create).toHaveBeenCalledWith("Facultad B");
  });

  it("should update an existing faculty", async () => {
    store.items = [{ id: 1, name: "Facultad A" }];
    const updatedFaculty = { id: 1, name: "Facultad A Updated" };
    mockService.update.mockResolvedValue(updatedFaculty);

    await store.updateItem(1, "Facultad A Updated");

    expect(store.items[0].name).toBe("Facultad A Updated");
    expect(mockService.update).toHaveBeenCalledWith(1, "Facultad A Updated");
  });

  it("should delete a faculty", async () => {
    store.items = [{ id: 1, name: "Facultad A" }];
    mockService.delete.mockResolvedValue(undefined);

    await store.deleteItem(1);

    expect(store.items).toHaveLength(0);
    expect(mockService.delete).toHaveBeenCalledWith(1);
  });

  it("should reset state", async () => {
    store.items = [{ id: 1, name: "Facultad A" }];
    store.loaded = true;

    store.reset();

    expect(store.items).toHaveLength(0);
    expect(store.loaded).toBe(false);
  });
});
