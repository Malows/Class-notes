import { apiFetch } from "../api";
import type { Commission } from "../types";

export const commissionService = {
  getAll: () => apiFetch<Commission[]>("/commissions"),
  create: (period_id: number, name: string) =>
    apiFetch<Commission>("/commissions", {
      method: "POST",
      body: JSON.stringify({ period_id, name }),
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
