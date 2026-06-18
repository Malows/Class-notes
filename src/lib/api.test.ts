import { expect, test, vi, beforeEach } from "vitest";
import { apiFetch } from "./api";
import { DEFAULT_ERROR_MESSAGE } from "$lib/constants";

beforeEach(() => {
  vi.restoreAllMocks();
});

test("apiFetch parses successful json response and returns data", async () => {
  const mockData = { id: 1, name: "Test" };
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ data: mockData }),
  });
  global.fetch = fetchMock;

  const result = await apiFetch<typeof mockData>("/test");

  expect(fetchMock).toHaveBeenCalledWith("/api/v1/test", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  expect(result).toEqual(mockData);
});

test("apiFetch merges options and custom headers", async () => {
  const mockData = { ok: true };
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ data: mockData }),
  });
  global.fetch = fetchMock;

  await apiFetch("/test", {
    method: "POST",
    headers: { "X-Custom": "Value" },
  });

  expect(fetchMock).toHaveBeenCalledWith("/api/v1/test", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Custom": "Value",
    },
  });
});

test("apiFetch throws error from response body when not ok", async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: false,
    json: async () => ({ error: "Server Error" }),
  });
  global.fetch = fetchMock;

  await expect(apiFetch("/test")).rejects.toThrow("Server Error");
});

test("apiFetch throws default error message when response body lacks custom error", async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: false,
    json: async () => ({}),
  });
  global.fetch = fetchMock;

  await expect(apiFetch("/test")).rejects.toThrow(DEFAULT_ERROR_MESSAGE);
});
