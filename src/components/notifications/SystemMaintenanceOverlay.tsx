'use client';

import { Wrench, Clock } from 'lucide-react';
import { ActiveNotification } from '@/types/system-admin';

interface SystemMaintenanceOverlayProps {
  notifications: ActiveNotification[];
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    hour12: false,
  });
}

/**
 * Full-page blocking overlay for MAINTENANCE notifications.
 * Renders on top of everything and cannot be dismissed by the user.
 * The overlay disappears automatically when the maintenance window ends
 * (next poll cycle refreshes the query).
 */
export default function SystemMaintenanceOverlay({ notifications }: SystemMaintenanceOverlayProps) {
  const maintenance = notifications.find((n) => n.display_type === 'MAINTENANCE');

  if (!maintenance) return null;

  const endTime = formatDate(maintenance.ends_at);

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm p-8"
      role="alertdialog"
      aria-modal="true"
      aria-label="Hệ thống đang bảo trì"
    >
      {/* Animated gears */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <Wrench className="h-12 w-12 text-primary" />
        </div>
      </div>

      <div className="text-center max-w-md space-y-4">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          {maintenance.title}
        </h1>

        <p className="text-base text-muted leading-relaxed">
          {maintenance.message}
        </p>

        {endTime && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-sm text-sm text-amber-800">
            <Clock className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Dự kiến hoàn thành: <strong>{endTime}</strong></span>
          </div>
        )}

        <p className="text-xs text-muted italic pt-4">
          Trang sẽ tự động cập nhật khi hệ thống hoạt động trở lại.
        </p>
      </div>
    </div>
  );
}
