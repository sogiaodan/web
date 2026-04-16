export interface SystemAdmin {
  id: string;
  name: string;
  email: string;
  role: 'SYSTEM_ADMIN';
}

export interface ChurchOnboardingRequest {
  name: string;
  schema_name: string;
  admin_name: string;
  admin_email: string;
  admin_password?: string;
}

export interface ChurchOnboardingResponse {
  message: string;
  church: {
    id: string;
    name: string;
    schema_name: string;
  };
  admin_email: string;
}

export interface SystemAdminLoginResponse {
  access_token: string;
  user: SystemAdmin;
}

export interface SystemAdminGetMeResponse {
  user: SystemAdmin;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface SystemAdminStats {
  total_churches: number;
  active_churches: number;
  inactive_churches: number;
  total_users: number;
  pending_contact_requests: number;
  system_status: 'ON' | 'OFF';
}

// ─── Church List ──────────────────────────────────────────────────────────────

export interface ChurchAdminInfo {
  id: string;
  name: string;
  email: string;
}

export interface ChurchListItem {
  id: string;
  name: string;
  schema_name: string;
  address: string;
  diocese: string;
  status: 'ACTIVE' | 'INACTIVE';
  logo_url: string | null;
  admin: ChurchAdminInfo | null;
  user_count: number;
  created_at: string;
}

// ─── Church Detail ────────────────────────────────────────────────────────────

export interface ChurchAdminAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
  last_login_at: string | null;
}

export interface ChurchDetail {
  id: string;
  name: string;
  schema_name: string;
  address: string | null;
  phone_number: string | null;
  diocese: string | null;
  deanery: string | null;
  established_year: number | null;
  patron_saint: string | null;
  logo_url: string | null;
  pastor_name: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  last_backup_at: string | null;
  created_at: string;
  updated_at: string;
  admins: ChurchAdminAccount[];
  user_count: number;
}

// ─── Update Church ────────────────────────────────────────────────────────────

export interface UpdateChurchRequest {
  name?: string;
  address?: string;
  phone_number?: string;
  diocese?: string;
  deanery?: string;
  pastor_name?: string;
  patron_saint?: string;
  established_year?: number;
}

export interface UpdateChurchResponse {
  id: string;
}

// ─── Toggle Status ────────────────────────────────────────────────────────────

export interface ToggleChurchStatusRequest {
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ToggleChurchStatusResponse {
  id: string;
  status: 'ACTIVE' | 'INACTIVE';
}

// ─── Contact Requests (CRM) ───────────────────────────────────────────────────

export type ContactRequestStatus = 'NEW' | 'READ' | 'REPLIED';

export interface ContactRequest {
  id: string;
  full_name: string;
  email: string;
  parish_name: string;
  message: string;
  status: ContactRequestStatus;
  created_at: string;
}

export interface UpdateContactRequestStatusRequest {
  status: ContactRequestStatus;
}

export interface UpdateContactRequestStatusResponse {
  id: string;
  status: ContactRequestStatus;
}

// ─── System Notifications ─────────────────────────────────────────────────────

/** Controls WHERE and HOW the notification appears in the user dashboard. */
export type NotificationDisplayType =
  | 'BANNER'       // Dismissable top banner
  | 'PANEL'        // Bell-icon dropdown in the header
  | 'POPUP'        // Modal on first load after login (once per session)
  | 'MAINTENANCE'; // Full-page blocking overlay

/** @deprecated Use NotificationDisplayType instead */
export type NotificationType = NotificationDisplayType;

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  /** Optional HTML body. When set a "Xem chi tiết" button is shown. */
  extended_content: string | null;
  display_type: NotificationDisplayType;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Alias used by user-facing components */
export type ActiveNotification = SystemNotification;

export interface CreateSystemNotificationRequest {
  title: string;
  message: string;
  extended_content?: string;
  display_type?: NotificationDisplayType;
  is_active?: boolean;
  starts_at?: string;
  ends_at?: string;
}

export interface UpdateSystemNotificationRequest {
  title?: string;
  message?: string;
  extended_content?: string;
  display_type?: NotificationDisplayType;
  is_active?: boolean;
  starts_at?: string;
  ends_at?: string;
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  action_type: string;
  entity_type: string;
  entity_id: string | null;
  description: string;
  user_name: string;
  church_name: string;
  schema_name: string;
  created_at: string;
}

export interface AuditLogQuery {
  page?: number;
  limit?: number;
  action_type?: string;
  church_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface AuditLogListResponse {
  items: AuditLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// ─── Backups ──────────────────────────────────────────────────────────────────

export interface BackupRecord {
  id: string;
  church_id: string;
  church_name: string;
  schema_name: string;
  triggered_by: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  file_size_bytes: number | null;
  created_at: string;
  completed_at: string | null;
}

export interface TriggerBackupResponse {
  message: string;
  church_id: string;
}
