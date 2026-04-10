import { 
  SystemAdminLoginResponse, 
  SystemAdminGetMeResponse,
  ChurchOnboardingRequest,
  ChurchOnboardingResponse
} from '../types/system-admin';

const BASE_URL = '/api/v1/system-admin';

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
    credentials: options.credentials || 'include',
  });

  const responseBody = await rs.json().catch(() => null);

  if (!rs.ok) {
    const message = responseBody?.message || '';
    
    if (rs.status === 401) {
      const code = responseBody?.code;
      const isTokenInvalidError = code === 'TOKEN_EXPIRED' || code === 'TOKEN_MISSING' || code === 'INSUFFICIENT_PERMISSIONS' || code === 'INVALID_TOKEN';
      
      if (isTokenInvalidError && typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sysadmin:unauthorized'));
      }
    }
    
    if (message) {
      throw new Error(message);
    }
    throw new Error(`Request failed with status ${rs.status}`);
  }

  // Expect API to return { data, message, status } wrapper
  return responseBody.data as T;
}

export const systemAdminApi = {
  login: async (email: string, password: string): Promise<SystemAdminLoginResponse> => {
    return apiFetch<SystemAdminLoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getMe: async (): Promise<SystemAdminGetMeResponse> => {
    return apiFetch<SystemAdminGetMeResponse>('/me');
  },

  logout: async (): Promise<null> => {
    return apiFetch<null>('/logout', {
      method: 'POST',
    });
  },

  createChurch: async (data: ChurchOnboardingRequest): Promise<ChurchOnboardingResponse> => {
    return apiFetch<ChurchOnboardingResponse>('/churches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
