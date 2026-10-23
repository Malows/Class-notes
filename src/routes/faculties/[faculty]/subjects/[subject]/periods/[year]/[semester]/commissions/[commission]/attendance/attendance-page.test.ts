import { mount, unmount, flushSync } from "svelte";
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

import CommissionAttendancePage from "./+page.svelte";

let component: ReturnType<typeof mount>;
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

const grid = {
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
      is_guest: false,
      present_count: 1,
      taken_count: 1,
      cells: [
        {
          assignment_id: 10,
          enrollment_id: 1,
          status: "PRESENT",
          recorded_on: "2026-10-23",
          commission_id: 1,
        },
      ],
    },
  ],
  columns: [{ assignment_id: 10, present_count: 1, taken_count: 1 }],
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
  ["/attendance", grid],
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

beforeEach(async () => {
  await loadTranslations("es", "/");
  mockParams = {
    faculty: "facultad-de-ingenieria",
    subject: "algebra-lineal",
    year: "2025",
    semester: "1",
    commission: "comision-manana",
  };
  apiFetchMock.mockImplementation((path: string) => {
    const match = routes.find(([prefix]) => path.startsWith(prefix));
    return Promise.resolve(match ? match[1] : []);
  });
});

afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

test("renders the attendance grid of the commission", async () => {
  component = mount(CommissionAttendancePage, {
    target: document.body,
    context: buildContext(),
  });
  flushSync();
  await flush();
  flushSync();

  expect(apiFetchMock).toHaveBeenCalledWith("/attendance?commission_id=1");
  expect(document.body.textContent).toContain("Asistencia");
  expect(document.body.textContent).toContain("Juan Pérez");
  expect(document.querySelector('[data-test-id="attendance-cell-1-10"]')).not.toBeNull();
});
