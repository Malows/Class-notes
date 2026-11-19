import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { notificationsStore } from "$lib/client/stores/notifications.svelte";

import {
  flushPendingDeletions,
  pendingDeletionCount,
  scheduleDeferredDelete,
} from "./deferred-delete";

const config = (overrides: Partial<Parameters<typeof scheduleDeferredDelete>[0]> = {}) => ({
  commit: vi.fn().mockResolvedValue(undefined),
  restore: vi.fn(),
  onError: vi.fn(),
  message: "Comisión borrada",
  undoLabel: "Deshacer",
  ...overrides,
});

describe("scheduleDeferredDelete", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    notificationsStore.items = [];
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("waits for the window before deleting", async () => {
    const options = config();
    scheduleDeferredDelete(options);

    expect(options.commit).not.toHaveBeenCalled();
    expect(pendingDeletionCount()).toBe(1);
    expect(notificationsStore.items).toHaveLength(1);
    expect(notificationsStore.items[0].action?.label).toBe("Deshacer");

    await vi.advanceTimersByTimeAsync(6000);

    expect(options.commit).toHaveBeenCalledTimes(1);
    expect(pendingDeletionCount()).toBe(0);
    expect(notificationsStore.items).toHaveLength(0);
  });

  it("undo cancels the delete and restores the record", async () => {
    const options = config();
    scheduleDeferredDelete(options);

    notificationsStore.items[0].action?.onAction();
    await vi.advanceTimersByTimeAsync(6000);

    expect(options.restore).toHaveBeenCalledTimes(1);
    expect(options.commit).not.toHaveBeenCalled();
    expect(pendingDeletionCount()).toBe(0);
  });

  it("flush commits immediately", async () => {
    const options = config();
    const handle = scheduleDeferredDelete(options);

    await handle.flush();

    expect(options.commit).toHaveBeenCalledTimes(1);
    expect(pendingDeletionCount()).toBe(0);
  });

  it("restores and reports a failed commit", async () => {
    const failure = new Error("network down");
    const options = config({ commit: vi.fn().mockRejectedValue(failure) });
    scheduleDeferredDelete(options);

    await vi.advanceTimersByTimeAsync(6000);

    expect(options.restore).toHaveBeenCalledTimes(1);
    expect(options.onError).toHaveBeenCalledWith(failure);
  });

  it("flushes every pending deletion on navigation", async () => {
    const first = config();
    const second = config();
    scheduleDeferredDelete(first);
    scheduleDeferredDelete(second);

    flushPendingDeletions();
    await vi.runAllTimersAsync();

    expect(first.commit).toHaveBeenCalledTimes(1);
    expect(second.commit).toHaveBeenCalledTimes(1);
    expect(pendingDeletionCount()).toBe(0);
  });
});
