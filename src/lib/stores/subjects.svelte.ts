import { subjectService } from "$lib/services/subject.service";
import type { Subject } from "$lib/types";

export class SubjectsStore {
  items = $state<Subject[]>([]);
  loaded = $state(false);

  constructor(private service = subjectService) {}

  // O(1) lookup cached
  map = $derived.by(() => new Map(this.items.map((i) => [i.id, i])));
  byFaculty = $derived.by(() => Map.groupBy(this.items, (s) => s.faculty_id));

  async load() {
    if (this.loaded) return;
    this.items = await this.service.getAll();
    this.loaded = true;
  }

  async create(facultyId: number, name: string) {
    const newItem = await this.service.create(facultyId, name);
    this.items.push(newItem);
  }

  async updateItem(id: number, name: string) {
    const updated = await this.service.update(id, name);
    this.items = this.items.map((s) => (s.id === id ? updated : s));
  }

  async deleteItem(id: number) {
    await this.service.delete(id);
    this.items = this.items.filter((s) => s.id !== id);
  }
}

export const subjectsStore = new SubjectsStore();
