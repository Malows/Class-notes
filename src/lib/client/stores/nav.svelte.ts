import { page } from "$app/state";
import type { Breadcrumb } from "$lib/common/types/layout";

export interface NavContext {
  facultySlug?: string;
  subjectSlug?: string;
  periodId?: number;
  commissionId?: number;
}

export class NavStore {
  context = $derived.by(() => {
    const params = page.params;

    return {
      facultySlug: params.faculty || undefined,
      subjectSlug: params.subject || undefined,
      periodId: params.period_id ? Number(params.period_id) : undefined,
      commissionId: params.commission_id ? Number(params.commission_id) : undefined,
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
    if (ctx.facultySlug && ctx.subjectSlug && ctx.periodId) {
      if (pathname.includes("/commissions")) {
        crumbs.push({
          key: "layout.commissions",
          href: `/faculties/${ctx.facultySlug}/subjects/${ctx.subjectSlug}/periods/${ctx.periodId}/commissions`,
        });
      }
      if (pathname.includes("/assignments")) {
        crumbs.push({
          key: "layout.define_tps",
          href: `/faculties/${ctx.facultySlug}/subjects/${ctx.subjectSlug}/periods/${ctx.periodId}/assignments`,
        });
      }
    }

    // 5. Subpages inside commissions (Overview, Students, Correct)
    if (ctx.facultySlug && ctx.subjectSlug && ctx.periodId && ctx.commissionId) {
      const commissionBase = `/faculties/${ctx.facultySlug}/subjects/${ctx.subjectSlug}/periods/${ctx.periodId}/commissions/${ctx.commissionId}`;
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
