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
  activePeriodYear?: number;
  activePeriodSemester?: number;
};

type CommissionContext = {
  facultySlug: string;
  subjectSlug: string;
  periodId: number;
  periodYear: number;
  periodSemester: number;
  activeCommissionSlug?: string;
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
  { facultySlug, subjectSlug, activePeriodYear, activePeriodSemester }: PeriodContext,
): SidebarContextLink[] {
  return periods
    .filter((period) => period.subject_slug === subjectSlug)
    .map((period) => ({
      id: period.id,
      href: `/faculties/${facultySlug}/subjects/${subjectSlug}/periods/${period.year}/${period.semester}/commissions`,
      label: `${period.year} - ${period.semester}º`,
      shortLabel: `${period.year % 100}-${period.semester}`,
      isActive: activePeriodYear === period.year && activePeriodSemester === period.semester,
    }));
}

export function buildCommissionItems(
  commissions: Commission[],
  {
    facultySlug,
    subjectSlug,
    periodId,
    periodYear,
    periodSemester,
    activeCommissionSlug,
  }: CommissionContext,
): SidebarContextLink[] {
  return commissions
    .filter((commission) => commission.period_id === periodId)
    .map((commission) => ({
      id: commission.id,
      href: `/faculties/${facultySlug}/subjects/${subjectSlug}/periods/${periodYear}/${periodSemester}/commissions/${commission.slug}/overview`,
      label: commission.name,
      shortLabel: commission.name.substring(0, 2).toUpperCase(),
      isActive: activeCommissionSlug === commission.slug,
    }));
}