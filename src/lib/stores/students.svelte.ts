import { studentService } from "$lib/services/student.service";
import type { Student } from "$lib/types";

export class StudentsStore {
  items = $state<Student[]>([]);
  loaded = $state(false);

  constructor(private service = studentService) {}

  // O(1) lookup cached
  map = $derived.by(() => new Map(this.items.map((i) => [i.id, i])));

  async load(commissionId?: number) {
    this.items = await this.service.getAll(commissionId);
    this.loaded = true;
  }

  async create(commissionId: number, names: string[]) {
    await this.service.create(commissionId, names);
    // Recargar tras creación bulk
    await this.load(commissionId);
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

export const studentsStore = new StudentsStore();
