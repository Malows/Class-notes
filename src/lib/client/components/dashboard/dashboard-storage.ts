/** Local memory for the dashboard: the last academic visit. */

export const LAST_VISIT_KEY = "class-notes:last-visited:v1";

export type AcademicRoute = "overview" | "attendance" | "students" | "correct" | "cursada";

export interface AcademicVisit {
  /** Path plus query, safe to use as a link. */
  href: string;
  pathname: string;
  facultySlug: string;
  subjectSlug: string;
  year: number;
  semester: number;
  commissionSlug?: string;
  route: AcademicRoute;
}

const ACADEMIC_PATH =
  /^\/faculties\/([^/]+)\/subjects\/([^/]+)\/periods\/(\d{4})\/(\d+)(?:\/commissions\/([^/]+))?(\/.*)?$/;

function storage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

function routeFor(rest: string | undefined): AcademicRoute {
  if (!rest) {
    return "cursada";
  }
  if (rest.startsWith("/attendance")) {
    return "attendance";
  }
  if (rest.startsWith("/overview")) {
    return "overview";
  }
  if (rest.startsWith("/students")) {
    return "students";
  }
  if (rest.startsWith("/correct")) {
    return "correct";
  }
  return "cursada";
}

/** Parses an in-app academic href; returns null for anything else. */
export function parseAcademicHref(href: string): AcademicVisit | null {
  if (typeof href !== "string" || !href.startsWith("/faculties/") || href.length > 600) {
    return null;
  }

  const withoutHash = href.split("#")[0];
  const queryIndex = withoutHash.indexOf("?");
  const pathname = queryIndex === -1 ? withoutHash : withoutHash.slice(0, queryIndex);
  const search = queryIndex === -1 ? "" : withoutHash.slice(queryIndex);
  const match = pathname.match(ACADEMIC_PATH);
  if (!match) {
    return null;
  }

  const [, facultySlug, subjectSlug, year, semester, commissionSlug, rest] = match;
  return {
    href: `${pathname}${search}`,
    pathname,
    facultySlug,
    subjectSlug,
    year: Number(year),
    semester: Number(semester),
    commissionSlug,
    route: routeFor(rest),
  };
}

export function readLastVisit(): AcademicVisit | null {
  try {
    const raw = storage()?.getItem(LAST_VISIT_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as { href?: unknown };
    return typeof parsed.href === "string" ? parseAcademicHref(parsed.href) : null;
  } catch {
    return null;
  }
}

export function rememberVisit(href: string): void {
  const visit = parseAcademicHref(href);
  if (!visit) {
    return;
  }
  try {
    storage()?.setItem(
      LAST_VISIT_KEY,
      JSON.stringify({ href: visit.href, savedAt: Date.now() }),
    );
  } catch {
    // Storage is best effort.
  }
}

export function forgetLastVisit(): void {
  try {
    storage()?.removeItem(LAST_VISIT_KEY);
  } catch {
    // Storage is best effort.
  }
}

function handleClick(event: MouseEvent): void {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }
  const anchor = target.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) {
    return;
  }
  if (anchor.hasAttribute("download")) {
    return;
  }
  const linkTarget = anchor.getAttribute("target");
  if (linkTarget && linkTarget !== "_self") {
    return;
  }

  const url = new URL(anchor.href, window.location.origin);
  if (url.origin !== window.location.origin) {
    return;
  }
  rememberVisit(`${url.pathname}${url.search}`);
}

let tracking = false;

/**
 * Listens for in-app academic navigation and remembers the destination.
 * The listener stays alive for the session so the shortcut follows the teacher
 * after leaving the dashboard; call stopVisitTracking only from tests.
 */
export function startVisitTracking(): void {
  if (tracking || typeof document === "undefined") {
    return;
  }
  tracking = true;
  document.addEventListener("click", handleClick, true);
}

export function stopVisitTracking(): void {
  if (!tracking || typeof document === "undefined") {
    return;
  }
  tracking = false;
  document.removeEventListener("click", handleClick, true);
}
