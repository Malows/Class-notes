import { apiFetch } from "$lib/client/services/api";
import { RegisterEnrollmentsSchema } from "$lib/common/schemas";
import type {
  CursadaRoster,
  EnrollmentInput,
  EnrollmentRegistrationReport,
  EnrollmentWithPerson,
} from "$lib/common/types/enrollment";

export const enrollmentService = {
  getRoster: (commission_id: number) =>
    apiFetch<EnrollmentWithPerson[]>(`/enrollments?commission_id=${commission_id}`),
  getPending: (subject_period_id: number) =>
    apiFetch<EnrollmentWithPerson[]>(
      `/enrollments?subject_period_id=${subject_period_id}&pending=true`,
    ),
  getCursadaRoster: (subject_id: number, period_id: number) =>
    apiFetch<CursadaRoster>(`/periods/${period_id}/subjects/${subject_id}/students`),
  getByCursada: (subject_period_id: number) =>
    apiFetch<EnrollmentWithPerson[]>(`/enrollments?subject_period_id=${subject_period_id}`),
  register: (
    subject_period_id: number,
    entries: EnrollmentInput[],
    commission_id?: number | null,
  ) => {
    const validated = RegisterEnrollmentsSchema.parse({
      subject_period_id,
      commission_id: commission_id ?? null,
      entries,
    });

    return apiFetch<EnrollmentRegistrationReport>("/enrollments", {
      method: "POST",
      body: JSON.stringify(validated),
    });
  },
  assignCommission: (id: number, commission_id: number | null) =>
    apiFetch<EnrollmentWithPerson>(`/enrollments/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ commission_id }),
    }),
  remove: (id: number) =>
    apiFetch<void>(`/enrollments/${id}`, {
      method: "DELETE",
    }),
};
