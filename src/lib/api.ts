import { DEFAULT_ERROR_MESSAGE } from "$lib/constants";

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = DEFAULT_ERROR_MESSAGE;
    try {
      const result = await response.json();
      errorMessage = result.error || DEFAULT_ERROR_MESSAGE;
    } catch {
      // Best effort to parse error
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const result = await response.json();
  return result.data as T;
}
