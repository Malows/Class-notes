import { page } from "$app/state";
import type { Breadcrumb } from "$lib/types/layout";

export interface NavContext {
  facultyId?: number;
  subjectId?: number;
  periodId?: number;
  commissionId?: number;
}

export class NavStore {
  context = $derived.by(() => {
    const params = page.params;
    const fId = params.faculty_id ? Number(params.faculty_id) : undefined;
    const sId = params.subject_id
      ? Number(params.subject_id)
      : params.id && page.url.pathname.includes("/subjects/")
        ? Number(params.id)
        : undefined;
    const pId = params.period_id
      ? Number(params.period_id)
      : params.id && page.url.pathname.includes("/periods/")
        ? Number(params.id)
        : undefined;
    const cId = params.commission_id
      ? Number(params.commission_id)
      : params.id && page.url.pathname.includes("/commissions/")
        ? Number(params.id)
        : undefined;

    return {
      facultyId: fId,
      subjectId: sId,
      periodId: pId,
      commissionId: cId,
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
    if (pathname.includes("/subjects") && ctx.facultyId) {
      crumbs.push({ key: "layout.subjects", href: `/faculties/${ctx.facultyId}/subjects` });
    }

    // 3. Selected Period subpath
    if (pathname.includes("/periods") && ctx.facultyId && ctx.subjectId) {
      crumbs.push({
        key: "layout.periods",
        href: `/faculties/${ctx.facultyId}/subjects/${ctx.subjectId}/periods`,
      });
    }

    // 4. Selected Commission / Assignments subpaths
    if (ctx.facultyId && ctx.subjectId && ctx.periodId) {
      if (pathname.includes("/commissions")) {
        crumbs.push({
          key: "layout.commissions",
          href: `/faculties/${ctx.facultyId}/subjects/${ctx.subjectId}/periods/${ctx.periodId}/commissions`,
        });
      }
      if (pathname.includes("/assignments")) {
        crumbs.push({
          key: "layout.define_tps",
          href: `/faculties/${ctx.facultyId}/subjects/${ctx.subjectId}/periods/${ctx.periodId}/assignments`,
        });
      }
    }

    // 5. Subpages inside commissions (Overview, Students, Correct)
    if (ctx.facultyId && ctx.subjectId && ctx.periodId && ctx.commissionId) {
      if (pathname.includes("/overview")) {
        crumbs.push({
          key: "layout.overview",
          href: `/faculties/${ctx.facultyId}/subjects/${ctx.subjectId}/periods/${ctx.periodId}/commissions/${ctx.commissionId}/overview`,
        });
      }
      if (pathname.includes("/students")) {
        crumbs.push({
          key: "layout.students_label",
          href: `/faculties/${ctx.facultyId}/subjects/${ctx.subjectId}/periods/${ctx.periodId}/commissions/${ctx.commissionId}/students`,
        });
      }
      if (pathname.includes("/correct")) {
        crumbs.push({ key: "layout.correct", href: pathname });
      }
    }

    return crumbs;
  }
}

export const navStore = new NavStore();
