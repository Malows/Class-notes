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
          return new URL("http://localhost/?assignment_id=10");
        },
      };
    },
  };
});

const { apiFetchMock } = vi.hoisted(() => ({ apiFetchMock: vi.fn() }));

vi.mock("$lib/client/services/api", () => ({ apiFetch: apiFetchMock }));

import TakeAttendancePage from "./+page.svelte";

let component: ReturnType<typeof mount>;
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

const rosterRow = (id: number, personId: number, name: string) => ({
  enrollment_id: id,
  person_id: personId,
  name,
  legajo: null,
  commission_id: 1,
  commission_name: "Comisión Mañana",
  commission_slug: "comision-manana",
  present_count: 0,
  taken_count: 0,
  cells: [
    { assignment_id: 10, enrollment_id: id, status: null, recorded_on: null, commission_id: null },
  ],
});

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
  rows: [rosterRow(1, 1, "Juan Pérez"), rosterRow(2, 2, "María Rodríguez")],
  columns: [{ assignment_id: 10, present_count: 0, taken_count: 0 }],
};

// The store mutates the grid it receives, so each test starts from a fresh copy.
const freshGrid = () => structuredClone(grid);
let activeGrid = freshGrid();

const staticRoutes: Array<[string, unknown]> = [
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
        student_count: 2,
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

const key = async (name: string, extra: KeyboardEventInit = {}) => {
  window.dispatchEvent(new KeyboardEvent("keydown", { key: name, bubbles: true, ...extra }));
  flushSync();
  await flush();
  flushSync();
};

beforeEach(async () => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
  Element.prototype.animate = vi.fn(() => ({
    cancel: vi.fn(),
    finish: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as never;
  await loadTranslations("es", "/");
  activeGrid = freshGrid();
  mockParams = {
    faculty: "facultad-de-ingenieria",
    subject: "algebra-lineal",
    year: "2025",
    semester: "1",
    commission: "comision-manana",
  };
  apiFetchMock.mockImplementation((path: string, init?: { method?: string; body?: string }) => {
    if (init?.method === "DELETE") {
      return Promise.resolve(undefined);
    }

    if (init?.method === "POST" && path === "/attendance/bulk") {
      const body = JSON.parse(init.body ?? "{}");
      return Promise.resolve(
        body.entries.map((entry: { enrollment_id: number; status: string }) => ({
          assignment_id: body.assignment_id,
          enrollment_id: entry.enrollment_id,
          subject_period_id: 1,
          commission_id: 1,
          status: entry.status,
          recorded_on: "2026-10-23",
        })),
      );
    }

    if (init?.method === "PUT") {
      const [, , assignmentId, enrollmentId] = path.split("/");
      const body = JSON.parse((init as { body: string }).body);
      return Promise.resolve({
        assignment_id: Number(assignmentId),
        enrollment_id: Number(enrollmentId),
        subject_period_id: 1,
        commission_id: 1,
        status: body.status,
        recorded_on: "2026-10-23",
      });
    }

    const match = staticRoutes.find(([prefix]) => path.startsWith(prefix));
    if (match) return Promise.resolve(match[1]);
    if (path.startsWith("/attendance")) return Promise.resolve(activeGrid);

    return Promise.resolve([]);
  });
});

afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

const mountPage = async () => {
  component = mount(TakeAttendancePage, { target: document.body, context: buildContext() });
  flushSync();
  await flush();
  flushSync();
};

test("walks the roster and records a decision per student", async () => {
  await mountPage();

  expect(document.body.textContent).toContain("Juan Pérez");
  expect(document.querySelector('[data-test-id="take-progress"]')?.textContent).toContain("1 de 2");

  await key("ArrowRight");

  expect(apiFetchMock).toHaveBeenCalledWith("/attendance/10/1", {
    method: "PUT",
    body: JSON.stringify({ status: "PRESENT" }),
  });
  expect(document.body.textContent).toContain("María Rodríguez");

  await key("ArrowLeft");

  expect(apiFetchMock).toHaveBeenCalledWith("/attendance/10/2", {
    method: "PUT",
    body: JSON.stringify({ status: "ABSENT" }),
  });

  const report = document.querySelector('[data-test-id="take-report"]');
  expect(report).not.toBeNull();
  expect(document.querySelector('[data-test-id="take-result-present"]')?.textContent).toContain("1");
  expect(document.querySelector('[data-test-id="take-result-absent"]')?.textContent).toContain("1");
});

test("skips a student without recording anything", async () => {
  await mountPage();

  await key("ArrowUp");

  expect(apiFetchMock).not.toHaveBeenCalledWith(
    expect.stringContaining("/attendance/10/1"),
    expect.objectContaining({ method: "PUT" }),
  );
  expect(document.body.textContent).toContain("María Rodríguez");
});

test("undo restores the previous value and returns to that student", async () => {
  await mountPage();

  await key("ArrowRight");
  expect(document.body.textContent).toContain("María Rodríguez");

  await key("z", { ctrlKey: true });

  expect(apiFetchMock).toHaveBeenCalledWith("/attendance/10/1", { method: "DELETE" });
  expect(document.body.textContent).toContain("Juan Pérez");
});

test("confirms the bulk mark with its count and undoes the whole column in one step", async () => {
  // One student is already present: undoing the bulk must put that back too.
  (activeGrid.rows[0].cells[0] as { status: string | null }).status = "PRESENT";
  activeGrid.columns[0].present_count = 1;
  activeGrid.columns[0].taken_count = 1;

  await mountPage();

  const markAll = document.querySelector('[data-test-id="take-all-present"]') as HTMLElement;
  markAll.click();
  flushSync();

  // Nothing is written before confirming, and the question states the count.
  expect(apiFetchMock).not.toHaveBeenCalledWith("/attendance/bulk", expect.anything());
  expect(document.body.textContent).toContain("Marcar 2 presentes");

  const confirm = document.querySelector(
    '[data-test-id="confirm-dialog-confirm-btn"]',
  ) as HTMLElement;
  confirm.click();
  flushSync();
  await flush();
  flushSync();

  expect(apiFetchMock).toHaveBeenCalledWith("/attendance/bulk", {
    method: "POST",
    body: JSON.stringify({
      assignment_id: 10,
      entries: [
        { enrollment_id: 1, status: "PRESENT" },
        { enrollment_id: 2, status: "PRESENT" },
      ],
    }),
  });

  // A single undo restores the previous column: the present student stays
  // present (written back), the unmarked one is cleared again.
  await key("z", { ctrlKey: true });

  expect(apiFetchMock).toHaveBeenCalledWith("/attendance/10/1", {
    method: "PUT",
    body: JSON.stringify({ status: "PRESENT" }),
  });
  expect(apiFetchMock).toHaveBeenCalledWith("/attendance/10/2", { method: "DELETE" });
});

test("Finalizar is the filled primary action of the take toolbar", async () => {
  await mountPage();

  const finish = document.querySelector('[data-test-id="take-finish"]') as HTMLElement;
  const markAll = document.querySelector('[data-test-id="take-all-present"]') as HTMLElement;
  const back = document.querySelector('[data-test-id="take-back-toolbar"]') as HTMLElement;

  expect(finish.className).toContain("btn-primary");
  expect(markAll.className).toContain("btn-ghost");
  expect(back.className).toContain("btn-ghost");
});

test("keyboard shortcuts stay inert while the bulk confirmation is open", async () => {
  await mountPage();

  (document.querySelector('[data-test-id="take-all-present"]') as HTMLElement).click();
  flushSync();

  await key("ArrowRight");

  expect(apiFetchMock).not.toHaveBeenCalledWith("/attendance/10/1", expect.anything());
  expect(document.body.textContent).toContain("Juan Pérez");
});
