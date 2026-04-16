'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Bell, AlertCircle, Monitor, Rows3 } from 'lucide-react';
import Link from 'next/link';
import { fetchActiveNotifications } from '@/lib/api/notifications';
import { ActiveNotification, NotificationDisplayType } from '@/types/system-admin';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import clsx from 'clsx';
import DOMPurify from 'isomorphic-dompurify';

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function getTypeMeta(type: NotificationDisplayType) {
  switch (type) {
    case 'BANNER':      return { label: 'Banner',       icon: AlertCircle, color: 'text-primary bg-primary/10' };
    case 'PANEL':       return { label: 'Thông báo',    icon: Bell,        color: 'text-blue-700 bg-blue-50' };
    case 'POPUP':       return { label: 'Popup thông báo', icon: Rows3,    color: 'text-violet-700 bg-violet-50' };
    case 'MAINTENANCE': return { label: 'Bảo trì',      icon: Monitor,     color: 'text-amber-700 bg-amber-50' };
  }
}

export default function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [notif, setNotif] = useState<ActiveNotification | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchActiveNotifications()
      .then((list) => {
        const found = list.find((n) => n.id === id) ?? null;
        if (found) {
          setNotif(found);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (notFound || !notif?.extended_content) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center space-y-4">
        <Bell className="h-12 w-12 text-muted/40 mx-auto" />
        <p className="font-serif text-xl font-bold text-foreground">
          {notFound ? 'Thông báo không tồn tại hoặc đã hết hạn.' : 'Thông báo này không có nội dung chi tiết.'}
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Quay về trang chủ
        </Link>
      </div>
    );
  }

  const meta = getTypeMeta(notif.display_type);
  const Icon = meta.icon;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </button>

      {/* Header card */}
      <div className="bg-white border border-outline rounded-sm shadow-sm p-6 space-y-4">
        {/* Type badge */}
        <div className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider', meta.color)}>
          <Icon className="h-3.5 w-3.5" />
          {meta.label}
        </div>

        <h1 className="font-serif text-2xl font-bold text-foreground leading-snug">
          {notif.title}
        </h1>

        <p className="text-base text-muted leading-relaxed">{notif.message}</p>

        {(notif.starts_at || notif.ends_at) && (
          <div className="flex items-center gap-2 text-sm text-muted border-t border-outline/40 pt-4">
            <Calendar className="h-4 w-4 text-muted/60 shrink-0" />
            <span>
              {notif.starts_at ? formatDate(notif.starts_at) : 'Không giới hạn'}
              {' → '}
              {notif.ends_at ? formatDate(notif.ends_at) : 'Không giới hạn'}
            </span>
          </div>
        )}
      </div>

      {/* Extended HTML content — rendered in a sandboxed prose container */}
      <div
        className="bg-white border border-outline rounded-sm shadow-sm p-6 prose prose-sm max-w-none
          prose-headings:font-serif prose-headings:text-foreground
          prose-p:text-foreground prose-p:leading-relaxed
          prose-a:text-primary prose-a:underline
          prose-strong:text-foreground
          prose-ul:list-disc prose-ol:list-decimal"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(notif.extended_content) }}
      />
    </div>
  );
}
