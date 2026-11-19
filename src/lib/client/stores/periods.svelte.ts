import { periodService } from "$lib/client/services/period.service";
import type { Period } from "$lib/common/types/academic";

export class PeriodsStore {
  items = $state<Period[]>([]);
  // Concurrent cold-load callers for the same scope share one request.
  #pending = new Map<string, Promise<void>>();

  constructor(private service = periodService) {}

  // O(1) lookup cached
  map = $derived.by(() => new Map(this.items.map((i) => [i.id, i])));

  async load(subjectId?: number) {
    const key = subjectId === undefined ? "all" : String(subjectId);
    const inFlight = this.#pending.get(key);
    if (inFlight) return inFlight;

    const request = (async () => {
      try {
        this.items = await this.service.getAll(subjectId);
      } finally {
        this.#pending.delete(key);
      }
    })();
    this.#pending.set(key, request);
    return request;
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
