import { page } from "$app/state";

export interface NavContext {
  facultySlug?: string;
  subjectSlug?: string;
  periodYear?: number;
  periodSemester?: number;
  commissionSlug?: string;
}

/**
 * A breadcrumb carries its own identity so the view can resolve a human name
 * from the stores instead of printing the route type.
 */
export type NavCrumbKind = "home" | "section" | "faculty" | "subject" | "period" | "commission";

export interface NavCrumb {
  kind: NavCrumbKind;
  /** i18n key used by section crumbs and as the fallback label. */
  key: string;
  href: string;
  slug?: string;
  year?: number;
  semester?: number;
  label?: string;
  isRaw?: boolean;
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

  get breadcrumbs(): NavCrumb[] {
    const ctx = this.context;
    const pathname = page.url.pathname;
    const crumbs: NavCrumb[] = [];

    // Deep academic pages start at their faculty: the trail names a place,
    // not a route type. Shallow registries still lead back home.
    const inAcademicScope = Boolean(ctx.facultySlug);
    if (!inAcademicScope) {
      crumbs.push({ kind: "home", key: "layout.home", href: "/" });
    }

    if (!inAcademicScope && pathname.includes("/faculties")) {
      crumbs.push({ kind: "section", key: "layout.faculties", href: "/faculties" });
    }

    if (!inAcademicScope && pathname.startsWith("/periods")) {
      crumbs.push({ kind: "section", key: "layout.periods", href: "/periods" });
      if (ctx.periodYear !== undefined && ctx.periodSemester !== undefined) {
        crumbs.push({
          kind: "period",
          key: "layout.period",
          year: ctx.periodYear,
          semester: ctx.periodSemester,
          href: `/periods/${ctx.periodYear}/${ctx.periodSemester}/subjects`,
        });
      }
    }

    if (pathname.startsWith("/persons")) {
      const isDetail = /^\/persons\/[^/]+/.test(pathname);
      crumbs.push(
        isDetail
          ? { kind: "section", key: "persons.detail_title", href: pathname }
          : { kind: "section", key: "persons.index_title", href: "/persons" },
      );
    }

    if (ctx.facultySlug) {
      crumbs.push({
        kind: "faculty",
        key: "layout.faculty",
        slug: ctx.facultySlug,
        href: `/faculties/${ctx.facultySlug}/subjects`,
      });
    }

    if (ctx.facultySlug && !ctx.subjectSlug && pathname.includes("/subjects")) {
      crumbs.push({
        kind: "section",
        key: "layout.subjects",
        href: `/faculties/${ctx.facultySlug}/subjects`,
      });
    }

    if (ctx.facultySlug && ctx.subjectSlug) {
      crumbs.push({
        kind: "subject",
        key: "layout.subject",
        slug: ctx.subjectSlug,
        href: `/faculties/${ctx.facultySlug}/subjects/${ctx.subjectSlug}/periods`,
      });
    }

    if (
      ctx.facultySlug &&
      ctx.subjectSlug &&
      ctx.periodYear !== undefined &&
      ctx.periodSemester !== undefined
    ) {
      const periodBase = `/faculties/${ctx.facultySlug}/subjects/${ctx.subjectSlug}/periods/${ctx.periodYear}/${ctx.periodSemester}`;

      crumbs.push({
        kind: "period",
        key: "layout.period",
        year: ctx.periodYear,
        semester: ctx.periodSemester,
        href: `${periodBase}/commissions`,
      });

      if (pathname.includes("/commissions") && !ctx.commissionSlug) {
        crumbs.push({
          kind: "section",
          key: "layout.commissions",
          href: `${periodBase}/commissions`,
        });
      }
      if (pathname.includes("/assignments")) {
        crumbs.push({
          kind: "section",
          key: "layout.define_tps",
          href: `${periodBase}/assignments`,
        });
      }
      if (!ctx.commissionSlug && pathname.includes("/attendance")) {
        crumbs.push({
          kind: "section",
          key: "attendance.cursada_title",
          href: `${periodBase}/attendance`,
        });
      }
      if (!ctx.commissionSlug && pathname.includes("/overview")) {
        crumbs.push({
          kind: "section",
          key: "periods.period_overview_title",
          href: `${periodBase}/overview`,
        });
      }
    } else if (ctx.subjectSlug && pathname.includes("/periods")) {
      crumbs.push({
        kind: "section",
        key: "layout.periods",
        href: `/faculties/${ctx.facultySlug}/subjects/${ctx.subjectSlug}/periods`,
      });
    }

    if (
      ctx.facultySlug &&
      ctx.subjectSlug &&
      ctx.periodYear !== undefined &&
      ctx.periodSemester !== undefined &&
      ctx.commissionSlug
    ) {
      const commissionBase = `/faculties/${ctx.facultySlug}/subjects/${ctx.subjectSlug}/periods/${ctx.periodYear}/${ctx.periodSemester}/commissions/${ctx.commissionSlug}`;

      crumbs.push({
        kind: "commission",
        key: "layout.commission",
        slug: ctx.commissionSlug,
        href: `${commissionBase}/overview`,
      });

      if (pathname.includes("/overview")) {
        crumbs.push({
          kind: "section",
          key: "layout.overview",
          href: `${commissionBase}/overview`,
        });
      }
      if (pathname.includes("/students")) {
        crumbs.push({
          kind: "section",
          key: "layout.students_label",
          href: `${commissionBase}/students`,
        });
      }
      if (pathname.includes("/correct")) {
        crumbs.push({ kind: "section", key: "layout.correct", href: pathname });
      }
      if (pathname.includes("/attendance/take")) {
        crumbs.push({ kind: "section", key: "attendance.take_title", href: pathname });
      } else if (pathname.includes("/attendance")) {
        crumbs.push({
          kind: "section",
          key: "attendance.commission_title",
          href: `${commissionBase}/attendance`,
        });
      }
    }

    return crumbs;
  }
}

export const navStore = new NavStore();
