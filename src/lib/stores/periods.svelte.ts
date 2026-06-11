import { periodService } from "$lib/services/period.service";
import type { Period } from "$lib/types";

export class PeriodsStore {
  items = $state<Period[]>([]);

  constructor(private service = periodService) {}

  // O(1) lookup cached
  map = $derived.by(() => new Map(this.items.map((i) => [i.id, i])));

  async load(subjectId?: number) {
    this.items = await this.service.getAll(subjectId);
  }

  async create(subjectId: number, year: number, semester: number) {
    const newItem = await this.service.create(subjectId, year, semester);
    this.items.push(newItem);
  }

  async updateItem(id: number, year: number, semester: number) {
    const updated = await this.service.update(id, year, semester);
    this.items = this.items.map((p) => (p.id === id ? updated : p));
  }

  async deleteItem(id: number) {
    await this.service.delete(id);
    this.items = this.items.filter((p) => p.id !== id);
  }
}

export const periodsStore = new PeriodsStore();
