import { API_BASE_URL } from './configs';
import { cookies } from 'next/headers';

export interface ServerApiResponse<T = unknown> {
  data: T;
  message?: string;
  status?: number;
}

export async function apiServerFetch<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<ServerApiResponse<T> | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (cookieHeader && !headers.has('Cookie')) {
    headers.set('Cookie', cookieHeader);
  }

  // Ensure endpoint is well-formed relative to the backend API base url.
  // Next.js client uses rewrites so it fetches /api/... 
  // On the server, we fetch the real backend URL directly.
  let fullUrl = endpoint;
  if (!fullUrl.startsWith('http')) {
      // If endpoint already has /api/v1, don't prepend it again
      if (endpoint.startsWith('/api/')) {
        fullUrl = `${API_BASE_URL}${endpoint}`;
      } else {
        fullUrl = `${API_BASE_URL}/api/v1${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
      }
  }

  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers,
      cache: 'no-store', // Always bypass Next.js fetch caching for server-side API requests
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      // Suppress error logging for expected auth failures or missing user sessions
      // (Common when session expires or database is reset during development)
      const isAuthPath = fullUrl.includes('/auth/me');
      if (res.status === 401 || (res.status === 404 && isAuthPath)) {
        return null;
      }

      console.error(`serverFetch failed:`, fullUrl, res.status, body?.message);
      return null;
    }

    return body as ServerApiResponse<T>;
  } catch (error) {
    console.error(`serverFetch error:`, fullUrl, error);
    return null;
  }
}
