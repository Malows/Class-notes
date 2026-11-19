import { mount, unmount, flushSync } from "svelte";
import { fireEvent } from "@testing-library/svelte";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { StoreKey } from "$lib/common";
import { loadTranslations } from "$lib/common/i18n/config";
import { AttendanceStore } from "$lib/client/stores/attendance.svelte";
import { CommissionsStore } from "$lib/client/stores/commissions.svelte";
import { FacultiesStore } from "$lib/client/stores/faculties.svelte";
import { PeriodsStore } from "$lib/client/stores/periods.svelte";
import { SubjectsStore } from "$lib/client/stores/subjects.svelte";

let mockParams: Record<string, string> = {};

vi.mock("$app/state", () => {
  return {
    get page() {
      return {
        get params() {
          return mockParams;
        },
        get url() {
          return new URL("http://localhost/");
        },
      };
    },
  };
});

const { apiFetchMock } = vi.hoisted(() => ({ apiFetchMock: vi.fn() }));

vi.mock("$lib/client/services/api", () => ({ apiFetch: apiFetchMock }));

import CommissionOverviewPage from "./+page.svelte";

let component: ReturnType<typeof mount>;
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

const overviewData = {
  assignments: [{ id: 10, subject_period_id: 1, title: "TP 1" }],
  grid: [
    {
      id: 1,
      enrollment_id: 1,
      name: "Juan Pérez",
      deliveries: [
        {
          assignment_id: 10,
          enrollment_id: 1,
          grade: 8,
          ai_level: 0,
          comments: "",
          workflow_status: "APPROVED",
        },
      ],
    },
  ],
};

const attendanceData = {
  scope: "commission",
  subject: {
    id: 5,
    name: "Álgebra Lineal",
    slug: "algebra-lineal",
    faculty_slug: "facultad-de-ingenieria",
  },
  period: { id: 2, year: 2025, semester: 1 },
  commission: { id: 1, name: "Comisión Mañana", slug: "comision-manana" },
  commissions: [{ id: 1, name: "Comisión Mañana", slug: "comision-manana" }],
  assignments: [{ id: 10, subject_period_id: 1, title: "TP 1" }],
  rows: [
    {
      enrollment_id: 1,
      person_id: 1,
      name: "Juan Pérez",
      legajo: "ING-001",
      commission_id: 1,
      commission_name: "Comisión Mañana",
      commission_slug: "comision-manana",
      present_count: 1,
      taken_count: 2,
      cells: [],
    },
  ],
  columns: [{ assignment_id: 10, present_count: 1, taken_count: 2 }],
};

const routes: Array<[string, unknown]> = [
  ["/faculties", [{ id: 1, name: "Facultad de Ingeniería", slug: "facultad-de-ingenieria" }]],
  [
    "/subjects",
    [
      {
        id: 5,
        faculty_id: 1,
        name: "Álgebra Lineal",
        slug: "algebra-lineal",
        faculty_name: "Facultad de Ingeniería",
        faculty_slug: "facultad-de-ingenieria",
      },
    ],
  ],
  [
    "/periods",
    [
      {
        id: 2,
        year: 2025,
        semester: 1,
        subject_id: 5,
        subject_period_id: 1,
        subject_name: "Álgebra Lineal",
        subject_slug: "algebra-lineal",
      },
    ],
  ],
  [
    "/commissions",
    [
      {
        id: 1,
        period_id: 2,
        subject_id: 5,
        name: "Comisión Mañana",
        slug: "comision-manana",
        student_count: 1,
      },
    ],
  ],
];

function buildContext() {
  const map = new Map<StoreKey, unknown>();
  map.set(StoreKey.FACULTIES, new FacultiesStore());
  map.set(StoreKey.SUBJECTS, new SubjectsStore());
  map.set(StoreKey.PERIODS, new PeriodsStore());
  map.set(StoreKey.COMMISSIONS, new CommissionsStore());
  map.set(StoreKey.ATTENDANCE, new AttendanceStore());
  return map;
}

function respond(path: string): Promise<unknown> {
  if (path.startsWith("/overview")) return Promise.resolve(overviewData);
  if (path.startsWith("/attendance")) return Promise.resolve(attendanceData);
  const match = routes.find(([prefix]) => path.startsWith(prefix));
  return Promise.resolve(match ? match[1] : []);
}

beforeEach(async () => {
  await loadTranslations("en", "/");
  mockParams = {
    faculty: "facultad-de-ingenieria",
    subject: "algebra-lineal",
    year: "2025",
    semester: "1",
    commission: "comision-manana",
  };
  apiFetchMock.mockImplementation(respond);
});

afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

test("mounts the summary above the grid with grades and attendance", async () => {
  component = mount(CommissionOverviewPage, {
    target: document.body,
    context: buildContext(),
  });
  flushSync();
  await flush();
  flushSync();

  expect(apiFetchMock).toHaveBeenCalledWith("/overview?commission_id=1");
  expect(apiFetchMock).toHaveBeenCalledWith("/attendance?commission_id=1");

  const summary = document.querySelector('[data-test-id="commission-summary"]');
  const grid = document.querySelector('[data-test-id="overview-grid"]');
  expect(summary).not.toBeNull();
  expect(grid).not.toBeNull();
  expect(
    summary!.compareDocumentPosition(grid!) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();

  expect(document.querySelector('[data-test-id="summary-approved"]')?.textContent).toContain(
    "1",
  );
  expect(document.querySelector('[data-test-id="attendance-rate"]')?.textContent).toContain(
    "50%",
  );
  expect(document.body.textContent).toContain("Correct commission");
});

test("an attendance failure leaves the grade summary visible and can be retried", async () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  let attendanceFails = true;

  apiFetchMock.mockImplementation((path: string) => {
    if (path.startsWith("/attendance") && attendanceFails) {
      return Promise.reject(new Error("offline"));
    }
    return respond(path);
  });

  component = mount(CommissionOverviewPage, {
    target: document.body,
    context: buildContext(),
  });
  flushSync();
  await flush();
  flushSync();

  expect(document.querySelector('[data-test-id="summary-approved"]')?.textContent).toContain(
    "1",
  );
  const error = document.querySelector('[data-test-id="attendance-error"]');
  expect(error?.textContent).toContain("Attendance could not be loaded.");

  attendanceFails = false;
  const retry = Array.from(error!.querySelectorAll("button")).find((button) =>
    button.textContent?.includes("Retry"),
  );
  expect(retry).toBeDefined();

  await fireEvent.click(retry!);
  await flush();
  flushSync();

  expect(document.querySelector('[data-test-id="attendance-error"]')).toBeNull();
  expect(document.querySelector('[data-test-id="attendance-rate"]')?.textContent).toContain(
    "50%",
  );
  expect(consoleError).toHaveBeenCalled();
});
