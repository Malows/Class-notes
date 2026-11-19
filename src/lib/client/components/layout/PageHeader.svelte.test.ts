import "@testing-library/jest-dom/vitest";
import { render, screen, configure } from "@testing-library/svelte";
import { flushSync, mount, unmount } from "svelte";
import { expect, test, vi } from "vitest";

import { loadTranslations } from "$lib/common/i18n/config";
import { StoreKey } from "$lib/common";

import { CommissionsStore } from "$lib/client/stores/commissions.svelte";
import { FacultiesStore } from "$lib/client/stores/faculties.svelte";
import { PeriodsStore } from "$lib/client/stores/periods.svelte";
import { SubjectsStore } from "$lib/client/stores/subjects.svelte";

let mockParams = $state<Record<string, string>>({});
let mockUrl = $state<URL>(new URL("http://localhost/"));

vi.mock("$app/state", () => {
  return {
    get page() {
      return {
        get params() {
          return mockParams;
        },
        get url() {
          return mockUrl;
        },
      };
    },
  };
});

import PageHeader from "./PageHeader.svelte";

configure({ testIdAttribute: "data-test-id" });

test("renders the title and the optional lead", () => {
  render(PageHeader, {
    title: "Subjects",
    lead: "All subjects of the faculty",
    testId: "page-title",
  });

  expect(screen.getByTestId("page-title")).toHaveTextContent("Subjects");
  expect(document.body.textContent).toContain("All subjects of the faculty");
});

test("keeps the title alone when there is no lead", () => {
  render(PageHeader, { title: "Attendance", testId: "page-title" });

  expect(screen.getByTestId("page-title")).toHaveTextContent("Attendance");
});

const faculties = [{ id: 1, name: "Facultad de Ingeniería", slug: "facultad-de-ingenieria" }];
const subjects = [
  {
    id: 1,
    faculty_id: 1,
    name: "Álgebra Lineal",
    faculty_name: "Facultad de Ingeniería",
    faculty_slug: "facultad-de-ingenieria",
    slug: "algebra-lineal",
  },
];
const periods = [{ id: 3, subject_id: 1, subject_slug: "algebra-lineal", year: 2026, semester: 1 }];
const commissions = [
  {
    id: 4,
    subject_id: 1,
    period_id: 3,
    name: "Comisión Mañana",
    slug: "comision-manana",
    student_count: 0,
  },
];

function buildContext() {
  const facultiesStore = new FacultiesStore();
  facultiesStore.items = faculties;
  const subjectsStore = new SubjectsStore();
  subjectsStore.items = subjects;
  const periodsStore = new PeriodsStore();
  periodsStore.items = periods;
  const commissionsStore = new CommissionsStore();
  commissionsStore.items = commissions;

  return new Map<StoreKey, unknown>([
    [StoreKey.FACULTIES, facultiesStore],
    [StoreKey.SUBJECTS, subjectsStore],
    [StoreKey.PERIODS, periodsStore],
    [StoreKey.COMMISSIONS, commissionsStore],
  ]);
}

test("derives the cursada lead line from the route and the stores", async () => {
  await loadTranslations("en", "/");
  mockParams = {
    faculty: "facultad-de-ingenieria",
    subject: "algebra-lineal",
    year: "2026",
    semester: "1",
    commission: "comision-manana",
  };
  mockUrl = new URL(
    "http://localhost/faculties/facultad-de-ingenieria/subjects/algebra-lineal/periods/2026/1/commissions/comision-manana/attendance",
  );

  const component = mount(PageHeader, {
    target: document.body,
    props: { title: "Attendance", testId: "page-title" },
    context: buildContext(),
  });
  flushSync();

  expect(document.body.querySelector('[data-test-id="page-context"]')?.textContent?.trim()).toBe(
    "Facultad de Ingeniería · Álgebra Lineal · 2026 · Term 1 · Comisión Mañana",
  );

  unmount(component);
  document.body.innerHTML = "";
});

test("an explicit lead still wins over the derived context line", async () => {
  await loadTranslations("en", "/");
  mockParams = { faculty: "facultad-de-ingenieria", subject: "algebra-lineal" };
  mockUrl = new URL(
    "http://localhost/faculties/facultad-de-ingenieria/subjects/algebra-lineal/periods",
  );

  const component = mount(PageHeader, {
    target: document.body,
    props: { title: "Periods", lead: "Custom lead" },
    context: buildContext(),
  });
  flushSync();

  expect(document.body.querySelector('[data-test-id="page-context"]')?.textContent?.trim()).toBe(
    "Custom lead",
  );

  unmount(component);
  document.body.innerHTML = "";
});
