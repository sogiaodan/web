'use client';

import { useState, useCallback } from 'react';
import {
  Mail,
  MailOpen,
  CheckCircle2,
  Clock,
  Building2,
  MessageSquare,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import clsx from 'clsx';
import {
  useSystemAdminContactRequestsQuery,
  useUpdateContactRequestStatusMutation,
} from '@/lib/queries/useSystemAdminQueries';
import { ContactRequest, ContactRequestStatus } from '@/types/system-admin';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusMeta(status: ContactRequestStatus) {
  switch (status) {
    case 'NEW':
      return { label: 'Mới', icon: Mail, class: 'bg-blue-50 text-blue-700 border-blue-100' };
    case 'READ':
      return { label: 'Đã đọc', icon: MailOpen, class: 'bg-amber-50 text-amber-700 border-amber-100' };
    case 'REPLIED':
      return { label: 'Đã phản hồi', icon: CheckCircle2, class: 'bg-green-50 text-green-700 border-green-100' };
  }
}

const STATUS_ORDER: ContactRequestStatus[] = ['NEW', 'READ', 'REPLIED'];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CrmSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white border border-outline rounded-sm p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-40 bg-outline/40 rounded" />
            <div className="h-5 w-20 bg-outline/30 rounded" />
          </div>
          <div className="h-3 w-56 bg-outline/30 rounded" />
          <div className="h-10 w-full bg-outline/20 rounded" />
        </div>
      ))}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ContactRequestStatus }) {
  const meta = getStatusMeta(status);
  const Icon = meta.icon;
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider border',
      meta.class,
    )}>
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

// ─── Status Changer ───────────────────────────────────────────────────────────

function StatusChanger({ request }: { request: ContactRequest }) {
  const [open, setOpen] = useState(false);
  const mutation = useUpdateContactRequestStatusMutation(request.id);

  const handleChange = useCallback((status: ContactRequestStatus) => {
    mutation.mutate({ status });
    setOpen(false);
  }, [mutation]);

  const nextStatuses = STATUS_ORDER.filter((s) => s !== request.status);

  return (
    <div className="relative">
      <button
        id={`btn-status-${request.id}`}
        onClick={() => setOpen((p) => !p)}
        disabled={mutation.isPending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[40px] rounded-sm border border-outline bg-white text-xs font-bold text-muted hover:bg-hover-bg transition-colors disabled:opacity-50"
      >
        {mutation.isPending ? 'Đang lưu...' : 'Đổi trạng thái'}
        <ChevronDown className={clsx("h-3 w-3 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-30 bg-white border border-outline rounded-sm shadow-lg min-w-[160px] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {nextStatuses.map((s) => {
              const meta = getStatusMeta(s);
              const Icon = meta.icon;
              return (
                <button
                  key={s}
                  onClick={() => handleChange(s)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-hover-bg transition-colors text-foreground text-left"
                >
                  <Icon className="h-4 w-4 text-muted" />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Request Card ─────────────────────────────────────────────────────────────

function RequestCard({ request }: { request: ContactRequest }) {
  const [expanded, setExpanded] = useState(request.status === 'NEW');

  return (
    <article
      className={clsx(
        'bg-white border rounded-sm shadow-sm transition-all duration-200',
        request.status === 'NEW'
          ? 'border-blue-200 shadow-blue-50'
          : 'border-outline',
      )}
    >
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 cursor-pointer select-none hover:bg-vellum/30 transition-colors rounded-t-sm"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-start gap-3">
          <div className={clsx(
            'h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5',
            request.status === 'NEW' ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-500',
          )}>
            {request.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-foreground leading-tight">{request.full_name}</p>
            <p className="text-xs text-muted mt-0.5">{request.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:shrink-0">
          <StatusBadge status={request.status} />
          <ChevronDown className={clsx('h-4 w-4 text-muted transition-transform duration-200', expanded && 'rotate-180')} />
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="border-t border-outline/50 p-5 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-xs text-muted">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="font-medium text-foreground">{request.parish_name}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{formatDate(request.created_at)}</span>
            </div>
          </div>

          <div className="bg-vellum/50 rounded-sm p-4 text-sm text-foreground leading-relaxed border border-outline/40">
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted mb-2 flex items-center gap-1">
              <MessageSquare className="h-3 w-3" /> Nội dung yêu cầu
            </p>
            <p>{request.message}</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <a
              href={`mailto:${request.email}`}
              className="text-sm text-primary hover:underline font-medium order-2 sm:order-1"
              onClick={(e) => e.stopPropagation()}
            >
              Gửi email phản hồi →
            </a>
            <div className="order-1 sm:order-2 self-end sm:self-auto">
              <StatusChanger request={request} />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

// ─── Filter Tabs ──────────────────────────────────────────────────────────────

type FilterTab = 'ALL' | ContactRequestStatus;

function FilterTabs({
  active,
  counts,
  onChange,
}: {
  active: FilterTab;
  counts: Record<FilterTab, number>;
  onChange: (t: FilterTab) => void;
}) {
  const tabs: { id: FilterTab; label: string }[] = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'NEW', label: 'Mới' },
    { id: 'READ', label: 'Đã đọc' },
    { id: 'REPLIED', label: 'Đã phản hồi' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={clsx(
            'inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-sm text-sm font-bold transition-all duration-150',
            active === t.id
              ? 'bg-primary text-white shadow-sm shadow-primary/20'
              : 'bg-white border border-outline text-muted hover:bg-hover-bg hover:text-foreground',
          )}
        >
          {t.label}
          {counts[t.id] > 0 && (
            <span className={clsx(
              'h-5 min-w-[20px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center',
              active === t.id ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary',
            )}>
              {counts[t.id]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CrmInboxClientPage() {
  const { data: requests, isLoading, error, refetch } = useSystemAdminContactRequestsQuery();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');

  const counts: Record<FilterTab, number> = {
    ALL: requests?.length ?? 0,
    NEW: requests?.filter((r) => r.status === 'NEW').length ?? 0,
    READ: requests?.filter((r) => r.status === 'READ').length ?? 0,
    REPLIED: requests?.filter((r) => r.status === 'REPLIED').length ?? 0,
  };

  const filtered = activeFilter === 'ALL'
    ? (requests ?? [])
    : (requests ?? []).filter((r) => r.status === activeFilter);

  // Sort: NEW first, then by date desc
  const sorted = [...filtered].sort((a, b) => {
    if (a.status === 'NEW' && b.status !== 'NEW') return -1;
    if (a.status !== 'NEW' && b.status === 'NEW') return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">CRM Inbox</h1>
          <p className="text-sm text-muted mt-1">Quản lý yêu cầu liên hệ từ trang chủ</p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[48px] rounded-sm border border-outline bg-white text-sm font-bold text-muted hover:bg-hover-bg transition-colors w-full sm:w-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Làm mới
        </button>
      </div>

      {/* Stats row */}
      {!isLoading && requests && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([
            { label: 'Tổng cộng', value: requests.length, color: 'text-foreground' },
            { label: 'Chưa đọc', value: counts.NEW, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Đã đọc', value: counts.READ, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Đã phản hồi', value: counts.REPLIED, color: 'text-green-600', bg: 'bg-green-50' },
          ] as const).map((stat) => (
            <div key={stat.label} className={clsx(
              'rounded-sm border border-outline p-4 text-center',
              'bg' in stat ? stat.bg : 'bg-white',
            )}>
              <p className={clsx('font-serif text-3xl font-bold', stat.color)}>{stat.value}</p>
              <p className="text-[11px] uppercase tracking-widest font-bold text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      {!isLoading && (
        <FilterTabs active={activeFilter} counts={counts} onChange={setActiveFilter} />
      )}

      {/* Content */}
      {isLoading ? (
        <CrmSkeleton />
      ) : error ? (
        <div className="text-center py-16 text-muted italic">Lỗi khi tải dữ liệu. Thử làm mới trang.</div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-24 space-y-3">
          <Mail className="h-12 w-12 text-muted/40 mx-auto" />
          <p className="text-muted font-medium">Không có yêu cầu nào{activeFilter !== 'ALL' ? ' trong mục này' : ''}.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((req) => (
            <RequestCard key={req.id} request={req} />
          ))}
        </div>
      )}
    </div>
  );
}
