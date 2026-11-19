import { commissionService } from "$lib/client/services/commission.service";
import type { Commission } from "$lib/common/types/academic";

export class CommissionsStore {
  items = $state<Commission[]>([]);
  loaded = $state(false);
  // Concurrent cold-load callers share one request.
  #pending: Promise<void> | null = null;

  constructor(private service = commissionService) {}

  // O(1) lookups cached
  map = $derived.by(() => new Map(this.items.map((i) => [i.id, i])));
  bySlug = $derived.by(() =>
    new Map(this.items.map((i) => [`${i.subject_id}:${i.period_id}:${i.slug}`, i])),
  );

  findInScope(subjectId: number, periodId: number, slug: string): Commission | undefined {
    return this.bySlug.get(`${subjectId}:${periodId}:${slug}`);
  }

  async load() {
    if (this.loaded) return;
    this.#pending ??= (async () => {
      try {
        this.items = await this.service.getAll();
        this.loaded = true;
      } finally {
        this.#pending = null;
      }
    })();
    return this.#pending;
  }

  async create(subjectId: number, periodId: number, name: string) {
    const newItem = await this.service.create(subjectId, periodId, name);
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
