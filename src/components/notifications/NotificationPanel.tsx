'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import { ActiveNotification } from '@/types/system-admin';
import clsx from 'clsx';

interface NotificationPanelProps {
  notifications: ActiveNotification[];
}

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days  > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  if (mins  > 0) return `${mins} phút trước`;
  return 'Vừa xong';
}

/**
 * Bell icon + dropdown panel for PANEL-type notifications in the dashboard header.
 */
export default function NotificationPanel({ notifications }: NotificationPanelProps) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  const panelItems = notifications.filter((n) => n.display_type !== 'MAINTENANCE');
  const unread = panelItems.filter((n) => !readIds.has(n.id));

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const markAllRead = () => {
    const newIds = new Set(readIds);
    panelItems.forEach((n) => newIds.add(n.id));
    setReadIds(newIds);
  };


  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen((prev) => !prev); if (!open) markAllRead(); }}
        className="relative p-2 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-full hover:bg-hover-bg text-muted hover:text-foreground transition-colors"
        aria-label={`${unread.length} thông báo chưa đọc`}
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unread.length > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-outline rounded-sm shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline bg-vellum/50">
            <p className="text-xs font-bold uppercase tracking-widest text-muted">Thông báo hệ thống</p>
            <button
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-outline/60 rounded transition-colors text-muted"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Items */}
          <div className="max-h-80 overflow-y-auto divide-y divide-outline/40">
            {panelItems.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-muted italic">
                Không có thông báo nào.
              </div>
            ) : (
              panelItems.map((notif) => (
                <div
                  key={notif.id}
                  className={clsx(
                    'px-4 py-3.5 space-y-1.5 transition-colors',
                    unread.some(u => u.id === notif.id) ? 'bg-primary/[0.03]' : 'hover:bg-hover-bg',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {notif.display_type === 'BANNER' && <span className="text-[8px] font-bold uppercase px-1 bg-primary/10 text-primary rounded">Banner</span>}
                        {notif.display_type === 'POPUP' && <span className="text-[8px] font-bold uppercase px-1 bg-violet-50 text-violet-700 rounded">Popup</span>}
                        <p className="text-sm font-bold text-foreground leading-snug truncate">
                          {notif.title}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted whitespace-nowrap pt-0.5 shrink-0">
                      {formatRelativeTime(notif.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed line-clamp-2">{notif.message}</p>
                  {notif.extended_content && (
                    <Link
                      href={`/dashboard/announcements/${notif.id}`}
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                    >
                      Xem chi tiết <ChevronRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
