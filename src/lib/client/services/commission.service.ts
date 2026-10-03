import { apiFetch } from "$lib/client/services/api";
import type { Commission } from "$lib/common/types/academic";

export const commissionService = {
  getAll: () => apiFetch<Commission[]>("/commissions"),
  create: (subject_id: number, period_id: number, name: string) =>
    apiFetch<Commission>("/commissions", {
      method: "POST",
      body: JSON.stringify({ subject_id, period_id, name }),
    }),
  update: (id: number, name: string) =>
    apiFetch<Commission>(`/commissions/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    }),
  delete: (id: number) =>
    apiFetch<void>(`/commissions/${id}`, {
      method: "DELETE",
    }),
};
