import { configure, fireEvent, render, screen } from "@testing-library/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushSync } from "svelte";

import type { Assignment } from "$lib/common/types/academic";
import type { EnrollmentWithPerson } from "$lib/common/types/enrollment";
import { DeliveryWorkflowStatus, type Delivery } from "$lib/common/types/student";
import { loadTranslations } from "$lib/common/i18n/config";

import GradeSheet from "./GradeSheet.svelte";

configure({ testIdAttribute: "data-test-id" });

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

const assignment: Assignment = {
  id: 7,
  subject_period_id: 1,
  title: "Trabajo Práctico 1",
};

function enrollment(id: number, name: string): EnrollmentWithPerson {
  return {
    id,
    person_id: id,
    subject_period_id: 1,
    commission_id: 1,
    name,
    legajo: `LEG-${id}`,
  };
}

function delivery(overrides: Partial<Delivery> = {}): Delivery {
  return {
    assignment_id: 7,
    enrollment_id: 2,
    grade: 0,
    ai_level: 0,
    comments: "",
    workflow_status: DeliveryWorkflowStatus.WAITING_FOR_CORRECTION,
    ...overrides,
  };
}

const enrollments = [enrollment(1, "Ana Martínez"), enrollment(2, "Bruno Álvarez")];

const gradedDelivery = delivery({
  enrollment_id: 1,
  grade: 8,
  ai_level: 1,
  comments: "Buen trabajo",
  workflow_status: DeliveryWorkflowStatus.APPROVED,
});

function mountSheet(deliveries: Delivery[] = [gradedDelivery, delivery()], onSave = vi.fn()) {
  render(GradeSheet, {
    assignment,
    enrollments,
    deliveries,
    onSave,
    detailHref: (id: number) => `/detalle/${id}`,
  });
  return onSave;
}

beforeEach(async () => {
  await loadTranslations("es", "/");
});

describe("GradeSheet", () => {
  it("renders one row per student and counts the corrected ones", () => {
    mountSheet();
    flushSync();

    expect(screen.getByTestId("grade-sheet-progress").textContent?.trim()).toBe(
      "1 de 2 corregidas",
    );
    expect(screen.getByTestId("grade-row-1")).toBeTruthy();
    expect(screen.getByTestId("grade-row-2")).toBeTruthy();
    expect(screen.getByTestId("grade-detail-1").getAttribute("href")).toBe("/detalle/1");
    expect((screen.getByTestId("grade-input-1") as HTMLInputElement).value).toBe("8");
  });

  it("keeps the typed grade, marks the field and shows the scale error", async () => {
    const onSave = mountSheet();
    flushSync();

    const grade = screen.getByTestId("grade-input-2") as HTMLInputElement;
    await fireEvent.input(grade, { target: { value: "11" } });
    await fireEvent.change(screen.getByTestId("grade-result-2"), {
      target: { value: DeliveryWorkflowStatus.APPROVED },
    });
    await fireEvent.click(screen.getByTestId("grade-save-2"));
    flushSync();

    const error = screen.getByTestId("grade-row-error-2");
    expect(error.textContent).toContain("La nota tiene que estar entre 0 y 10.");
    expect(grade.value).toBe("11");
    expect(grade.getAttribute("aria-invalid")).toBe("true");
    expect(grade.getAttribute("aria-describedby")).toBe("grade-error-2");
    expect(document.getElementById("grade-error-2")?.textContent).toContain(
      "La nota tiene que estar entre 0 y 10.",
    );
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByTestId("grade-sheet-progress").textContent?.trim()).toBe(
      "1 de 2 corregidas",
    );
  });

  it("asks for a verdict when only the grade is typed", async () => {
    const onSave = mountSheet();
    flushSync();

    const grade = screen.getByTestId("grade-input-2") as HTMLInputElement;
    await fireEvent.input(grade, { target: { value: "8" } });
    await fireEvent.keyDown(grade, { key: "Enter" });
    await flush();
    flushSync();

    const result = screen.getByTestId("grade-result-2") as HTMLSelectElement;
    expect(screen.getByTestId("grade-row-error-2").textContent).toContain(
      "Elegí aprobado o no aprobado.",
    );
    expect(result.getAttribute("aria-invalid")).toBe("true");
    expect(onSave).not.toHaveBeenCalled();
  });

  it("saves on Enter, updates the counter and moves focus to the next student", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    mountSheet([gradedDelivery, delivery()], onSave);
    flushSync();

    const grade = screen.getByTestId("grade-input-1") as HTMLInputElement;
    await fireEvent.input(grade, { target: { value: "9,5" } });
    await fireEvent.keyDown(grade, { key: "Enter" });
    await flush();
    flushSync();

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        assignment_id: 7,
        enrollment_id: 1,
        grade: 9.5,
        workflow_status: DeliveryWorkflowStatus.APPROVED,
      }),
    );
    expect(document.activeElement).toBe(screen.getByTestId("grade-input-2"));
    expect(screen.getByTestId("grade-sheet-announcement").textContent).toContain(
      "1 de 2 corregidas",
    );
  });

  it("saves the comment of an untouched grade without forcing a verdict", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    mountSheet([gradedDelivery, delivery()], onSave);
    flushSync();

    const comments = screen.getByTestId("grade-comments-2") as HTMLInputElement;
    await fireEvent.input(comments, { target: { value: "Faltaron los puntos 3 y 4" } });
    await fireEvent.keyDown(comments, { key: "Enter" });
    await flush();

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        enrollment_id: 2,
        comments: "Faltaron los puntos 3 y 4",
        workflow_status: DeliveryWorkflowStatus.WAITING_FOR_CORRECTION,
      }),
    );
    expect(screen.getByTestId("grade-sheet-progress").textContent?.trim()).toBe(
      "1 de 2 corregidas",
    );
  });

  it("keeps the draft and the counter when the save fails, then recovers", async () => {
    const onSave = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(undefined);
    mountSheet([gradedDelivery, delivery()], onSave);
    flushSync();

    const grade = screen.getByTestId("grade-input-2") as HTMLInputElement;
    await fireEvent.input(grade, { target: { value: "7" } });
    await fireEvent.change(screen.getByTestId("grade-result-2"), {
      target: { value: DeliveryWorkflowStatus.REJECTED },
    });
    await fireEvent.click(screen.getByTestId("grade-save-2"));
    await flush();
    flushSync();

    expect(screen.getByTestId("grade-save-error-2").textContent).toContain(
      "No se pudo guardar. Revisá la conexión y volvé a intentar.",
    );
    expect(grade.value).toBe("7");
    expect(screen.getByTestId("grade-sheet-progress").textContent?.trim()).toBe(
      "1 de 2 corregidas",
    );

    await fireEvent.click(screen.getByTestId("grade-save-2"));
    await flush();
    flushSync();

    expect(screen.queryByTestId("grade-save-error-2")).toBeNull();
    expect(screen.getByTestId("grade-sheet-progress").textContent?.trim()).toBe(
      "2 de 2 corregidas",
    );
  });

  it("moves between fields and students with the arrow keys", async () => {
    mountSheet();
    flushSync();

    const firstGrade = screen.getByTestId("grade-input-1") as HTMLInputElement;
    await fireEvent.keyDown(firstGrade, { key: "ArrowRight" });
    expect(document.activeElement).toBe(screen.getByTestId("grade-result-1"));

    await fireEvent.keyDown(screen.getByTestId("grade-input-2"), { key: "ArrowLeft" });
    expect(document.activeElement).toBe(screen.getByTestId("grade-comments-1"));
  });

  it("flags a student enrolled after the assignment was created", () => {
    mountSheet([gradedDelivery]);
    flushSync();

    const noSheet = screen.getByTestId("grade-no-sheet-2");
    expect(noSheet.textContent).toContain("Sin planilla");
    expect(noSheet.getAttribute("title")).toContain("se crea su planilla");
  });
});
