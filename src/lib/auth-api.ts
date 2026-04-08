export interface User {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  role: 'ADMIN' | 'VIEWER' | 'EDITOR';
  church_id: string;
  church_name: string;
  schema_name?: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export interface LoginResponse {
  user: User;
}

export interface GetMeResponse {
  user: User;
}

export interface VerifyResetTokenResponse {
  valid: boolean;
  email: string;
}

const BASE_URL = '/api/v1/auth';

/**
 * Base fetch client that automatically includes credentials (cookies)
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const rs = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    // Crucial for cookie-based auth
    // Note: since /api is rewritten by Next.js, this is treated as same-origin
    // by the browser, but we include it anyway to be safe.
    credentials: options.credentials || 'include',
  });

  const responseBody = await rs.json().catch(() => null);

  if (!rs.ok) {
    console.error(`[auth-api] Error ${rs.status} on ${endpoint}:`, responseBody);
    if (responseBody?.message) {
      throw new Error(responseBody.message);
    }
    throw new Error(`Request failed with status ${rs.status}`);
  }

  // Expect API to return { data, message, status } wrapper
  if (!responseBody || responseBody.data === undefined) {
    console.debug(`[auth-api] Unexpected response body for ${endpoint}:`, responseBody);
  }
  return responseBody?.data as T;
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return apiFetch<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async (): Promise<null> => {
    return apiFetch<null>('/logout', {
      method: 'POST',
    });
  },

  forgotPassword: async (email: string): Promise<null> => {
    return apiFetch<null>('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  verifyResetToken: async (token: string): Promise<VerifyResetTokenResponse> => {
    return apiFetch<VerifyResetTokenResponse>(`/verify-reset-token?token=${encodeURIComponent(token)}`);
  },

  resetPassword: async (token: string, new_password: string): Promise<null> => {
    return apiFetch<null>('/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password }),
    });
  },

  getMe: async (): Promise<GetMeResponse> => {
    return apiFetch<GetMeResponse>('/me');
  },
};
