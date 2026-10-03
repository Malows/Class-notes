import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushSync, mount, unmount } from "svelte";

import { loadTranslations } from "$lib/common/i18n/config";

let mockParams: Record<string, string> = {};

vi.mock("$app/state", () => {
  return {
    get page() {
      return {
        get params() {
          return mockParams;
        },
      };
    },
  };
});

const { getByYearSemesterMock, getByPeriodMock, getAllSubjectsMock, syncByPeriodMock } =
  vi.hoisted(() => ({
    getByYearSemesterMock: vi.fn(),
    getByPeriodMock: vi.fn(),
    getAllSubjectsMock: vi.fn(),
    syncByPeriodMock: vi.fn(),
  }));

vi.mock("$lib/client/services/period.service", () => ({
  periodService: { getByYearSemester: getByYearSemesterMock },
}));

vi.mock("$lib/client/services/subject.service", () => ({
  subjectService: {
    getByPeriod: getByPeriodMock,
    getAll: getAllSubjectsMock,
    syncByPeriod: syncByPeriodMock,
  },
}));

import SubjectsPage from "./+page.svelte";

const subjects = [
  { id: 1, faculty_id: 1, faculty_name: "Facultad de Ingeniería", name: "Álgebra Lineal" },
  { id: 3, faculty_id: 1, faculty_name: "Facultad de Ingeniería", name: "Física General I" },
  { id: 4, faculty_id: 2, faculty_name: "Facultad de Ciencias Exactas", name: "Cálculo Diferencial" },
];

let component: ReturnType<typeof mount>;
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

beforeEach(async () => {
  await loadTranslations("es", "/");
  mockParams = { year: "2026", semester: "1" };
  getAllSubjectsMock.mockResolvedValue(subjects);
  getByPeriodMock.mockResolvedValue([subjects[1]]);
});

describe("period subjects page", () => {
  it("renders the subjects of a valid year/semester period", async () => {
    getByYearSemesterMock.mockResolvedValue({ id: 4, year: 2026, semester: 1 });

    component = mount(SubjectsPage, { target: document.body });
    flushSync();
    await flush();
    flushSync();

    expect(document.body.textContent).toContain("Periodo: 2026 / 1");
    expect(document.body.textContent).toContain("Física General I");
    expect(getByYearSemesterMock).toHaveBeenCalledWith(2026, 1);
    expect(getByPeriodMock).toHaveBeenCalledWith(4);
  });

  it("shows the not-found state for an invalid semester", async () => {
    mockParams = { year: "2026", semester: "3" };

    component = mount(SubjectsPage, { target: document.body });
    flushSync();
    await flush();
    flushSync();

    expect(document.body.textContent).toContain("El periodo seleccionado no existe");
    expect(getByYearSemesterMock).not.toHaveBeenCalled();
  });

  it("shows the not-found state when the period does not exist", async () => {
    getByYearSemesterMock.mockRejectedValue(new Error("Period not found"));

    component = mount(SubjectsPage, { target: document.body });
    flushSync();
    await flush();
    flushSync();

    expect(document.body.textContent).toContain("El periodo seleccionado no existe");
  });
});