import { page } from "$app/state";
import type { Breadcrumb } from "$lib/common/types/layout";

export interface NavContext {
  facultySlug?: string;
  subjectSlug?: string;
  periodYear?: number;
  periodSemester?: number;
  commissionSlug?: string;
}

export class NavStore {
  context = $derived.by(() => {
    const params = page.params;
    const year = params.year ? Number(params.year) : undefined;
    const semester = params.semester ? Number(params.semester) : undefined;

    return {
      facultySlug: params.faculty || undefined,
      subjectSlug: params.subject || undefined,
      periodYear: year,
      periodSemester: semester,
      commissionSlug: params.commission || undefined,
    };
  });

  get breadcrumbs(): Breadcrumb[] {
    const ctx = this.context;
    const crumbs: Breadcrumb[] = [{ key: "layout.home", href: "/" }];
    const pathname = page.url.pathname;

    // 1. Faculties Index / Selected Faculty subpath
    if (pathname.includes("/faculties")) {
      crumbs.push({ key: "layout.faculties", href: "/faculties" });
    }

    // 2. Selected Subject subpath
    if (pathname.includes("/subjects") && ctx.facultySlug) {
      crumbs.push({ key: "layout.subjects", href: `/faculties/${ctx.facultySlug}/subjects` });
    }

    // 3. Selected Period subpath
    if (pathname.includes("/periods") && ctx.facultySlug && ctx.subjectSlug) {
      crumbs.push({
        key: "layout.periods",
        href: `/faculties/${ctx.facultySlug}/subjects/${ctx.subjectSlug}/periods`,
      });
    }

    // 4. Selected Commission / Assignments subpaths
    if (ctx.facultySlug && ctx.subjectSlug && ctx.periodYear && ctx.periodSemester) {
      const periodBase = `/faculties/${ctx.facultySlug}/subjects/${ctx.subjectSlug}/periods/${ctx.periodYear}/${ctx.periodSemester}`;
      if (pathname.includes("/commissions")) {
        crumbs.push({ key: "layout.commissions", href: `${periodBase}/commissions` });
      }
      if (pathname.includes("/assignments")) {
        crumbs.push({ key: "layout.define_tps", href: `${periodBase}/assignments` });
      }
    }

    // 5. Subpages inside commissions (Overview, Students, Correct)
    if (
      ctx.facultySlug &&
      ctx.subjectSlug &&
      ctx.periodYear &&
      ctx.periodSemester &&
      ctx.commissionSlug
    ) {
      const commissionBase = `/faculties/${ctx.facultySlug}/subjects/${ctx.subjectSlug}/periods/${ctx.periodYear}/${ctx.periodSemester}/commissions/${ctx.commissionSlug}`;
      if (pathname.includes("/overview")) {
        crumbs.push({ key: "layout.overview", href: `${commissionBase}/overview` });
      }
      if (pathname.includes("/students")) {
        crumbs.push({ key: "layout.students_label", href: `${commissionBase}/students` });
      }
      if (pathname.includes("/correct")) {
        crumbs.push({ key: "layout.correct", href: pathname });
      }
    }

    return crumbs;
  }
}

export const navStore = new NavStore();