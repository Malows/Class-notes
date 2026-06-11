import type { Commission, Period, Subject } from "$lib/types";

export type SidebarContextLink = {
  id: number;
  href: string;
  label: string;
  shortLabel: string;
  isActive: boolean;
};

type SubjectContext = {
  facultyId: number;
  activeSubjectId?: number;
};

type PeriodContext = {
  facultyId: number;
  subjectId: number;
  activePeriodId?: number;
};

type CommissionContext = {
  facultyId: number;
  subjectId: number;
  periodId: number;
  activeCommissionId?: number;
};

export function buildSubjectItems(
  subjects: Subject[],
  { facultyId, activeSubjectId }: SubjectContext,
): SidebarContextLink[] {
  return subjects
    .filter((subject) => subject.faculty_id === facultyId)
    .map((subject) => ({
      id: subject.id,
      href: `/faculties/${facultyId}/subjects/${subject.id}/periods`,
      label: subject.name,
      shortLabel: subject.name.substring(0, 2).toUpperCase(),
      isActive: activeSubjectId === subject.id,
    }));
}

export function buildPeriodItems(
  periods: Period[],
  { facultyId, subjectId, activePeriodId }: PeriodContext,
): SidebarContextLink[] {
  return periods
    .filter((period) => period.subject_id === subjectId)
    .map((period) => ({
      id: period.id,
      href: `/faculties/${facultyId}/subjects/${subjectId}/periods/${period.id}/commissions`,
      label: `${period.year} - ${period.semester}º`,
      shortLabel: `${period.year % 100}-${period.semester}`,
      isActive: activePeriodId === period.id,
    }));
}

export function buildCommissionItems(
  commissions: Commission[],
  { facultyId, subjectId, periodId, activeCommissionId }: CommissionContext,
): SidebarContextLink[] {
  return commissions
    .filter((commission) => commission.period_id === periodId)
    .map((commission) => ({
      id: commission.id,
      href: `/faculties/${facultyId}/subjects/${subjectId}/periods/${periodId}/commissions/${commission.id}/overview`,
      label: commission.name,
      shortLabel: commission.name.substring(0, 2).toUpperCase(),
      isActive: activeCommissionId === commission.id,
    }));
}
