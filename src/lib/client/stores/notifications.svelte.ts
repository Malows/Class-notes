import type { Toast } from "$lib/common/types/layout";

export class NotificationsStore {
  items = $state<Toast[]>([]);
  private nextId = 1;
  #timers = new Map<number, ReturnType<typeof setTimeout>>();
  #durations = new Map<number, number>();

  #scheduleDismiss(id: number, duration: number) {
    this.#durations.set(id, duration);
    this.#timers.set(
      id,
      setTimeout(() => this.dismiss(id), duration),
    );
  }

  /** Keeps a toast alive while focus is inside it. */
  pause(id: number) {
    const timer = this.#timers.get(id);
    if (!timer) return;
    clearTimeout(timer);
    this.#timers.delete(id);
  }

  /** Restarts the window after focus leaves the toast. */
  resume(id: number) {
    if (!this.items.some((item) => item.id === id) || this.#timers.has(id)) return;
    this.#scheduleDismiss(id, this.#durations.get(id) ?? 5000);
  }

  addSuccess(message: string) {
    const id = this.nextId++;
    this.items.push({ id, message, type: "success", autoDismiss: true });
    this.#scheduleDismiss(id, 5000);
  }

  addError(message: string) {
    const id = this.nextId++;
    // Errors do NOT auto-dismiss for cognitive pacing compliance (WCAG 2.2.4)
    this.items.push({ id, message, type: "error", autoDismiss: false });
  }

  /** A persistent error with one recovery action (for example, Retry). */
  addErrorAction(message: string, action: { label: string; onAction: () => void }) {
    const id = this.nextId++;
    let used = false;
    this.items.push({
      id,
      message,
      type: "error",
      autoDismiss: false,
      action: {
        label: action.label,
        onAction: () => {
          if (used) return;
          used = true;
          this.dismiss(id);
          action.onAction();
        },
      },
    });
    return id;
  }

  addWarning(message: string) {
    const id = this.nextId++;
    // Warnings do NOT auto-dismiss
    this.items.push({ id, message, type: "warning", autoDismiss: false });
  }

  /**
   * A transient message with one inline action (for example, Undo). The action
   * runs at most once; the toast then dismisses itself.
   */
  addAction(
    message: string,
    action: { label: string; onAction: () => void },
    duration = 6000,
  ) {
    const id = this.nextId++;
    let used = false;
    this.items.push({
      id,
      message,
      type: "success",
      autoDismiss: true,
      action: {
        label: action.label,
        onAction: () => {
          if (used) return;
          used = true;
          this.dismiss(id);
          action.onAction();
        },
      },
    });
    this.#scheduleDismiss(id, duration);
    return id;
  }

  dismiss(id: number) {
    const timer = this.#timers.get(id);
    if (timer) clearTimeout(timer);
    this.#timers.delete(id);
    this.#durations.delete(id);
    this.items = this.items.filter((item) => item.id !== id);
  }
}

export const notificationsStore = new NotificationsStore();
