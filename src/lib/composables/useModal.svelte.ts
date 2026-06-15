import type { ModalMode } from "$lib/types";

export class ModalManager<T> {
  mode = $state<ModalMode>(null);
  target = $state<T | null>(null);

  openCreate() {
    this.mode = "create";
    this.target = null;
  }

  openEdit(elem: T) {
    this.mode = "edit";
    this.target = elem;
  }

  openDelete(elem: T) {
    this.mode = "delete";
    this.target = elem;
  }

  close() {
    this.mode = null;
    this.target = null;
  }

  get isOpen() {
    return this.mode !== null;
  }
  get isCreate() {
    return this.mode === "create";
  }
  get isEdit() {
    return this.mode === "edit";
  }
  get isDelete() {
    return this.mode === "delete";
  }
}
