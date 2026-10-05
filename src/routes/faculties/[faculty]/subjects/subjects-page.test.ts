import { mount, unmount, flushSync } from "svelte";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { StoreKey } from "$lib/common";
import { loadTranslations } from "$lib/common/i18n/config";
import { FacultiesStore } from "$lib/client/stores/faculties.svelte";
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

vi.mock("$lib/client/services/api", () => {
  return { apiFetch: apiFetchMock };
});

import SubjectsPage from "./+page.svelte";

let component: ReturnType<typeof mount>;
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function buildContext() {
  const map = new Map<StoreKey, unknown>();
  map.set(StoreKey.FACULTIES, new FacultiesStore());
  map.set(StoreKey.SUBJECTS, new SubjectsStore());
  return map;
}

afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

beforeEach(async () => {
  await loadTranslations("es", "/");
  apiFetchMock.mockResolvedValue([]);
});

test("shows the not-found state for an unknown faculty slug", async () => {
  mockParams = { faculty: "facultad-inexistente" };

  component = mount(SubjectsPage, { target: document.body, context: buildContext() });
  flushSync();
  await flush();
  flushSync();

  expect(document.body.textContent).toContain("La facultad seleccionada no existe");
});

test("shows the subject table for a known faculty slug", async () => {
  mockParams = { faculty: "facultad-de-ingenieria" };
  apiFetchMock.mockImplementation((path: string) => {
    if (path.startsWith("/faculties")) {
      return Promise.resolve([
        { id: 1, name: "Facultad de Ingeniería", slug: "facultad-de-ingenieria" },
      ]);
    }
    if (path.startsWith("/subjects")) {
      return Promise.resolve([
        {
          id: 5,
          faculty_id: 1,
          name: "Álgebra Lineal",
          faculty_name: "Facultad de Ingeniería",
          faculty_slug: "facultad-de-ingenieria",
          slug: "algebra-lineal",
        },
      ]);
    }
    return Promise.resolve([]);
  });

  component = mount(SubjectsPage, { target: document.body, context: buildContext() });
  flushSync();
  await flush();
  flushSync();

  expect(document.body.textContent).toContain("Álgebra Lineal");
  const link = document.body.querySelector(
    'a[href="/faculties/facultad-de-ingenieria/subjects/algebra-lineal/periods"]',
  );
  expect(link).not.toBeNull();
});
