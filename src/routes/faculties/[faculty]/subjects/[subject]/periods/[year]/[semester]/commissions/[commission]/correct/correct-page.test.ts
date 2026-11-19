import { mount, unmount, flushSync } from "svelte";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { StoreKey } from "$lib/common";
import { loadTranslations } from "$lib/common/i18n/config";
import { CommissionsStore } from "$lib/client/stores/commissions.svelte";
import { EnrollmentsStore } from "$lib/client/stores/enrollments.svelte";
import { FacultiesStore } from "$lib/client/stores/faculties.svelte";
import { PeriodsStore } from "$lib/client/stores/periods.svelte";
import { SubjectsStore } from "$lib/client/stores/subjects.svelte";

let mockParams: Record<string, string> = {};
let mockUrl = new URL("http://localhost/");

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

const nav = vi.hoisted(() => ({
  goto: vi.fn(),
  beforeNavigate: vi.fn(),
}));

vi.mock("$app/navigation", () => ({
  goto: nav.goto,
  beforeNavigate: (callback: unknown) => nav.beforeNavigate(callback),
}));

const { apiFetchMock } = vi.hoisted(() => ({ apiFetchMock: vi.fn() }));

vi.mock("$lib/client/services/api", () => {
  return { apiFetch: apiFetchMock };
});

import CorrectionPage from "./+page.svelte";

let component: ReturnType<typeof mount>;
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function buildContext() {
  const map = new Map<StoreKey, unknown>();
  map.set(StoreKey.FACULTIES, new FacultiesStore());
  map.set(StoreKey.SUBJECTS, new SubjectsStore());
  map.set(StoreKey.PERIODS, new PeriodsStore());
  map.set(StoreKey.COMMISSIONS, new CommissionsStore());
  map.set(StoreKey.ENROLLMENTS, new EnrollmentsStore());
  return map;
}

const routes: Array<[string, unknown]> = [
  [
    "/faculties",
    [{ id: 1, name: "Facultad de Ingeniería", slug: "facultad-de-ingenieria" }],
  ],
  [
    "/subjects",
    [
      {
        id: 5,
        faculty_id: 1,
        name: "Física General I",
        slug: "fisica-general-i",
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
        year: 2026,
        semester: 1,
        subject_id: 5,
        subject_period_id: 1,
        subject_name: "Física General I",
        subject_slug: "fisica-general-i",
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
        name: "Comisión Virtual",
        slug: "comision-virtual",
        student_count: 2,
      },
    ],
  ],
  [
    "/enrollments",
    [
      { id: 15, person_id: 3, subject_period_id: 1, commission_id: 1, name: "Bruno Álvarez", legajo: "ING-015" },
      { id: 16, person_id: 4, subject_period_id: 1, commission_id: 1, name: "Lucía Domínguez", legajo: "ING-016" },
    ],
  ],
  [
    "/assignments",
    [{ id: 4, subject_period_id: 1, title: "Guía de Problemas 1", workflow_status: "WAITING_FOR_CORRECTION" }],
  ],
  ["/correct", null],
];

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
  mockParams = {
    faculty: "facultad-de-ingenieria",
    subject: "fisica-general-i",
    year: "2026",
    semester: "1",
    commission: "comision-virtual",
  };
  mockUrl = new URL(
    "http://localhost/faculties/facultad-de-ingenieria/subjects/fisica-general-i/periods/2026/1/commissions/comision-virtual/correct?assignment_id=4&enrollment_id=15",
  );
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

test("shows an editorial empty state with back and skip when the delivery row is missing", async () => {
  component = mount(CorrectionPage, { target: document.body, context: buildContext() });
  flushSync();
  await flush();
  flushSync();

  expect(document.querySelector('[data-test-id="correction-delivery-missing"]')).toBeTruthy();
  expect(document.body.textContent).toContain("Sin planilla de entrega para este alumno");

  const skip = document.querySelector('[data-test-id="correction-skip-btn"]') as HTMLAnchorElement;
  expect(skip).toBeTruthy();
  expect(skip.textContent).toContain("Saltar");

  const back = document.querySelector('[data-test-id="correction-back-btn"]') as HTMLAnchorElement;
  expect(back.getAttribute("href")).toBe(
    "/faculties/facultad-de-ingenieria/subjects/fisica-general-i/periods/2026/1/commissions/comision-virtual/overview",
  );
});

test("guards a missing or invalid assignment_id instead of rendering nothing", async () => {
  mockUrl = new URL(
    "http://localhost/faculties/facultad-de-ingenieria/subjects/fisica-general-i/periods/2026/1/commissions/comision-virtual/correct?assignment_id=not-a-number",
  );

  component = mount(CorrectionPage, { target: document.body, context: buildContext() });
  flushSync();
  await flush();
  flushSync();

  expect(document.querySelector('[data-test-id="correction-assignment-missing"]')).toBeTruthy();
  expect(document.querySelector('[data-test-id="correction-delivery-missing"]')).toBeNull();
  expect(apiFetchMock).not.toHaveBeenCalledWith("/correct?assignment_id=NaN&enrollment_id=15");
});

test("opens the commission-level grading sheet when no student is linked", async () => {
  mockUrl = new URL(
    "http://localhost/faculties/facultad-de-ingenieria/subjects/fisica-general-i/periods/2026/1/commissions/comision-virtual/correct?assignment_id=4",
  );
  apiFetchMock.mockImplementation((path: string) => {
    if (path === "/correct?commission_id=1") {
      return Promise.resolve([
        {
          assignment_id: 4,
          enrollment_id: 15,
          grade: 9,
          ai_level: 0,
          comments: "",
          workflow_status: "APPROVED",
        },
      ]);
    }
    const match = routes.find(([prefix]) => path.startsWith(prefix));
    return Promise.resolve(match ? match[1] : []);
  });

  component = mount(CorrectionPage, { target: document.body, context: buildContext() });
  flushSync();
  await flush();
  flushSync();

  const progress = document.querySelector('[data-test-id="grade-sheet-progress"]');
  expect(progress?.textContent?.trim()).toBe("1 de 2 corregidas");

  const firstRow = document.querySelector('[data-test-id="grade-row-15"]');
  expect(firstRow).toBeTruthy();
  expect(document.querySelector('[data-test-id="grade-row-16"]')).toBeTruthy();
  expect(document.querySelector('[data-test-id="correction-delivery-missing"]')).toBeNull();

  const detail = document.querySelector('[data-test-id="grade-detail-15"]') as HTMLAnchorElement;
  expect(detail.getAttribute("href")).toBe(
    "/faculties/facultad-de-ingenieria/subjects/fisica-general-i/periods/2026/1/commissions/comision-virtual/correct?assignment_id=4&enrollment_id=15&mode=single",
  );
});

test("keeps the detailed form as the fallback with next and a link to the sheet", async () => {
  mockUrl = new URL(
    "http://localhost/faculties/facultad-de-ingenieria/subjects/fisica-general-i/periods/2026/1/commissions/comision-virtual/correct?assignment_id=4&enrollment_id=15&mode=single",
  );
  apiFetchMock.mockImplementation((path: string) => {
    if (path === "/correct?assignment_id=4&enrollment_id=15") {
      return Promise.resolve({
        assignment_id: 4,
        enrollment_id: 15,
        grade: 9.5,
        ai_level: 0,
        comments: "Buen trabajo",
        workflow_status: "APPROVED",
      });
    }
    const match = routes.find(([prefix]) => path.startsWith(prefix));
    return Promise.resolve(match ? match[1] : []);
  });

  component = mount(CorrectionPage, { target: document.body, context: buildContext() });
  flushSync();
  await flush();
  flushSync();

  const grade = document.querySelector('[data-test-id="delivery-grade-input"]') as HTMLInputElement;
  expect(grade?.value).toBe("9,5");
  expect(document.querySelector('[data-test-id="delivery-next-btn"]')).toBeTruthy();
  expect(document.querySelector('[data-test-id="delivery-prev-btn"]')).toBeNull();

  const sheetLink = document.querySelector('[data-test-id="correction-sheet-link"]') as HTMLAnchorElement;
  expect(sheetLink.getAttribute("href")).toBe(
    "/faculties/facultad-de-ingenieria/subjects/fisica-general-i/periods/2026/1/commissions/comision-virtual/correct?assignment_id=4",
  );
});

async function mountSingleForm() {
  mockUrl = new URL(
    "http://localhost/faculties/facultad-de-ingenieria/subjects/fisica-general-i/periods/2026/1/commissions/comision-virtual/correct?assignment_id=4&enrollment_id=15&mode=single",
  );
  apiFetchMock.mockImplementation((path: string) => {
    if (path === "/correct?assignment_id=4&enrollment_id=15") {
      return Promise.resolve({
        assignment_id: 4,
        enrollment_id: 15,
        grade: 8,
        ai_level: 0,
        comments: "",
        workflow_status: "WAITING_FOR_CORRECTION",
      });
    }
    const match = routes.find(([prefix]) => path.startsWith(prefix));
    return Promise.resolve(match ? match[1] : []);
  });

  component = mount(CorrectionPage, { target: document.body, context: buildContext() });
  flushSync();
  await flush();
  flushSync();
}

function typeGrade(value: string) {
  const input = document.querySelector('[data-test-id="delivery-grade-input"]') as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  flushSync();
}

function tryLeave() {
  const callback = nav.beforeNavigate.mock.calls.at(-1)?.[0] as (args: {
    to: { url: URL };
    cancel: () => void;
  }) => void;
  const cancel = vi.fn();
  callback({ to: { url: new URL("http://localhost/faculties/other") }, cancel });
  flushSync();
  return cancel;
}

test("guards a dirty form and keeps editing on request", async () => {
  await mountSingleForm();
  typeGrade("9");

  const cancel = tryLeave();
  expect(cancel).toHaveBeenCalledTimes(1);
  expect(document.querySelector('[data-test-id="unsaved-save-btn"]')).toBeTruthy();

  (document.querySelector('[data-test-id="unsaved-stay-btn"]') as HTMLButtonElement).click();
  flushSync();
  await flush();
  flushSync();

  // Staying must not navigate; the dialog close is covered by the composable test.
  expect(nav.goto).not.toHaveBeenCalled();
});

test("does not guard a clean form", async () => {
  await mountSingleForm();

  const cancel = tryLeave();
  expect(cancel).not.toHaveBeenCalled();
  expect(document.querySelector('[data-test-id="unsaved-save-btn"]')).toBeNull();
});

test("discards the draft and continues", async () => {
  await mountSingleForm();
  typeGrade("9");
  tryLeave();

  (document.querySelector('[data-test-id="unsaved-discard-btn"]') as HTMLButtonElement).click();
  flushSync();

  expect(nav.goto).toHaveBeenCalledWith("http://localhost/faculties/other");
});

test("saves before leaving", async () => {
  await mountSingleForm();
  typeGrade("9");
  tryLeave();

  (document.querySelector('[data-test-id="unsaved-save-btn"]') as HTMLButtonElement).click();
  await flush();
  flushSync();

  expect(apiFetchMock).toHaveBeenCalledWith("/correct", expect.objectContaining({ method: "POST" }));
  expect(nav.goto).toHaveBeenCalledWith("http://localhost/faculties/other");
});

test("stays when the save fails", async () => {
  await mountSingleForm();
  typeGrade("9");
  tryLeave();

  apiFetchMock.mockImplementation((path: string, init?: { method?: string }) => {
    if (path === "/correct" && init?.method === "POST") {
      return Promise.reject(new Error("save failed"));
    }
    return Promise.resolve([]);
  });

  (document.querySelector('[data-test-id="unsaved-save-btn"]') as HTMLButtonElement).click();
  await flush();
  flushSync();

  expect(nav.goto).not.toHaveBeenCalled();
  expect(document.querySelector('[data-test-id="unsaved-save-btn"]')).toBeTruthy();
});

async function mountSheetForm() {
  mockUrl = new URL(
    "http://localhost/faculties/facultad-de-ingenieria/subjects/fisica-general-i/periods/2026/1/commissions/comision-virtual/correct?assignment_id=4",
  );
  apiFetchMock.mockImplementation((path: string) => {
    if (path === "/correct?commission_id=1") {
      return Promise.resolve([
        {
          assignment_id: 4,
          enrollment_id: 15,
          grade: 9,
          ai_level: 0,
          comments: "",
          workflow_status: "APPROVED",
        },
        {
          assignment_id: 4,
          enrollment_id: 16,
          grade: 8,
          ai_level: 0,
          comments: "",
          workflow_status: "APPROVED",
        },
      ]);
    }
    const match = routes.find(([prefix]) => path.startsWith(prefix));
    return Promise.resolve(match ? match[1] : []);
  });

  component = mount(CorrectionPage, { target: document.body, context: buildContext() });
  flushSync();
  await flush();
  flushSync();
}

test("guards an unsaved grade in the sheet and saves it before leaving", async () => {
  await mountSheetForm();

  const input = document.querySelector('[data-test-id="grade-input-15"]') as HTMLInputElement;
  input.value = "7";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  flushSync();

  const cancel = tryLeave();
  expect(cancel).toHaveBeenCalledTimes(1);
  expect(document.querySelector('[data-test-id="unsaved-save-btn"]')).toBeTruthy();

  (document.querySelector('[data-test-id="unsaved-save-btn"]') as HTMLButtonElement).click();
  await flush();
  flushSync();

  expect(apiFetchMock).toHaveBeenCalledWith(
    "/correct",
    expect.objectContaining({ method: "POST" }),
  );
  expect(nav.goto).toHaveBeenCalledWith("http://localhost/faculties/other");
});
