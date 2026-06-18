import DeliveryForm from "$lib/components/DeliveryForm.svelte";
import { render, screen, fireEvent } from "@testing-library/svelte";
import { expect, test, vi } from "vitest";

test("DeliveryForm renders and saves", async () => {
  const delivery = {
    assignment_id: 1,
    student_id: 1,
    is_delivered: false,
    is_approved: false,
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
