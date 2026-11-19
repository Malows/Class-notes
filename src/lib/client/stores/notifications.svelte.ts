import type { Toast } from "$lib/common/types/layout";

export class NotificationsStore {
  items = $state<Toast[]>([]);
  private nextId = 1;

  addSuccess(message: string) {
    const id = this.nextId++;
    this.items.push({ id, message, type: "success", autoDismiss: true });
    setTimeout(() => this.dismiss(id), 5000);
  }

  addError(message: string) {
    const id = this.nextId++;
    // Errors do NOT auto-dismiss for cognitive pacing compliance (WCAG 2.2.4)
    this.items.push({ id, message, type: "error", autoDismiss: false });
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
    setTimeout(() => this.dismiss(id), duration);
    return id;
  }

  dismiss(id: number) {
    this.items = this.items.filter((item) => item.id !== id);
  }
}

export const notificationsStore = new NotificationsStore();
