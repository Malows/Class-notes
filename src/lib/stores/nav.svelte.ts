import { page } from "$app/state";
import type { Breadcrumb } from "$lib/types/layout";

import { commissionsStore } from "./commissions.svelte";
import { facultiesStore } from "./faculties.svelte";
import { periodsStore } from "./periods.svelte";
import { subjectsStore } from "./subjects.svelte";

export interface NavContext {
  facultyId?: number;
  subjectId?: number;
  periodId?: number;
  commissionId?: number;
  facultyName?: string;
  subjectName?: string;
  periodName?: string;
  commissionName?: string;
}

export class NavStore {
  // Usamos $derived para que se recalcule automáticamente cuando page o stores cambien
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

    // Disparar carga de datos si es necesario (efectos secundarios en $derived.by)
    // Nota: esto es un patrón aceptable en Svelte 5 para sincronización de datos
    if (fId && !facultiesStore.loaded) facultiesStore.load();
    if (sId && !subjectsStore.loaded) subjectsStore.load();
    if (pId && periodsStore.items.length === 0) periodsStore.load(sId);
    if (cId && !commissionsStore.loaded) commissionsStore.load();

    const faculty = facultiesStore.map.get(fId);
    const subject = subjectsStore.map.get(sId);
    const period = periodsStore.map.get(pId);
    const commission = commissionsStore.map.get(cId);

    return {
      facultyId: fId,
      subjectId: sId,
      periodId: pId,
      commissionId: cId,
      facultyName: faculty?.name,
      subjectName: subject?.name,
      periodName: period ? `${period.year} - ${period.semester}º` : undefined,
      commissionName: commission?.name,
    };
  });

  get breadcrumbs(): Breadcrumb[] {
    const ctx = this.context;
    const crumbs: Breadcrumb[] = [{ key: "layout.home", href: "/" }];

    if (ctx.facultyId && ctx.facultyName) {
      crumbs.push({
        key: ctx.facultyName,
        href: `/faculties/${ctx.facultyId}`,
        isRaw: true,
      });
    } else if (page.url.pathname.startsWith("/faculties")) {
      crumbs.push({ key: "layout.faculties", href: "/faculties" });
    }

    if (ctx.subjectId && ctx.subjectName) {
      const fPath = ctx.facultyId ? `/faculties/${ctx.facultyId}` : "";
      crumbs.push({
        key: ctx.subjectName,
        href: `${fPath}/subjects/${ctx.subjectId}`,
        isRaw: true,
      });
    } else if (page.url.pathname.includes("/subjects")) {
      crumbs.push({ key: "layout.subjects", href: "/subjects" });
    }

    if (ctx.periodId && ctx.periodName) {
      const sPath = ctx.subjectId ? `/subjects/${ctx.subjectId}` : "";
      crumbs.push({
        key: ctx.periodName,
        href: `${sPath}/periods/${ctx.periodId}`,
        isRaw: true,
      });
    }

    if (ctx.commissionId && ctx.commissionName) {
      const pPath = ctx.periodId ? `/periods/${ctx.periodId}` : "";
      crumbs.push({
        key: ctx.commissionName,
        href: `${pPath}/commissions/${ctx.commissionId}`,
        isRaw: true,
      });
    }

    if (page.url.pathname.endsWith("/overview"))
      crumbs.push({ key: "layout.overview", href: page.url.pathname });
    if (page.url.pathname.endsWith("/students"))
      crumbs.push({ key: "layout.students_label", href: page.url.pathname });

    return crumbs;
  }
}

export const navStore = new NavStore();
