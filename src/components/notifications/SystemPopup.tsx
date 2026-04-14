'use client';

import { useState, useSyncExternalStore } from 'react';
import { X, ChevronRight, Bell } from 'lucide-react';
import Link from 'next/link';
import { ActiveNotification } from '@/types/system-admin';

interface SystemPopupProps {
  notifications: ActiveNotification[];
}

const DISMISSED_KEY = 'sgd_dismissed_popups';

function getDismissedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function persistDismissed(ids: Set<string>) {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}

const emptySubscribe = () => () => {};

/**
 * Shows POPUP notifications once per browser session.
 * If multiple exist, shows the most recently created one first.
 */
export default function SystemPopup({ notifications }: SystemPopupProps) {
  const [, setStamp] = useState(0); // For forcing re-renders when dismissing
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!isClient) return null;

  // We depend on stamp just so React knows state changed and forces a re-render.
  // The actual state evaluation uses synchronous reads from localStorage
  const dismissed = getDismissedIds();
  const pending = notifications
    .filter((n) => n.display_type === 'POPUP' && !dismissed.has(n.id))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (!pending.length) return null;

  const current = pending[0];

  const handleDismiss = () => {
    const d = getDismissedIds();
    d.add(current.id);
    persistDismissed(d);
    setStamp((s) => s + 1);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white rounded-sm border border-outline shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 bg-primary text-white">
          <div className="p-2 bg-white/20 rounded-sm">
            <Bell className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-serif font-bold text-lg leading-tight truncate">{current.title}</p>
            <p className="text-[10px] uppercase tracking-widest opacity-75 font-bold mt-0.5">Thông báo hệ thống</p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors ml-2 shrink-0"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          <p className="text-sm text-foreground leading-relaxed">{current.message}</p>

          <div className="flex items-center justify-end gap-3">
            {current.extended_content && (
              <Link
                href={`/dashboard/announcements/${current.id}`}
                onClick={handleDismiss}
                className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-sm bg-primary text-white text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors"
              >
                Xem chi tiết <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
            <button
              onClick={handleDismiss}
              className="px-4 py-2 min-h-[40px] rounded-sm border border-outline text-sm font-bold text-foreground hover:bg-hover-bg transition-colors"
            >
              Đã hiểu
            </button>
          </div>

          {pending.length > 1 && (
            <p className="text-xs text-muted text-center">
              Còn {pending.length - 1} thông báo khác
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
