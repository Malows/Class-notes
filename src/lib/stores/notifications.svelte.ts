export interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "warning";
  autoDismiss: boolean;
}

export class NotificationsStore {
  items = $state<Toast[]>([]);
  private nextId = 1;

  addSuccess(message: string) {
    const id = this.nextId++;
    this.items.push({ id, message, type: "success", autoDismiss: true });
    setTimeout(() => this.dismiss(id), 500000);
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

  dismiss(id: number) {
    this.items = this.items.filter((item) => item.id !== id);
  }
}

export const notificationsStore = new NotificationsStore();
