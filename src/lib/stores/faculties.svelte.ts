import { facultyService } from "$lib/services/faculty.service";
import type { Faculty } from "$lib/types";

export class FacultiesStore {
  items = $state<Faculty[]>([]);
  loaded = $state(false);

  constructor(private service = facultyService) {}

  async load(force = false) {
    if (this.loaded && !force) return;
    this.items = await this.service.getAll();
    this.loaded = true;
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
