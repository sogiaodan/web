import { 
  SystemAdminLoginResponse, 
  SystemAdminGetMeResponse,
  ChurchOnboardingRequest,
  ChurchOnboardingResponse,
  SystemAdminStats,
  ChurchListItem,
  ChurchDetail,
  UpdateChurchRequest,
  UpdateChurchResponse,
  ToggleChurchStatusRequest,
  ToggleChurchStatusResponse,
  ContactRequest,
  UpdateContactRequestStatusRequest,
  UpdateContactRequestStatusResponse,
  SystemNotification,
  CreateSystemNotificationRequest,
  UpdateSystemNotificationRequest,
  AuditLogQuery,
  AuditLogListResponse,
  BackupRecord,
  TriggerBackupResponse,
} from '../types/system-admin';
import { sanitizeForSentry } from './utils';

const BASE_URL = '/api/v1/system-admin';

/**
 * Base fetch client that automatically includes credentials (cookies).
 * Mirrors apiFetch from @/lib/api-client but dispatches the
 * `sysadmin:unauthorized` event instead of `auth:unauthorized`.
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers as HeadersInit);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const rs = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const responseBody = await rs.json().catch(() => null);

  if (!rs.ok) {
    const message = responseBody?.message || `Request failed with status ${rs.status}`;
    
    if (rs.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sysadmin:unauthorized'));
    }
    
    if (rs.status >= 500) {
      import('@sentry/nextjs')
        .then(Sentry => {
          Sentry.withScope(scope => {
            scope.setTag('endpoint', endpoint);
            scope.setTag('method', options.method || 'GET');
            
            // Sanitize status message/response if it looks like JSON
            let sanitizedMsg = message;
            try {
              if (message && (message.startsWith('{') || message.startsWith('['))) {
                sanitizedMsg = JSON.stringify(sanitizeForSentry(JSON.parse(message)));
              }
            } catch {}
            if (sanitizedMsg.length > 2000) {
              sanitizedMsg = sanitizedMsg.substring(0, 2000) + '... [TRUNCATED]';
            }
            scope.setExtra('response_body', sanitizedMsg);

            if (options.body) {
              try {
                const bodyObj = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
                scope.setExtra('request_body', sanitizeForSentry(bodyObj));
              } catch {
                scope.setExtra('request_body', '[NON_JSON_BODY]');
              }
            }
            Sentry.captureException(new Error(`[system-admin-api] HTTP ${rs.status} on ${endpoint}`));
          });
        })
        .catch(() => {
          // Best-effort error reporting: ignore failures to load Sentry (e.g. adblockers)
        });
    }

    const err = new Error(message) as Error & { status?: number };
    err.status = rs.status;
    throw err;
  }

  if (rs.status === 204 || responseBody == null) {
    return null as T;
  }

  return responseBody?.data as T;
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

  // ─── Stats ──────────────────────────────────────────────────────────────

  getStats: async (): Promise<SystemAdminStats> => {
    return apiFetch<SystemAdminStats>('/stats');
  },

  // ─── Churches ────────────────────────────────────────────────────────────

  getChurches: async (params?: { search?: string; status?: 'ACTIVE' | 'INACTIVE' }): Promise<ChurchListItem[]> => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString();
    return apiFetch<ChurchListItem[]>(`/churches${query ? `?${query}` : ''}`);
  },

  createChurch: async (data: ChurchOnboardingRequest): Promise<ChurchOnboardingResponse> => {
    return apiFetch<ChurchOnboardingResponse>('/churches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getChurchById: async (id: string): Promise<ChurchDetail> => {
    return apiFetch<ChurchDetail>(`/churches/${id}`);
  },

  updateChurch: async (id: string, data: UpdateChurchRequest): Promise<UpdateChurchResponse> => {
    return apiFetch<UpdateChurchResponse>(`/churches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  toggleChurchStatus: async (
    id: string,
    data: ToggleChurchStatusRequest,
  ): Promise<ToggleChurchStatusResponse> => {
    return apiFetch<ToggleChurchStatusResponse>(`/churches/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // ─── Contact Requests ─────────────────────────────────────────────────────

  getContactRequests: async (): Promise<ContactRequest[]> => {
    return apiFetch<ContactRequest[]>('/contact-requests');
  },

  updateContactRequestStatus: async (
    id: string,
    data: UpdateContactRequestStatusRequest,
  ): Promise<UpdateContactRequestStatusResponse> => {
    return apiFetch<UpdateContactRequestStatusResponse>(`/contact-requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // ─── System Notifications ─────────────────────────────────────────────────

  getNotifications: async (): Promise<SystemNotification[]> => {
    return apiFetch<SystemNotification[]>('/notifications');
  },

  createNotification: async (data: CreateSystemNotificationRequest): Promise<{ id: string }> => {
    return apiFetch<{ id: string }>('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateNotification: async (
    id: string,
    data: UpdateSystemNotificationRequest,
  ): Promise<{ id: string }> => {
    return apiFetch<{ id: string }>(`/notifications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteNotification: async (id: string): Promise<null> => {
    return apiFetch<null>(`/notifications/${id}`, { method: 'DELETE' });
  },

  // ─── Audit Logs ───────────────────────────────────────────────────────────

  getAuditLogs: async (params?: AuditLogQuery): Promise<AuditLogListResponse> => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.action_type) qs.set('action_type', params.action_type);
    if (params?.church_id) qs.set('church_id', params.church_id);
    if (params?.date_from) qs.set('date_from', params.date_from);
    if (params?.date_to) qs.set('date_to', params.date_to);
    const query = qs.toString();
    return apiFetch<AuditLogListResponse>(`/audit-logs${query ? `?${query}` : ''}`);
  },

  // ─── Backups ─────────────────────────────────────────────────────────────

  getBackups: async (): Promise<BackupRecord[]> => {
    return apiFetch<BackupRecord[]>('/backups');
  },

  triggerChurchBackup: async (id: string): Promise<TriggerBackupResponse> => {
    return apiFetch<TriggerBackupResponse>(`/churches/${id}/backup`, { method: 'POST' });
  },
};
