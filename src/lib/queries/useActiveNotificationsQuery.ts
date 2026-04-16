'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchActiveNotifications } from '@/lib/api/notifications';
import { ActiveNotification } from '@/types/system-admin';

export function useActiveNotificationsQuery() {
  return useQuery<ActiveNotification[]>({
    queryKey: ['active-notifications'],
    queryFn: fetchActiveNotifications,
    // Refresh every 5 minutes so long-running sessions pick up new notices
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    // Don't throw on error — silently fail so it doesn't break the dashboard
    retry: 1,
  });
}
