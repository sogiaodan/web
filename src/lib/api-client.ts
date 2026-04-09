/**
 * Client-side fetch wrapper for React Query hooks.
 * Automatically includes credentials (HttpOnly cookies via rewrite proxy)
 * and handles the standard API response format.
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
    credentials: "include",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message = json?.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return json?.data as T;
}
