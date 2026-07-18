import { DEFAULT_ERROR_MESSAGE } from "$lib/common/constants";

function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (typeof window !== "undefined" && window.location?.origin) {
    return new URL(`/api/v1${normalizedPath}`, window.location.origin).toString();
  }

  return `http://localhost/api/v1${normalizedPath}`;
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
  fetchImpl: typeof fetch = fetch,
): Promise<T> {
  const response = await fetchImpl(buildApiUrl(path), {
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
