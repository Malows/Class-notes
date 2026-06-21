import { render, screen, fireEvent } from "@testing-library/svelte";
import { expect, test, vi } from "vitest";
import Toast from "./Toast.svelte";

test("Toast renders message and dismiss button", () => {
  const mockOnDismiss = vi.fn();
  const mockToast = {
    id: 42,
    message: "Test toast alert message",
    type: "success" as const,
    autoDismiss: true,
  };

  render(Toast, { toast: mockToast, onDismiss: mockOnDismiss });

  expect(screen.getByText("Test toast alert message")).toBeDefined();
  const closeBtn = screen.getByRole("button", { name: "Cerrar notificación" });
  expect(closeBtn).toBeDefined();

  fireEvent.click(closeBtn);
  expect(mockOnDismiss).toHaveBeenCalledWith(42);
});

test("Toast renders with status role for success type", () => {
  const mockToast = {
    id: 1,
    message: "Success status message",
    type: "success" as const,
    autoDismiss: true,
  };

  const { container } = render(Toast, { toast: mockToast, onDismiss: vi.fn() });
  const card = container.querySelector(".toast-card");
  expect(card).toBeTruthy();
  expect(card?.getAttribute("role")).toBe("status");
  expect(card?.getAttribute("aria-live")).toBe("polite");
});

test("Toast renders with alert role for error type", () => {
  const mockToast = {
    id: 2,
    message: "Critical error message",
    type: "error" as const,
    autoDismiss: false,
  };

  const { container } = render(Toast, { toast: mockToast, onDismiss: vi.fn() });
  const card = container.querySelector(".toast-card");
  expect(card).toBeTruthy();
  expect(card?.getAttribute("role")).toBe("alert");
  expect(card?.getAttribute("aria-live")).toBe("assertive");
});
