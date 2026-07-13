import { render, screen, fireEvent, configure } from "@testing-library/svelte";
import { expect, test, vi } from "vitest";
import Toast from "./Toast.svelte";

configure({ testIdAttribute: "data-test-id" });

test("Toast renders message and dismiss button", () => {
  const mockOnDismiss = vi.fn();
  const mockToast = {
    id: 42,
    message: "Test toast alert message",
    type: "success" as const,
    autoDismiss: true,
  };

  render(Toast, { toast: mockToast, onDismiss: mockOnDismiss });

  expect(screen.getByTestId("toast-text-42")).toBeDefined();
  expect(screen.getByTestId("toast-text-42").textContent).toBe("Test toast alert message");

  const closeBtn = screen.getByTestId("toast-close-btn-42");
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

  render(Toast, { toast: mockToast, onDismiss: vi.fn() });
  const card = screen.getByTestId("toast-card-1");
  expect(card).toBeTruthy();
  expect(card.getAttribute("role")).toBe("status");
  expect(card.getAttribute("aria-live")).toBe("polite");
});

test("Toast renders with alert role for error type", () => {
  const mockToast = {
    id: 2,
    message: "Critical error message",
    type: "error" as const,
    autoDismiss: false,
  };

  render(Toast, { toast: mockToast, onDismiss: vi.fn() });
  const card = screen.getByTestId("toast-card-2");
  expect(card).toBeTruthy();
  expect(card.getAttribute("role")).toBe("alert");
  expect(card.getAttribute("aria-live")).toBe("assertive");
});
