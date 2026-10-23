import { describe, it, expect, vi, beforeEach } from "vitest";

import { EnrollmentsStore } from "./enrollments.svelte";

const enrollment = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  person_id: 1,
  subject_period_id: 1,
  commission_id: 1 as number | null,
  name: "Alumno A",
  legajo: "LEG-1",
  ...overrides,
});

describe("EnrollmentsStore", () => {
  let store: EnrollmentsStore;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      getRoster: vi.fn(),
      getPending: vi.fn(),
      register: vi.fn(),
      assignCommission: vi.fn(),
      remove: vi.fn(),
    };
    store = new EnrollmentsStore(mockService);
  });

  it("loads the roster of a commission", async () => {
    mockService.getRoster.mockResolvedValue([enrollment()]);

    await store.load(1);

    expect(mockService.getRoster).toHaveBeenCalledWith(1);
    expect(store.items).toHaveLength(1);
    expect(store.loaded).toBe(true);
  });

  it("registers enrollments, then reloads roster and pending list", async () => {
    mockService.register.mockResolvedValue({ created: 1, reused: 0, enrollments: [] });
    mockService.getRoster.mockResolvedValue([enrollment()]);
    mockService.getPending.mockResolvedValue([]);

    const report = await store.register(1, [{ name: "Alumno A" }], 1);

    expect(report.created).toBe(1);
    expect(mockService.getRoster).toHaveBeenCalledWith(1);
    expect(mockService.getPending).toHaveBeenCalledWith(1);
    expect(store.items).toHaveLength(1);
  });

  it("does not reload the roster when registering without a commission", async () => {
    mockService.register.mockResolvedValue({ created: 1, reused: 0, enrollments: [] });
    mockService.getPending.mockResolvedValue([enrollment({ commission_id: null })]);

    await store.register(1, [{ name: "Alumno A" }]);

    expect(mockService.getRoster).not.toHaveBeenCalled();
    expect(store.pending).toHaveLength(1);
  });

  it("moves an enrollment out of the pending list when assigned", async () => {
    store.pending = [enrollment({ commission_id: null }) as any];
    mockService.assignCommission.mockResolvedValue(enrollment({ commission_id: 2 }));

    await store.assignCommission(1, 2);

    expect(mockService.assignCommission).toHaveBeenCalledWith(1, 2);
    expect(store.pending).toHaveLength(0);
  });

  it("deletes an enrollment from both lists", async () => {
    store.items = [enrollment() as any];
    store.pending = [enrollment({ id: 2 }) as any];
    mockService.remove.mockResolvedValue(undefined);

    await store.deleteItem(1);

    expect(mockService.remove).toHaveBeenCalledWith(1);
    expect(store.items).toHaveLength(0);
    expect(store.pending).toHaveLength(1);
  });
});
