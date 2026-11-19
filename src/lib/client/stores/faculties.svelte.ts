import { facultyService } from "$lib/client/services/faculty.service";
import type { Faculty } from "$lib/common/types/academic";

export class FacultiesStore {
  items = $state<Faculty[]>([]);
  loaded = $state(false);
  // Concurrent cold-load callers share one request.
  #pending: Promise<void> | null = null;

  constructor(private service = facultyService) {}

  // O(1) lookup cached
  map = $derived.by(() => new Map(this.items.map((i) => [i.id, i])));
  bySlug = $derived.by(() => new Map(this.items.map((i) => [i.slug, i])));

  async load(force = false) {
    if (this.loaded && !force) return;
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

  async create(name: string) {
    const newItem = await this.service.create(name);
    this.items.push(newItem);
  }

  async updateItem(id: number, name: string) {
    const updated = await this.service.update(id, name);
    this.items = this.items.map((f) => (f.id === id ? updated : f));
  }

  async deleteItem(id: number) {
    await this.service.delete(id);
    this.items = this.items.filter((f) => f.id !== id);
  }

  reset() {
    this.loaded = false;
    this.items = [];
  }
}

export const facultiesStore = new FacultiesStore();
