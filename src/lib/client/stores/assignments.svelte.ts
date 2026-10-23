import { assignmentService } from "$lib/client/services/assignment.service";
import type { Assignment } from "$lib/common/types/academic";

export class AssignmentsStore {
  items = $state<Assignment[]>([]);
  loaded = $state(false);

  constructor(private service = assignmentService) {}

  // O(1) lookup cached
  map = $derived.by(() => new Map(this.items.map((i) => [i.id, i])));

  async load(subjectPeriodId?: number) {
    this.items = await this.service.getAll(subjectPeriodId);
    this.loaded = true;
  }

  async create(subjectPeriodId: number, title: string, subtitle?: string, workflowStatus?: string) {
    const newItem = await this.service.create(subjectPeriodId, title, subtitle, workflowStatus);
    this.items.push(newItem);
  }

  async updateItem(id: number, title: string, subtitle?: string) {
    const updated = await this.service.update(id, title, subtitle);
    this.items = this.items.map((a) => (a.id === id ? updated : a));
  }

  async updateStatus(id: number, status: string) {
    await this.service.updateStatus(id, status);
    this.items = this.items.map((a) => {
      if (a.id === id) {
        return { ...a, workflow_status: status as any };
      }
      return a;
    });
  }

  async copy(sourceSubjectPeriodId: number, targetSubjectPeriodId: number) {
    await this.service.copy(sourceSubjectPeriodId, targetSubjectPeriodId);
    await this.load(targetSubjectPeriodId);
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
