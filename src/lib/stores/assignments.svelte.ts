import { assignmentService } from "$lib/services/assignment.service";
import type { Assignment } from "$lib/types";

export class AssignmentsStore {
  items = $state<Assignment[]>([]);
  loaded = $state(false);

  constructor(private service = assignmentService) {}

  // O(1) lookup cached
  map = $derived.by(() => new Map(this.items.map((i) => [i.id, i])));

  async load(periodId?: number) {
    this.items = await this.service.getAll(periodId);
    this.loaded = true;
  }

  async create(periodId: number, title: string) {
    const newItem = await this.service.create(periodId, title);
    this.items.push(newItem);
  }

  async updateItem(id: number, title: string) {
    const updated = await this.service.update(id, title);
    this.items = this.items.map((a) => (a.id === id ? updated : a));
  }

  async deleteItem(id: number) {
    await this.service.delete(id);
    this.items = this.items.filter((a) => a.id !== id);
  }

  reset() {
    this.loaded = false;
    this.items = [];
  }
}

export const assignmentsStore = new AssignmentsStore();
