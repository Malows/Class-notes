import { apiFetch } from "../api";
import type { OverviewData, GlobalStats, PendingSummary } from "../types";

export const overviewService = {
  get: (commission_id: number) =>
    apiFetch<OverviewData>(`/overview?commission_id=${commission_id}`),
  getForCommission: (commission_id: number) =>
    apiFetch<OverviewData>(`/overview?commission_id=${commission_id}`),
  getForPeriod: (period_id: number) => apiFetch<OverviewData>(`/overview?period_id=${period_id}`),
  getPendingSummary: () => apiFetch<PendingSummary[]>("/overview/pending"),
  getGlobalStats: () => apiFetch<GlobalStats>("/overview/stats"),
};
