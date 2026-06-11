import { apiFetch } from "../api";
import type { OverviewData, GlobalStats, PendingSummary } from "../types";

export const overviewService = {
  get: (commission_id: number) =>
    apiFetch<OverviewData>(`/overview?commission_id=${commission_id}`),
  getPendingSummary: () => apiFetch<PendingSummary[]>("/overview/pending"),
  getGlobalStats: () => apiFetch<GlobalStats>("/overview/stats"),
};
