import "@testing-library/jest-dom/vitest";
import { flushSync, mount, unmount } from "svelte";
import { fireEvent, screen, configure } from "@testing-library/svelte";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { StoreKey } from "$lib/common";
import { loadTranslations } from "$lib/common/i18n/config";
import type { Commission, Period, Subject } from "$lib/common/types/academic";
import { DeliveryWorkflowStatus } from "$lib/common/types/student";
import { CommissionsStore } from "$lib/client/stores/commissions.svelte";
import { metadataStore } from "$lib/client/stores/metadata.svelte";
import { PeriodsStore } from "$lib/client/stores/periods.svelte";
import { SubjectsStore } from "$lib/client/stores/subjects.svelte";
import { stopVisitTracking } from "$lib/client/components/dashboard/dashboard-storage";

configure({ testIdAttribute: "data-test-id" });

const { apiFetchMock } = vi.hoisted(() => ({ apiFetchMock: vi.fn() }));

vi.mock("$lib/client/services/api", () => ({ apiFetch: apiFetchMock }));

import DashboardPage from "./+page.svelte";

const periods: Period[] = [
  { id: 5, year: 2026, semester: 2 },
  { id: 4, year: 2026, semester: 1 },
  { id: 2, year: 2025, semester: 1 },
];

const subjects: Subject[] = [
  {
    id: 1,
    name: "Álgebra Lineal",
    slug: "algebra-lineal",
    faculty_id: 1,
    faculty_name: "Facultad de Ingeniería",
    faculty_slug: "facultad-de-ingenieria",
  },
  {
    id: 3,
    name: "Física General I",
    slug: "fisica-general-i",
    faculty_id: 1,
    faculty_name: "Facultad de Ingeniería",
    faculty_slug: "facultad-de-ingenieria",
  },
  {
    id: 5,
    name: "Cálculo Integral",
    slug: "calculo-integral",
    faculty_id: 2,
    faculty_name: "Facultad de Ciencias Exactas",
    faculty_slug: "facultad-de-ciencias-exactas",
  },
  {
    id: 7,
    name: "Historia de la Ciencia",
    slug: "historia-de-la-ciencia",
    faculty_id: 3,
    faculty_name: "Facultad de Humanidades y Artes",
    faculty_slug: "facultad-de-humanidades-y-artes",
  },
];

const commissions: Commission[] = [
  {
    id: 4,
    period_id: 4,
    subject_id: 3,
    name: "Comisión Virtual",
    slug: "comision-virtual",
    student_count: 4,
  },
  {
    id: 10,
    period_id: 4,
    subject_id: 7,
    name: "Comisión Taller",
    slug: "comision-taller",
    student_count: 2,
  },
  {
    id: 1,
    period_id: 2,
    subject_id: 1,
    name: "Comisión Mañana",
    slug: "comision-manana",
    student_count: 4,
  },
  {
    id: 7,
    period_id: 2,
    subject_id: 5,
    name: "Comisión 1",
    slug: "comision-1",
    student_count: 2,
  },
];

const stats = {
  totalStudents: 32,
  totalSubjects: 8,
  approvalRate: 55,
  totalDeliveries: 22,
};

function overviewFor(rows: Array<{ commissionId?: number; statuses: DeliveryWorkflowStatus[] }>) {
  return {
    assignments: [],
    grid: rows.map((row, index) => ({
      id: index + 1,
      enrollment_id: index + 1,
      name: `Alumno ${index + 1}`,
      commission_id: row.commissionId,
      deliveries: row.statuses.map((workflow_status, assignment) => ({
        assignment_id: assignment + 1,
        enrollment_id: index + 1,
        workflow_status,
        grade: 0,
        ai_level: 0,
        comments: "",
      })),
    })),
  };
}

const pendingOverview = overviewFor([
  {
    commissionId: 4,
    statuses: [
      DeliveryWorkflowStatus.WAITING_FOR_CORRECTION,
      DeliveryWorkflowStatus.APPROVED,
    ],
  },
]);

const historyOverview = overviewFor([
  { commissionId: 10, statuses: [DeliveryWorkflowStatus.NOT_DICTATED] },
]);

const algebraOverview = overviewFor([
  {
    commissionId: 1,
    statuses: [
      DeliveryWorkflowStatus.WAITING_FOR_CORRECTION,
      DeliveryWorkflowStatus.WAITING_FOR_CORRECTION,
    ],
  },
]);

const calculusOverview = overviewFor([
  { commissionId: 7, statuses: [DeliveryWorkflowStatus.REJECTED] },
]);

const LAST_VISIT =
  "/faculties/facultad-de-ingenieria/subjects/algebra-lineal/periods/2025/1/commissions/comision-manana/attendance";

let component: ReturnType<typeof mount> | undefined;

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

async function settle() {
  for (let index = 0; index < 8; index += 1) {
    flushSync();
    await flush();
  }
  flushSync();
}

function buildContext() {
  const context = new Map<StoreKey, unknown>();
  context.set(StoreKey.PERIODS, new PeriodsStore());
  context.set(StoreKey.SUBJECTS, new SubjectsStore());
  context.set(StoreKey.COMMISSIONS, new CommissionsStore());
  return context;
}

function mockRoutes(options: { noPeriods?: boolean; failCommissions?: boolean } = {}) {
  apiFetchMock.mockImplementation((path: string) => {
    if (path === "/periods") {
      return Promise.resolve(options.noPeriods ? [] : periods);
    }
    if (path === "/subjects") {
      return Promise.resolve(subjects);
    }
    if (path === "/commissions") {
      return options.failCommissions
        ? Promise.reject(new Error("network"))
        : Promise.resolve(commissions);
    }
    if (path === "/overview/stats") {
      return Promise.resolve(stats);
    }
    if (path.startsWith("/overview?subject_id=")) {
      const params = new URLSearchParams(path.slice(path.indexOf("?")));
      const key = `${params.get("subject_id")}:${params.get("period_id")}`;
      if (key === "3:4") {
        return Promise.resolve(pendingOverview);
      }
      if (key === "7:4") {
        return Promise.resolve(historyOverview);
      }
      if (key === "1:2") {
        return Promise.resolve(algebraOverview);
      }
      if (key === "5:2") {
        return Promise.resolve(calculusOverview);
      }
      return Promise.resolve({ assignments: [], grid: [] });
    }
    return Promise.resolve([]);
  });
}

function mountPage() {
  component = mount(DashboardPage, { target: document.body, context: buildContext() });
  return component;
}

beforeEach(async () => {
  await loadTranslations("es", "/");
  localStorage.clear();
  metadataStore.initializeStore({
    periodData: { year: 2026, term: "Cuatrimestre II" },
    subjects: [],
  });
  mockRoutes();
});

afterEach(() => {
  if (component) {
    unmount(component);
    component = undefined;
  }
  stopVisitTracking();
  metadataStore.initializeStore(null);
  document.body.innerHTML = "";
  localStorage.clear();
  vi.clearAllMocks();
});

test("opens the latest term with data and scopes every module to it", async () => {
  localStorage.setItem("class-notes:last-visited:v1", JSON.stringify({ href: LAST_VISIT }));
  mountPage();
  await settle();

  const select = screen.getByTestId("period-select") as HTMLSelectElement;
  expect(select.value).toBe("2026-1");
  const note = screen.getByTestId("period-active-note");
  expect(screen.getByTestId("period-picker")).toContainElement(note);
  expect(note.parentElement).toBe(select.parentElement);
  expect(
    select.compareDocumentPosition(note) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(note).toHaveTextContent("El período en curso no tiene comisiones");
  expect(note).toHaveTextContent("Mostrando 2026 · 1º");
  expect(screen.getByTestId("today-scope").textContent).toContain("2026 · 1º");
  expect(screen.getByTestId("pending-scope").textContent).toContain("2026 · 1º");

  expect(screen.getByTestId("commission-row-4").textContent).toContain("Física General I");
  expect(screen.getByTestId("commission-row-4").textContent).toContain("Comisión Virtual");
  expect(screen.getByTestId("commission-row-10").textContent).toContain(
    "Historia de la Ciencia",
  );
  expect(screen.getByTestId("commission-attendance-4")).toHaveAttribute(
    "href",
    "/faculties/facultad-de-ingenieria/subjects/fisica-general-i/periods/2026/1/commissions/comision-virtual/attendance",
  );
  expect(screen.getByTestId("commission-overview-10")).toHaveAttribute(
    "href",
    "/faculties/facultad-de-humanidades-y-artes/subjects/historia-de-la-ciencia/periods/2026/1/commissions/comision-taller/overview",
  );

  expect(screen.getByTestId("commission-pending-4").textContent).toContain(
    "1 entrega sin corregir",
  );
  expect(document.querySelector('[data-test-id="commission-pending-10"]')).toBeNull();
  expect(screen.getByTestId("pending-row-4").textContent).toContain("Física General I");
  expect(document.querySelector('[data-test-id="pending-row-10"]')).toBeNull();

  expect(screen.getByTestId("continue-shortcut").textContent).toContain("Álgebra Lineal");
  expect(screen.getByTestId("continue-visit")).toHaveAttribute("href", LAST_VISIT);

  expect(screen.getByTestId("dashboard-stats").textContent).toContain("Todos los períodos");
});

test("changing the term changes the commission list and its counts", async () => {
  mountPage();
  await settle();

  const select = screen.getByTestId("period-select") as HTMLSelectElement;
  await fireEvent.change(select, { target: { value: "2025-1" } });
  await settle();

  expect(screen.getByTestId("commission-row-1").textContent).toContain("Álgebra Lineal");
  expect(screen.getByTestId("commission-row-7").textContent).toContain("Cálculo Integral");
  expect(document.querySelector('[data-test-id="commission-row-4"]')).toBeNull();
  expect(screen.getByTestId("commission-pending-1").textContent).toContain(
    "2 entregas sin corregir",
  );
  expect(screen.getByTestId("period-summary").textContent).toContain("2 comisiones");
  expect(screen.getByTestId("period-summary").textContent).toContain("6 alumnos");
});

test("says so when the selected term has no commissions", async () => {
  mountPage();
  await settle();

  apiFetchMock.mockClear();
  const select = screen.getByTestId("period-select") as HTMLSelectElement;
  await fireEvent.change(select, { target: { value: "2026-2" } });
  await settle();

  expect(screen.getByTestId("today-empty").textContent).toContain("Sin comisiones en 2026 · 2º");
  expect(screen.getByTestId("pending-empty").textContent).toContain(
    "No hay entregas sin corregir",
  );
  const overviewCalls = apiFetchMock.mock.calls
    .map(([path]) => String(path))
    .filter((path) => path.startsWith("/overview?"));
  expect(overviewCalls).toHaveLength(0);
});

test("shows the first-run state when there are no periods", async () => {
  mockRoutes({ noPeriods: true });
  mountPage();
  await settle();

  expect(screen.getByTestId("dashboard-no-periods").textContent).toContain(
    "Todavía no hay períodos",
  );
  expect(screen.getByTestId("dashboard-manage-periods")).toHaveAttribute("href", "/periods");
});

test("shows a retry when the term cannot be loaded and recovers", async () => {
  mockRoutes({ failCommissions: true });
  mountPage();
  await settle();

  expect(screen.getByRole("alert").textContent).toContain(
    "No se pudieron cargar los datos",
  );

  mockRoutes();
  screen.getByRole("button", { name: "Reintentar" }).click();
  await settle();

  expect(screen.getByTestId("commission-row-4")).not.toBeNull();
});
