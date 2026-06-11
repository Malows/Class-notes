import { commissionService } from "$lib/services/commission.service";
import type { Commission } from "$lib/types";

export class CommissionsStore {
  items = $state<Commission[]>([]);
  loaded = $state(false);

  constructor(private service = commissionService) {}

  // O(1) lookup cached
  map = $derived.by(() => new Map(this.items.map((i) => [i.id, i])));

  async load() {
    if (this.loaded) return;
    this.items = await this.service.getAll();
    this.loaded = true;
  }

  async create(periodId: number, name: string) {
    const newItem = await this.service.create(periodId, name);
    this.items.push(newItem);
  }

  async updateItem(id: number, name: string) {
    const updated = await this.service.update(id, name);
    this.items = this.items.map((c) => (c.id === id ? updated : c));
  }

  async deleteItem(id: number) {
    await this.service.delete(id);
    this.items = this.items.filter((c) => c.id !== id);
  }
}

export const commissionsStore = new CommissionsStore();
