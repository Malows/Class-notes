import { afterEach, beforeEach, expect, test } from "vitest";

import {
  LAST_VISIT_KEY,
  forgetLastVisit,
  parseAcademicHref,
  readLastVisit,
  rememberVisit,
  startVisitTracking,
  stopVisitTracking,
} from "./dashboard-storage";

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
});

afterEach(() => {
  stopVisitTracking();
  document.body.innerHTML = "";
  localStorage.clear();
});

test("parses a commission route and keeps its query for a correction", () => {
  const visit = parseAcademicHref(
    "/faculties/ingenieria/subjects/algebra-lineal/periods/2025/1/commissions/comision-manana/correct?assignment_id=7",
  );

  expect(visit).toMatchObject({
    facultySlug: "ingenieria",
    subjectSlug: "algebra-lineal",
    year: 2025,
    semester: 1,
    commissionSlug: "comision-manana",
    route: "correct",
    href: "/faculties/ingenieria/subjects/algebra-lineal/periods/2025/1/commissions/comision-manana/correct?assignment_id=7",
  });
});

test("parses a cursada route without a commission", () => {
  expect(
    parseAcademicHref("/faculties/ingenieria/subjects/algebra-lineal/periods/2025/1/overview"),
  ).toMatchObject({ commissionSlug: undefined, route: "overview" });
});

test("rejects routes that are not an academic cursada", () => {
  expect(parseAcademicHref("/faculties")).toBeNull();
  expect(parseAcademicHref("/persons/1")).toBeNull();
  expect(parseAcademicHref("https://example.com/faculties/x")).toBeNull();
  expect(parseAcademicHref("/faculties/x/subjects/y/periods/25/1")).toBeNull();
});

test("remembers, reads and forgets the last visit", () => {
  rememberVisit("/faculties/ingenieria/subjects/algebra-lineal/periods/2025/1/attendance");

  expect(readLastVisit()).toMatchObject({ route: "attendance", year: 2025, semester: 1 });
  expect(JSON.parse(localStorage.getItem(LAST_VISIT_KEY) ?? "{}")).toMatchObject({
    savedAt: expect.any(Number),
  });

  forgetLastVisit();
  expect(readLastVisit()).toBeNull();
});

test("tracks clicks on in-app academic links only", () => {
  startVisitTracking();

  const academic = document.createElement("a");
  academic.href = "/faculties/ingenieria/subjects/algebra-lineal/periods/2025/1/commissions/comision-manana/attendance";
  academic.textContent = "Asistencia";
  academic.addEventListener("click", (event) => event.preventDefault());
  document.body.append(academic);
  academic.click();

  expect(readLastVisit()?.commissionSlug).toBe("comision-manana");

  localStorage.clear();
  const elsewhere = document.createElement("a");
  elsewhere.href = "/persons";
  elsewhere.addEventListener("click", (event) => event.preventDefault());
  document.body.append(elsewhere);
  elsewhere.click();

  expect(readLastVisit()).toBeNull();
});

test("ignores clicks that open a new tab", () => {
  startVisitTracking();

  const external = document.createElement("a");
  external.href = "/faculties/ingenieria/subjects/algebra-lineal/periods/2025/1/attendance";
  external.target = "_blank";
  external.addEventListener("click", (event) => event.preventDefault());
  document.body.append(external);
  external.click();

  expect(readLastVisit()).toBeNull();
});
