export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

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
    
    if (res.status === 401) {
      const code = json?.code;
      const isTokenInvalidError = code === 'TOKEN_EXPIRED' || code === 'TOKEN_MISSING' || code === 'INSUFFICIENT_PERMISSIONS' || code === 'INVALID_TOKEN';
      
      if (isTokenInvalidError && typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    
    throw new ApiError(message, res.status);
  }

  return json?.data as T;
}
