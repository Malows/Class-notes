import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { notificationsStore } from "./notifications.svelte";

describe("NotificationsStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    notificationsStore.items = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should add a success toast and auto-dismiss it", () => {
    notificationsStore.addSuccess("Success message");
    expect(notificationsStore.items).toHaveLength(1);
    expect(notificationsStore.items[0]).toEqual(
      expect.objectContaining({
        message: "Success message",
        type: "success",
        autoDismiss: true,
      }),
    );

    // Fast-forward time to trigger auto-dismissal
    vi.runAllTimers();
    expect(notificationsStore.items).toHaveLength(0);
  });

  it("should add an error toast that does not auto-dismiss", () => {
    notificationsStore.addError("Error message");
    expect(notificationsStore.items).toHaveLength(1);
    expect(notificationsStore.items[0]).toEqual(
      expect.objectContaining({
        message: "Error message",
        type: "error",
        autoDismiss: false,
      }),
    );

    vi.advanceTimersByTime(10000);
    expect(notificationsStore.items).toHaveLength(1); // Still on screen
  });

  it("should add a warning toast that does not auto-dismiss", () => {
    notificationsStore.addWarning("Warning message");
    expect(notificationsStore.items).toHaveLength(1);
    expect(notificationsStore.items[0]).toEqual(
      expect.objectContaining({
        message: "Warning message",
        type: "warning",
        autoDismiss: false,
      }),
    );

    vi.advanceTimersByTime(10000);
    expect(notificationsStore.items).toHaveLength(1); // Still on screen
  });

  it("should dismiss a toast by ID", () => {
    notificationsStore.addError("Error message");
    const targetId = notificationsStore.items[0].id;

    notificationsStore.dismiss(targetId);
    expect(notificationsStore.items).toHaveLength(0);
  });
});
