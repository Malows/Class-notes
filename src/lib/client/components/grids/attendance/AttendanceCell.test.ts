import "@testing-library/jest-dom/vitest";
import { render, screen, configure } from "@testing-library/svelte";
import { describe, expect, test, vi } from "vitest";

import { loadTranslations } from "$lib/common/i18n/config";
import { AttendanceStatus } from "$lib/common/types/attendance";

import AttendanceCell from "./AttendanceCell.svelte";

configure({ testIdAttribute: "data-test-id" });

describe("AttendanceCell", () => {
  test.each([
    [AttendanceStatus.PRESENT, "✓", "Presente"],
    [AttendanceStatus.ABSENT, "✗", "Ausente"],
    [null, "–", "Sin tomar"],
  ])("keeps the glyph and accessible name for %s", async (status, glyph, label) => {
    await loadTranslations("es", "/");

    render(AttendanceCell, {
      status,
      recordedOn: status ? "2025-04-01" : null,
      contextLabel: "Ana Martínez — TP 1",
      testId: "cell",
    });

    const cell = screen.getByTestId("cell");
    expect(cell.textContent?.trim()).toBe(glyph);
    expect(cell).toHaveAttribute("aria-label", `${label} · Ana Martínez — TP 1`);
    expect(cell).toHaveAttribute("title", expect.stringContaining(label));
  });

  test("is only interactive when it has a handler", async () => {
    await loadTranslations("es", "/");

    const onclick = vi.fn();
    const { unmount } = render(AttendanceCell, {
      status: AttendanceStatus.PRESENT,
      recordedOn: null,
      testId: "with-handler",
      onclick,
    });

    const interactive = screen.getByTestId("with-handler");
    expect(interactive).toBeEnabled();
    interactive.click();
    expect(onclick).toHaveBeenCalledOnce();
    unmount();

    render(AttendanceCell, {
      status: AttendanceStatus.PRESENT,
      recordedOn: null,
      testId: "without-handler",
    });

    expect(screen.getByTestId("without-handler")).toBeDisabled();
  });
});
