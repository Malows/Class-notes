import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";

import FacultySubjectCheckboxes from "./FacultySubjectCheckboxes.svelte";

describe("FacultySubjectCheckboxes", () => {
  it("renders the faculty header and toggles subject selection", async () => {
    const onToggle = vi.fn();

    render(FacultySubjectCheckboxes, {
      facultyName: "Ciencias",
      facultyId: 10,
      subjects: [{ id: 1, name: "Álgebra", faculty_id: 10, faculty_name: "Ciencias" }],
      selectedSubjectIds: [1],
      onToggle,
    });

    expect(screen.getByText("Ciencias")).toBeInTheDocument();
    expect(screen.getByText("Álgebra")).toBeInTheDocument();

    const checkbox = screen.getByLabelText("Álgebra");
    expect(checkbox).toBeChecked();

    await fireEvent.click(checkbox);

    expect(onToggle).toHaveBeenCalledWith(1);
  });
});
