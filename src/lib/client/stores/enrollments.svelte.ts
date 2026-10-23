import { enrollmentService } from "$lib/client/services/enrollment.service";
import type { EnrollmentInput, EnrollmentWithPerson } from "$lib/common/types/enrollment";

export class EnrollmentsStore {
  items = $state<EnrollmentWithPerson[]>([]);
  pending = $state<EnrollmentWithPerson[]>([]);
  loaded = $state(false);

  constructor(private service = enrollmentService) {}

  // O(1) lookups cached
  map = $derived.by(() => new Map(this.items.map((item) => [item.id, item])));
  byPerson = $derived.by(() => new Map(this.items.map((item) => [item.person_id, item])));

  async load(commissionId: number) {
    this.items = await this.service.getRoster(commissionId);
    this.loaded = true;
  }

  async loadPending(subjectPeriodId: number) {
    this.pending = await this.service.getPending(subjectPeriodId);
  }

  async register(
    subjectPeriodId: number,
    entries: EnrollmentInput[],
    commissionId?: number | null,
  ) {
    const report = await this.service.register(subjectPeriodId, entries, commissionId);
    if (commissionId !== undefined && commissionId !== null) {
      await this.load(commissionId);
    }
    await this.loadPending(subjectPeriodId);
    return report;
  }

  async assignCommission(id: number, commissionId: number | null) {
    const updated = await this.service.assignCommission(id, commissionId);
    this.pending = this.pending.filter((item) => item.id !== id);
    this.items = this.items.map((item) => (item.id === id ? updated : item));
    return updated;
  }

  async deleteItem(id: number) {
    await this.service.remove(id);
    this.items = this.items.filter((item) => item.id !== id);
    this.pending = this.pending.filter((item) => item.id !== id);
  }
}

export const enrollmentsStore = new EnrollmentsStore();
