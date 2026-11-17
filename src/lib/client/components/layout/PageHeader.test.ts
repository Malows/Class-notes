import "@testing-library/jest-dom/vitest";
import { render, screen, configure } from "@testing-library/svelte";
import { expect, test } from "vitest";

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
