import { ActiveNotification } from '@/types/system-admin';


/**
 * Fetches active, in-window system notifications.
 * No authentication required — also used pre-login for maintenance overlay.
 */
export async function fetchActiveNotifications(): Promise<ActiveNotification[]> {
  const res = await fetch('/api/v1/system-admin/notifications/active', {
    cache: 'no-store',
    credentials: 'omit',
  });
  if (!res.ok) throw new Error('Failed to fetch active notifications');
  const json = await res.json();
  return json.data ?? [];
}
