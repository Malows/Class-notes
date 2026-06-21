import { loadTranslations } from "$lib/i18n/config";
import { mount, unmount, flushSync } from "svelte";
import { expect, test, afterEach, vi, beforeEach } from "vitest";
import { fireEvent } from "@testing-library/svelte";

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

import Sidebar from "./Sidebar.svelte";

let component: ReturnType<typeof mount>;
afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
});

beforeEach(() => {
  mockParams = {};
  mockUrl = new URL("http://localhost/");
});

test("Sidebar renders and handles mobile/collapse toggles", async () => {
  await loadTranslations("en", "/");
  component = mount(Sidebar, { target: document.body });
  flushSync();

  const aside = document.body.querySelector("aside");
  expect(aside).toBeTruthy();
  expect(aside?.classList.contains("open")).toBe(false);
  expect(aside?.classList.contains("collapsed")).toBe(false);

  // Toggle mobile menu
  const toggleMobileBtn = document.body.querySelector(".sidebar-toggle") as HTMLButtonElement;
  expect(toggleMobileBtn).toBeTruthy();
  await fireEvent.click(toggleMobileBtn);
  flushSync();
  expect(aside?.classList.contains("open")).toBe(true);

  // Toggle collapse sidebar (via header trigger inside SidebarHeader)
  const collapseBtn = document.body.querySelector(".sidebar-header button") as HTMLButtonElement;
  expect(collapseBtn).toBeTruthy();
  await fireEvent.click(collapseBtn);
  flushSync();
  expect(aside?.classList.contains("collapsed")).toBe(true);
});

test("Sidebar renders contextual sections dynamically", async () => {
  await loadTranslations("en", "/");

  mockParams = {
    faculty_id: "1",
    subject_id: "2",
    period_id: "3",
  };
  mockUrl = new URL("http://localhost/faculties/1/subjects/2/periods/3");

  component = mount(Sidebar, { target: document.body });
  flushSync();

  // Since context has facultyId, subjectId, and periodId, it should render sections using h6 tags
  const headers = Array.from(document.body.querySelectorAll("h6")).map((h) =>
    h.textContent?.trim(),
  );
  expect(headers).toContain("Subjects (...)");
  expect(headers).toContain("Periods");
  expect(headers).toContain("Commissions");
});
