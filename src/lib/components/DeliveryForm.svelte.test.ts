import DeliveryForm from "$lib/components/DeliveryForm.svelte";
import { render, screen, fireEvent } from "@testing-library/svelte";
import { expect, test, vi } from "vitest";
import { flushSync } from "svelte";

test("DeliveryForm renders and saves", async () => {
  const delivery = {
    assignment_id: 1,
    student_id: 1,
    workflow_status: "NOT_DICTATED",
    grade: 0,
    ai_level: 0,
    comments: "",
  };
  const onSave = vi.fn();

  render(DeliveryForm, { delivery, onSave });

  const saveButton = screen.getByText("GUARDAR");
  await fireEvent.click(saveButton);

  expect(onSave).toHaveBeenCalled();
});

test("DeliveryForm triggers model updates and callbacks", async () => {
  const delivery = {
    assignment_id: 1,
    student_id: 1,
    workflow_status: "NOT_DICTATED",
    grade: 5.0,
    ai_level: 0,
    comments: "No comments",
  };
  const onSave = vi.fn();
  const onPrev = vi.fn();
  const onSkip = vi.fn();

  const { container } = render(DeliveryForm, { delivery, onSave, onPrev, onSkip });
  flushSync();

  // Test checkbox toggle (NOT_DICTATED -> checked -> WAITING_FOR_CORRECTION)
  const isDeliveredCheckbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
  expect(isDeliveredCheckbox).toBeTruthy();
  expect(isDeliveredCheckbox.checked).toBe(false);

  await fireEvent.click(isDeliveredCheckbox);
  flushSync();

  // Test radio buttons (Approved)
  const approvedRadio = container.querySelector('input[value="true"]') as HTMLInputElement;
  expect(approvedRadio).toBeTruthy();
  await fireEvent.click(approvedRadio);
  flushSync();

  // Test radio buttons (Rejected)
  const rejectedRadio = container.querySelector('input[value="false"]') as HTMLInputElement;
  expect(rejectedRadio).toBeTruthy();
  await fireEvent.click(rejectedRadio);
  flushSync();

  // Test grade text input
  const gradeInput = container.querySelector('input[type="number"]') as HTMLInputElement;
  expect(gradeInput).toBeTruthy();
  await fireEvent.input(gradeInput, { target: { value: "9.5" } });
  flushSync();

  // Test ai level select
  const aiSelect = container.querySelector("select") as HTMLSelectElement;
  expect(aiSelect).toBeTruthy();
  await fireEvent.change(aiSelect, { target: { value: "2" } });
  flushSync();

  // Test comments textarea
  const textarea = container.querySelector("textarea") as HTMLTextAreaElement;
  expect(textarea).toBeTruthy();
  await fireEvent.input(textarea, { target: { value: "Excellent work!" } });
  flushSync();

  // Test navigation buttons
  const prevButton = screen.getByText("« Anterior");
  const skipButton = screen.getByText("Saltar »");
  expect(prevButton).toBeTruthy();
  expect(skipButton).toBeTruthy();

  await fireEvent.click(prevButton);
  expect(onPrev).toHaveBeenCalled();

  await fireEvent.click(skipButton);
  expect(onSkip).toHaveBeenCalled();

  // Finally, trigger Save and assert that the gathered model has the correct values
  const saveButton = screen.getByText("GUARDAR");
  await fireEvent.click(saveButton);
  flushSync();

  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({
      assignment_id: 1,
      student_id: 1,
      workflow_status: "REJECTED", // Latest radio selection
      grade: 9.5,
      ai_level: 2,
      comments: "Excellent work!",
    }),
  );
});
