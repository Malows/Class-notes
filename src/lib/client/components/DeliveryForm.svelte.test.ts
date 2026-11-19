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

  // Test navigation buttons
  const prevButton = screen.getByTestId("delivery-prev-btn");
  const skipButton = screen.getByTestId("delivery-skip-btn");
  expect(prevButton).toBeTruthy();
  expect(skipButton).toBeTruthy();

  await fireEvent.click(prevButton);
  expect(onPrev).toHaveBeenCalled();

  await fireEvent.click(skipButton);
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
