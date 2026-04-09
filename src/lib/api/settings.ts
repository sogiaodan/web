const BASE_URL = '/api/v1';

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
    if (responseBody?.message) {
      throw new Error(responseBody.message);
    }
    throw new Error(`Request failed with status ${rs.status}`);
  }

  return responseBody.data as T;
}
export interface UserProfileResponse {
  data: {
    id: string;
    name: string;
    email: string;
    phone_number: string | null;
    role: string;
    church_id: string;
    church_name: string;
    status: string;
    last_login_at: string;
    created_at: string;
  };
  message: string;
  status: number;
}

export interface UpdateProfileParams {
  name: string;
  email: string;
  phone_number?: string | null;
}

export interface BackupStatusResponse {
  data: {
    last_backup_at: string | null;
    system_version: string;
  };
  message: string;
  status: number;
}

export interface ParishInfo {
  name: string;
  logo_url: string | null;
  diocese: string | null;
  deanery: string | null;
  patron_saint: string | null;
  established_year: number | null;
  address: string | null;
  phone_number: string | null;
  pastor_name: string | null;
}

export interface ParishInfoResponse {
  data: ParishInfo;
  message: string;
  status: number;
}

export const SettingsAPI = {
  getProfile: async (): Promise<UserProfileResponse> => {
    const data = await apiFetch<UserProfileResponse['data']>('/settings/profile');
    return { data, message: '', status: 200 };
  },

  updateProfile: async (data: UpdateProfileParams): Promise<any> => {
    return apiFetch<any>('/settings/profile', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  changePassword: async (data: any): Promise<any> => {
    return apiFetch<any>('/settings/change-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getBackupStatus: async (): Promise<BackupStatusResponse> => {
    const data = await apiFetch<BackupStatusResponse['data']>('/settings/backup/status');
    return { data, message: '', status: 200 };
  },
  
  triggerBackup: async (): Promise<void> => {
    // Handling binary download via standard fetch to trigger browser download
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/settings/backup`, {
      method: 'POST',
      headers: {
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Backup failed');
    }

    // Creating download link
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'backup.zip';
    if (contentDisposition && contentDisposition.includes('filename=')) {
      filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
    }
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  getParishInfo: async (): Promise<ParishInfoResponse> => {
    const data = await apiFetch<ParishInfo>('/settings/parish');
    return { data, message: '', status: 200 };
  },

  updateParishInfo: async (data: Partial<ParishInfo>): Promise<any> => {
    return apiFetch<any>('/settings/parish', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  uploadLogo: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('logo', file);
    
    // We use standard fetch here because apiFetch forces application/json Content-Type
    const response = await fetch('/api/v1/settings/parish/logo', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    const responseData = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(responseData?.message || 'Logo upload failed');
    }
    return responseData;
  }
};

export interface Account {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  status: 'ACTIVE' | 'LOCKED';
  last_login_at: string | null;
  created_at: string;
}

export interface AccountsResponse {
  data: {
    items: Account[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
    stats: {
      total_accounts: number;
      active_count: number;
      locked_count: number;
      last_updated_at: string | null;
    };
  };
}

export const SettingsAccountsAPI = {
  list: async (params: { page?: number; limit?: number; role?: string } = {}): Promise<AccountsResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.role) query.append('role', params.role);
    
    const data = await apiFetch<AccountsResponse['data']>(`/settings/accounts?${query.toString()}`);
    return { data } as AccountsResponse;
  },

  create: async (data: any): Promise<any> => {
    return apiFetch<any>('/settings/accounts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  update: async (id: string, data: any): Promise<any> => {
    return apiFetch<any>(`/settings/accounts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  toggleStatus: async (id: string, status: string): Promise<any> => {
    return apiFetch<any>(`/settings/accounts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  resendInvite: async (id: string): Promise<{ data: { id: string; mode: string }; message: string; status: number }> => {
    const rs = await fetch(`/api/v1/settings/accounts/${id}/resend-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const body = await rs.json().catch(() => null);
    if (!rs.ok) {
      const err: any = new Error(body?.message || 'Có lỗi xảy ra');
      err.code = body?.message?.code;
      throw err;
    }
    return body; // { data, message, status }
  },
};

export interface SaintName {
  name: string;
  gender: 'MALE' | 'FEMALE';
  is_popular: boolean;
}

export interface SaintNamesResponse {
  data: SaintName[];
  message: string;
  status: number;
}

export const SettingsSaintsAPI = {
  list: async (): Promise<SaintNamesResponse> => {
    const data = await apiFetch<SaintName[]>('/settings/saints');
    return { data, message: '', status: 200 };
  },

  create: async (data: { name: string; gender: 'MALE' | 'FEMALE'; is_popular?: boolean }): Promise<any> => {
    return apiFetch<any>('/settings/saints', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  update: async (name: string, data: { new_name?: string; gender?: 'MALE' | 'FEMALE'; is_popular?: boolean }): Promise<any> => {
    return apiFetch<any>(`/settings/saints/${encodeURIComponent(name)}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  delete: async (name: string): Promise<any> => {
    return apiFetch<any>(`/settings/saints/${encodeURIComponent(name)}`, {
      method: 'DELETE'
    });
  }
};
