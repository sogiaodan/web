import { sanitizeForSentry } from './utils';

export interface User {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  role: 'ADMIN' | 'VIEWER' | 'EDITOR';
  church_id: string;
  church_name: string;
  schema_name?: string;
  is_first_login?: boolean;
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

  const responseText = await rs.text().catch(() => '');
  let responseBody = null;
  try {
    responseBody = responseText ? JSON.parse(responseText) : null;
  } catch {
    // Non-JSON response
  }

  if (!rs.ok) {
    const isSessionCheck = endpoint === '/me' && (rs.status === 401 || rs.status === 404);
    const message = responseBody?.message || '';
    
    if (!isSessionCheck && rs.status === 401) {
      const code = responseBody?.code;
      const isTokenInvalidError = code === 'TOKEN_EXPIRED' || code === 'TOKEN_MISSING' || code === 'INSUFFICIENT_PERMISSIONS' || code === 'INVALID_TOKEN';
      
      if (isTokenInvalidError && typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    
    if (!isSessionCheck) {
      console.error(`[auth-api] Error ${rs.status} on ${endpoint}:`, responseBody || responseText || 'No response body');
    }
    if (!isSessionCheck && rs.status >= 500) {
      import('@sentry/nextjs')
        .then(Sentry => {
          Sentry.withScope(scope => {
            scope.setTag('endpoint', endpoint);
            scope.setTag('method', options.method || 'GET');
            
            // Sanitize response body if it's JSON, otherwise truncate
            const sanitizedResponse = sanitizeForSentry(responseBody || responseText);
            let responseStr = typeof sanitizedResponse === 'string' 
              ? sanitizedResponse 
              : JSON.stringify(sanitizedResponse);

            if (responseStr.length > 2000) {
              responseStr = responseStr.substring(0, 2000) + '... [TRUNCATED]';
            }
            scope.setExtra('response_body', responseStr);

            if (options.body) {
              try {
                const bodyObj = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
                scope.setExtra('request_body', sanitizeForSentry(bodyObj));
              } catch {
                // Body might be FormData or something else non-JSON
                scope.setExtra('request_body', '[NOT_JSON_BODY]');
              }
            }
            Sentry.captureException(new Error(`[auth-api] HTTP ${rs.status} on ${endpoint}`));
          });
        })
        .catch(() => {
          // Best-effort error reporting: ignore failures to load Sentry (e.g. adblockers)
        });
    }

    if (message) {
      throw new Error(message);
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
