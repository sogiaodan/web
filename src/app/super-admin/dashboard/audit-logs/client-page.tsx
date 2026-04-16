'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  ScrollText,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Globe,
} from 'lucide-react';
import clsx from 'clsx';
import {
  useSystemAdminAuditLogsQuery,
  useChurchesQuery,
} from '@/lib/queries/useSystemAdminQueries';
import { AuditLogQuery } from '@/types/system-admin';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-50 text-green-700',
  UPDATE: 'bg-amber-50 text-amber-700',
  DELETE: 'bg-red-50 text-red-700',
  LOGIN:  'bg-blue-50 text-blue-700',
  LOGOUT: 'bg-stone-100 text-stone-500',
  EXPORT: 'bg-violet-50 text-violet-700',
};

const ACTION_ICONS: Record<string, React.ElementType> = {
  CREATE: Plus,
  UPDATE: Pencil,
  DELETE: Trash2,
};

function ActionBadge({ action }: { action: string }) {
  const colorClass = ACTION_COLORS[action] ?? 'bg-stone-100 text-stone-500';
  const Icon = ACTION_ICONS[action];
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider',
      colorClass,
    )}>
      {Icon && <Icon className="h-2.5 w-2.5" />}
      {action}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function AuditSkeleton() {
  return (
    <div className="animate-pulse space-y-0">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-4 px-6 py-4 border-b border-outline/40">
          <div className="h-4 w-20 bg-outline/30 rounded shrink-0" />
          <div className="h-4 w-16 bg-outline/30 rounded shrink-0" />
          <div className="flex-1 h-4 bg-outline/20 rounded" />
          <div className="h-4 w-24 bg-outline/20 rounded shrink-0" />
          <div className="h-4 w-28 bg-outline/20 rounded shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

const ACTION_TYPE_OPTIONS = ['', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT'];

interface FilterBarProps {
  filters: AuditLogQuery;
  churches: { id: string; name: string }[];
  onChange: (f: Partial<AuditLogQuery>) => void;
  onReset: () => void;
}

function FilterBar({ filters, churches, onChange, onReset }: FilterBarProps) {
  const hasFilters = !!(filters.action_type || filters.church_id || filters.date_from || filters.date_to);

  return (
    <div className="bg-white border border-outline rounded-sm p-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Loại hành động</label>
          <select
            value={filters.action_type ?? ''}
            onChange={(e) => onChange({ action_type: e.target.value || undefined, page: 1 })}
            className="h-10 px-3 pr-7 text-sm border border-outline rounded-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none min-w-[140px]"
          >
            {ACTION_TYPE_OPTIONS.map((a) => (
              <option key={a} value={a}>{a || 'Tất cả'}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Giáo xứ</label>
          <select
            value={filters.church_id ?? ''}
            onChange={(e) => onChange({ church_id: e.target.value || undefined, page: 1 })}
            className="h-10 px-3 pr-7 text-sm border border-outline rounded-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none min-w-[180px]"
          >
            <option value="">Tất cả giáo xứ</option>
            {churches.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Từ ngày</label>
          <input
            type="date"
            value={filters.date_from ?? ''}
            onChange={(e) => onChange({ date_from: e.target.value || undefined, page: 1 })}
            className="h-10 px-3 text-sm border border-outline rounded-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Đến ngày</label>
          <input
            type="date"
            value={filters.date_to ?? ''}
            onChange={(e) => onChange({ date_to: e.target.value || undefined, page: 1 })}
            className="h-10 px-3 text-sm border border-outline rounded-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>

        {hasFilters && (
          <button
            onClick={onReset}
            className="h-10 px-4 text-sm font-bold text-muted hover:text-primary border border-transparent hover:border-outline rounded-sm transition-colors min-h-[40px]"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: AuditLogQuery = { page: 1, limit: 20 };

export default function AuditLogsClientPage() {
  const [filters, setFilters] = useState<AuditLogQuery>(DEFAULT_FILTERS);

  const handleFilterChange = useCallback((updates: Partial<AuditLogQuery>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleReset = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const { data, isLoading, error } = useSystemAdminAuditLogsQuery(filters);
  const { data: churches } = useChurchesQuery();

  const pagination = data?.pagination;
  const totalPages = pagination?.total_pages ?? 1;

  const churchOptions = useMemo(
    () => (churches ?? []).map((c) => ({ id: c.id, name: c.name })),
    [churches],
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">Nhật Ký Hệ Thống</h1>
        <p className="text-sm text-muted mt-1">Theo dõi tất cả hành động trên toàn nền tảng</p>
      </div>

      {/* Filter bar */}
      <FilterBar
        filters={filters}
        churches={churchOptions}
        onChange={handleFilterChange}
        onReset={handleReset}
      />

      {/* Table */}
      <section className="bg-white border border-outline rounded-sm shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-[90px_100px_1fr_140px_170px] gap-4 px-6 py-3 bg-vellum/60 border-b border-outline">
          {['Hành động', 'Đối tượng', 'Mô tả', 'Người dùng', 'Giáo xứ / Thời gian'].map((h) => (
            <p key={h} className="text-[10px] font-bold uppercase tracking-widest text-muted">{h}</p>
          ))}
        </div>

        {isLoading ? (
          <AuditSkeleton />
        ) : error ? (
          <div className="py-16 text-center text-muted italic">Lỗi khi tải nhật ký. Thử làm mới.</div>
        ) : !data?.items?.length ? (
          <div className="py-16 text-center space-y-3">
            <ScrollText className="h-10 w-10 text-muted/40 mx-auto" />
            <p className="text-muted italic">Không có nhật ký phù hợp.</p>
          </div>
        ) : (
          <div className="divide-y divide-outline/40">
            {data.items.map((entry) => (
              <div key={entry.id} className="group hover:bg-vellum/20 transition-colors">
                {/* Desktop row */}
                <div className="hidden md:grid grid-cols-[90px_100px_1fr_140px_170px] gap-4 px-6 py-4 items-start">
                  <div><ActionBadge action={entry.action_type} /></div>
                  <p className="text-xs font-medium text-muted pt-0.5">{entry.entity_type}</p>
                  <p className="text-sm text-foreground leading-snug">{entry.description}</p>
                  <p className="text-xs text-muted">{entry.user_name}</p>
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-foreground flex items-center gap-1">
                      <Globe className="h-3 w-3 text-muted shrink-0" />
                      {entry.church_name}
                    </p>
                    <p className="text-[11px] text-muted">{formatDateTime(entry.created_at)}</p>
                  </div>
                </div>

                {/* Mobile card */}
                <div className="md:hidden p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <ActionBadge action={entry.action_type} />
                    <span className="text-[11px] text-muted">{formatDateTime(entry.created_at)}</span>
                  </div>
                  <p className="text-sm text-foreground">{entry.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span>{entry.user_name}</span>
                    <span className="h-1 w-1 rounded-full bg-muted/40" />
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />{entry.church_name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-outline bg-vellum/30">
            <p className="text-xs text-muted">
              Hiển thị{' '}
              <strong>{((pagination.page - 1) * pagination.limit) + 1}</strong>
              {' '}–{' '}
              <strong>{Math.min(pagination.page * pagination.limit, pagination.total)}</strong>
              {' '}trong{' '}
              <strong>{pagination.total}</strong> nhật ký
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFilterChange({ page: (filters.page ?? 1) - 1 })}
                disabled={(filters.page ?? 1) <= 1}
                className="p-2 min-h-[40px] min-w-[40px] rounded-sm border border-outline bg-white hover:bg-hover-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium text-foreground px-2">
                Trang {pagination.page} / {totalPages}
              </span>
              <button
                onClick={() => handleFilterChange({ page: (filters.page ?? 1) + 1 })}
                disabled={(filters.page ?? 1) >= totalPages}
                className="p-2 min-h-[40px] min-w-[40px] rounded-sm border border-outline bg-white hover:bg-hover-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 items-center">
        <p className="text-[11px] uppercase tracking-widest font-bold text-muted">Chú giải:</p>
        {Object.entries(ACTION_COLORS).map(([action, cls]) => (
          <span key={action} className={clsx('px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider', cls)}>
            {action}
          </span>
        ))}
      </div>
    </div>
  );
}
