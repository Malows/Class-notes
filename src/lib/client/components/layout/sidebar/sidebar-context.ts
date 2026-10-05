import type { Commission, Period, Subject } from "$lib/common";

export type SidebarContextLink = {
  id: number;
  href: string;
  label: string;
  shortLabel: string;
  isActive: boolean;
};

type SubjectContext = {
  facultySlug: string;
  activeSubjectSlug?: string;
};

type PeriodContext = {
  facultySlug: string;
  subjectSlug: string;
  activePeriodId?: number;
};

type CommissionContext = {
  facultySlug: string;
  subjectSlug: string;
  periodId: number;
  activeCommissionId?: number;
};

export function buildSubjectItems(
  subjects: Subject[],
  { facultySlug, activeSubjectSlug }: SubjectContext,
): SidebarContextLink[] {
  return subjects
    .filter((subject) => subject.faculty_slug === facultySlug)
    .map((subject) => ({
      id: subject.id,
      href: `/faculties/${subject.faculty_slug}/subjects/${subject.slug}/periods`,
      label: subject.name,
      shortLabel: subject.name.substring(0, 2).toUpperCase(),
      isActive: activeSubjectSlug === subject.slug,
    }));
}

export function buildPeriodItems(
  periods: Period[],
  { facultySlug, subjectSlug, activePeriodId }: PeriodContext,
): SidebarContextLink[] {
  return periods
    .filter((period) => period.subject_slug === subjectSlug)
    .map((period) => ({
      id: period.id,
      href: `/faculties/${facultySlug}/subjects/${subjectSlug}/periods/${period.id}/commissions`,
      label: `${period.year} - ${period.semester}º`,
      shortLabel: `${period.year % 100}-${period.semester}`,
      isActive: activePeriodId === period.id,
    }));
}

export function buildCommissionItems(
  commissions: Commission[],
  { facultySlug, subjectSlug, periodId, activeCommissionId }: CommissionContext,
): SidebarContextLink[] {
  return commissions
    .filter((commission) => commission.period_id === periodId)
    .map((commission) => ({
      id: commission.id,
      href: `/faculties/${facultySlug}/subjects/${subjectSlug}/periods/${periodId}/commissions/${commission.id}/overview`,
      label: commission.name,
      shortLabel: commission.name.substring(0, 2).toUpperCase(),
      isActive: activeCommissionId === commission.id,
    }));
}
