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
  subjects: Subject[];
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

/**
 * Commissions hang off (subject, period), and `periods` are shared by every
 * subject. Filtering by `period_id` alone therefore leaks another subject's
 * commissions into this cursada's list, and the link then points at the
 * current subject with a foreign slug. Scope by both ids and resolve each
 * href from the commission's own subject payload.
 */
export function buildCommissionItems(
  commissions: Commission[],
  {
    subjects,
    facultySlug,
    subjectSlug,
    periodId,
    periodYear,
    periodSemester,
    activeCommissionSlug,
  }: CommissionContext,
): SidebarContextLink[] {
  const currentSubject = subjects.find(
    (subject) => subject.slug === subjectSlug && subject.faculty_slug === facultySlug,
  );

  if (!currentSubject) {
    return [];
  }

  return commissions
    .filter(
      (commission) =>
        commission.period_id === periodId && commission.subject_id === currentSubject.id,
    )
    .map((commission) => {
      const owner =
        subjects.find((subject) => subject.id === commission.subject_id) ?? currentSubject;

      return {
        id: commission.id,
        href: `/faculties/${owner.faculty_slug}/subjects/${owner.slug}/periods/${periodYear}/${periodSemester}/commissions/${commission.slug}/overview`,
        label: commission.name,
        shortLabel: commission.name.substring(0, 2).toUpperCase(),
        isActive: activeCommissionSlug === commission.slug,
      };
    });
}
