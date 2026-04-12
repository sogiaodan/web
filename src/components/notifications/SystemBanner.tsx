'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { ActiveNotification } from '@/types/system-admin';
import clsx from 'clsx';

interface SystemBannerProps {
  notifications: ActiveNotification[];
}

const DISMISSED_KEY = 'sgd_dismissed_banners';

/** Dismissable top banner for BANNER-type notifications. */
export default function SystemBanner({ notifications }: SystemBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DISMISSED_KEY);
      if (saved) setDismissedIds(new Set(JSON.parse(saved)));
    } catch (e) {
      console.error('Failed to load dismissed banners', e);
    }
    setIsHydrated(true);
  }, []);

  const visible = notifications.filter(
    (n) => n.display_type === 'BANNER' && !dismissedIds.has(n.id),
  );

  const handleDismiss = (id: string) => {
    const next = new Set(dismissedIds);
    next.add(id);
    setDismissedIds(next);
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify([...next]));
    } catch (e) {
      // ignore
    }
  };

  if (!isHydrated || !visible.length) return null;

  return (
    <div className="space-y-0">
      {visible.map((notif) => (
        <div
          key={notif.id}
          className={clsx(
            'relative flex items-center gap-3 px-4 py-2.5 text-sm',
            'bg-primary text-white',
            'animate-in slide-in-from-top duration-300',
          )}
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />

          <p className="flex-1 font-medium leading-snug">
            <strong>{notif.title}</strong>
            {notif.message && (
              <span className="ml-1.5 font-normal opacity-90">— {notif.message}</span>
            )}
          </p>

          {notif.extended_content && (
            <Link
              href={`/dashboard/announcements/${notif.id}`}
              className="flex items-center gap-1 text-xs font-bold underline underline-offset-2 hover:opacity-80 transition-opacity whitespace-nowrap shrink-0"
            >
              Xem chi tiết <ChevronRight className="h-3 w-3" />
            </Link>
          )}

          <button
            onClick={() => handleDismiss(notif.id)}
            className="ml-1 p-1 rounded hover:bg-white/20 transition-colors shrink-0"
            aria-label="Đóng thông báo"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
