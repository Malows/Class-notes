import type { Delivery } from "$lib/common";
import { loadTranslations } from "$lib/common/i18n/config";
import DeliveryForm from "$lib/client/components/DeliveryForm.svelte";
import { render, screen, fireEvent, configure } from "@testing-library/svelte";
import { beforeEach, expect, test, vi } from "vitest";
import { flushSync } from "svelte";

configure({ testIdAttribute: "data-test-id" });

beforeEach(async () => {
  await loadTranslations("es", "/");
});

test("DeliveryForm renders and saves", async () => {
  const delivery: Delivery = {
    assignment_id: 1,
    enrollment_id: 1,
    workflow_status: "NOT_DICTATED" as Delivery["workflow_status"],
    grade: 0,
    ai_level: 0,
    comments: "",
  };
  const onSave = vi.fn();

  render(DeliveryForm, { delivery, onSave });

  const saveButton = screen.getByTestId("delivery-submit-btn");
  await fireEvent.click(saveButton);

  expect(onSave).toHaveBeenCalled();
});

test("DeliveryForm triggers model updates and callbacks", async () => {
  const delivery: Delivery = {
    assignment_id: 1,
    enrollment_id: 1,
    workflow_status: "NOT_DICTATED" as Delivery["workflow_status"],
    grade: 5.0,
    ai_level: 0,
    comments: "No comments",
  };
  const onSave = vi.fn();
  const onPrev = vi.fn();
  const onSkip = vi.fn();

  render(DeliveryForm, { delivery, onSave, onPrev, onSkip });
  flushSync();

  // Test checkbox toggle (NOT_DICTATED -> checked -> WAITING_FOR_CORRECTION)
  const isDeliveredCheckbox = screen.getByTestId("delivery-delivered-checkbox") as HTMLInputElement;
  expect(isDeliveredCheckbox).toBeTruthy();
  expect(isDeliveredCheckbox.checked).toBe(false);

  await fireEvent.click(isDeliveredCheckbox);
  flushSync();

  // Test radio buttons (Approved vs Rejected), each with its own test id
  const approvedRadio = screen.getByTestId("delivery-approved-radio") as HTMLInputElement;
  const rejectedRadio = screen.getByTestId("delivery-rejected-radio") as HTMLInputElement;
  expect(approvedRadio).toBeTruthy();
  expect(rejectedRadio).toBeTruthy();
  expect(approvedRadio).not.toBe(rejectedRadio);

  await fireEvent.click(approvedRadio);
  flushSync();

  await fireEvent.click(rejectedRadio);
  flushSync();

  // Test grade text input
  const gradeInput = screen.getByTestId("delivery-grade-input") as HTMLInputElement;
  expect(gradeInput).toBeTruthy();
  await fireEvent.input(gradeInput, { target: { value: "9.5" } });
  flushSync();

  // Test ai level select
  const aiSelect = screen.getByTestId("delivery-ai-level-select") as HTMLSelectElement;
  expect(aiSelect).toBeTruthy();
  await fireEvent.change(aiSelect, { target: { value: "2" } });
  flushSync();

  // Test comments textarea
  const textarea = screen.getByTestId("delivery-comments-textarea") as HTMLTextAreaElement;
  expect(textarea).toBeTruthy();
  await fireEvent.input(textarea, { target: { value: "Excellent work!" } });
  flushSync();

  // Test navigation buttons: a dirty draft asks before it is discarded
  const prevButton = screen.getByTestId("delivery-prev-btn");
  const skipButton = screen.getByTestId("delivery-skip-btn");
  expect(prevButton).toBeTruthy();
  expect(skipButton).toBeTruthy();

  await fireEvent.click(prevButton);
  expect(onPrev).toHaveBeenCalled();

  await fireEvent.click(skipButton);
  expect(onSkip).not.toHaveBeenCalled();
  expect(screen.getByTestId("delivery-unsaved-guard").textContent).toContain(
    "Hay cambios sin guardar",
  );

  await fireEvent.click(screen.getByTestId("delivery-guard-discard"));
  expect(onSkip).toHaveBeenCalled();

  // Finally, trigger Save and assert that the gathered model has the correct values
  const saveButton = screen.getByTestId("delivery-submit-btn");
  await fireEvent.click(saveButton);
  flushSync();

  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({
      assignment_id: 1,
      enrollment_id: 1,
      workflow_status: "REJECTED", // Latest radio selection
      grade: 9.5,
      ai_level: 2,
      comments: "Excellent work!",
    }),
  );
});

function draft(overrides: Partial<Delivery> = {}): Delivery {
  return {
    assignment_id: 1,
    enrollment_id: 1,
    workflow_status: "WAITING_FOR_CORRECTION" as Delivery["workflow_status"],
    grade: 0,
    ai_level: 0,
    comments: "",
    ...overrides,
  };
}

test("keeps an out-of-range grade, marks the field and shows the scale", async () => {
  const onSave = vi.fn();
  render(DeliveryForm, { delivery: draft(), onSave });
  flushSync();

  const grade = screen.getByTestId("delivery-grade-input") as HTMLInputElement;
  await fireEvent.input(grade, { target: { value: "11" } });
  await fireEvent.click(screen.getByTestId("delivery-submit-btn"));
  flushSync();

  const error = screen.getByTestId("delivery-grade-error");
  expect(error.textContent).toContain("La nota tiene que estar entre 0 y 10.");
  expect(grade.value).toBe("11");
  expect(grade.getAttribute("aria-invalid")).toBe("true");
  expect(grade.getAttribute("aria-describedby")).toContain(error.id);
  expect(onSave).not.toHaveBeenCalled();
});

test("asks for a grade when a verdict is chosen", async () => {
  const onSave = vi.fn();
  render(DeliveryForm, { delivery: draft(), onSave });
  flushSync();

  await fireEvent.click(screen.getByTestId("delivery-approved-radio"));
  await fireEvent.click(screen.getByTestId("delivery-submit-btn"));
  flushSync();

  expect(screen.getByTestId("delivery-grade-error").textContent).toContain("Ingresá una nota.");
  expect(onSave).not.toHaveBeenCalled();
});

test("accepts a comma decimal and saves with Enter", async () => {
  const onSave = vi.fn();
  render(DeliveryForm, { delivery: draft(), onSave });
  flushSync();

  await fireEvent.click(screen.getByTestId("delivery-rejected-radio"));
  const grade = screen.getByTestId("delivery-grade-input") as HTMLInputElement;
  await fireEvent.input(grade, { target: { value: "4,5" } });
  await fireEvent.keyDown(grade, { key: "Enter" });
  flushSync();

  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({
      grade: 4.5,
      workflow_status: "REJECTED",
    }),
  );
});

test("renders next navigation when a following student exists", async () => {
  const onSave = vi.fn();
  const onNext = vi.fn();
  render(DeliveryForm, { delivery: draft(), onSave, onNext });
  flushSync();

  await fireEvent.click(screen.getByTestId("delivery-next-btn"));
  expect(onNext).toHaveBeenCalled();
});

test("asks before next discards a dirty draft, and lets the teacher keep editing", async () => {
  const onSave = vi.fn();
  const onNext = vi.fn();
  render(DeliveryForm, { delivery: draft(), onSave, onNext });
  flushSync();

  const comments = screen.getByTestId("delivery-comments-textarea") as HTMLTextAreaElement;
  await fireEvent.input(comments, { target: { value: "Revisar la defensa" } });
  flushSync();

  await fireEvent.click(screen.getByTestId("delivery-next-btn"));
  flushSync();

  expect(onNext).not.toHaveBeenCalled();
  const guard = screen.getByTestId("delivery-unsaved-guard");
  expect(guard.textContent).toContain("Hay cambios sin guardar");
  expect(guard.contains(document.activeElement)).toBe(true);

  await fireEvent.click(screen.getByTestId("delivery-guard-cancel"));
  flushSync();

  expect(document.querySelector('[data-test-id="delivery-unsaved-guard"]')).toBeNull();
  expect(onNext).not.toHaveBeenCalled();
  expect(comments.value).toBe("Revisar la defensa");
  expect(document.activeElement?.getAttribute("data-test-id")).toBe("delivery-next-btn");

  await fireEvent.click(screen.getByTestId("delivery-next-btn"));
  await fireEvent.click(screen.getByTestId("delivery-guard-discard"));
  expect(onNext).toHaveBeenCalled();
});

test("lets a clean draft skip without a guard", async () => {
  const onSave = vi.fn();
  const onSkip = vi.fn();
  render(DeliveryForm, { delivery: draft(), onSave, onSkip });
  flushSync();

  await fireEvent.click(screen.getByTestId("delivery-skip-btn"));
  flushSync();

  expect(screen.queryByTestId("delivery-unsaved-guard")).toBeNull();
  expect(onSkip).toHaveBeenCalled();
});

test("keeps Guardar as the primary action while the guard is open", async () => {
  const onSave = vi.fn();
  const onNext = vi.fn();
  render(DeliveryForm, { delivery: draft(), onSave, onNext });
  flushSync();

  const grade = screen.getByTestId("delivery-grade-input") as HTMLInputElement;
  await fireEvent.input(grade, { target: { value: "8" } });
  await fireEvent.click(screen.getByTestId("delivery-next-btn"));
  flushSync();

  const save = screen.getByTestId("delivery-submit-btn");
  expect(save.classList.contains("btn-primary")).toBe(true);
  await fireEvent.click(save);
  flushSync();

  expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ grade: 8 }));
  expect(onNext).not.toHaveBeenCalled();
});
