import { DEFAULT_ERROR_MESSAGE } from "$lib/constants";

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || DEFAULT_ERROR_MESSAGE);
  }

  return result.data as T;
}
