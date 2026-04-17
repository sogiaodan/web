'use client';

import React, { useRef, useTransition, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Zone } from '@/types/zone';
import { toast } from 'sonner';

interface Props {
  zones: Zone[];
  canEdit: boolean;
  total?: number;
  filterDrawerSlot?: React.ReactNode;
}

export function ParishionerFilterBar({ zones: zonesRaw, canEdit, total = 0, filterDrawerSlot }: Props) {
  const zones = Array.isArray(zonesRaw) ? zonesRaw : [];
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const currentSearch = searchParams.get('search') || '';

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearch = (val: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    // Clear search if empty
    if (val.length === 0) {
      handleFilter('search', '');
      return;
    }

    // Only search if 3 or more characters
    if (val.length >= 3) {
      debounceRef.current = setTimeout(() => {
        handleFilter('search', val);
      }, 300);
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');
      params.delete('limit');
      
      const response = await fetch(`/api/v1/parishioners/export?${params.toString()}`);
      
      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Gửi yêu cầu quá nhanh. Vui lòng thử lại sau 1 phút.');
        } else {
          toast.error('Xuất dữ liệu thất bại. Vui lòng thử lại.');
        }
        return;
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `giaodan_export_${new Date().getTime()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Đã xuất dữ liệu thành công.');
    } catch {
      toast.error('Lỗi hệ thống khi xuất dữ liệu.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="mb-6">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center gap-3 flex-wrap">
        {/* Search Input */}
        <div className="flex-1 min-w-[280px] max-w-xs bg-surface border border-outline rounded flex items-center gap-2 px-3 py-2.5 focus-within:border-primary transition-colors">
          <button
            type="button"
            onClick={() => handleFilter('search', searchInputRef.current?.value || '')}
            className="material-symbols-outlined text-on-surface-variant text-lg shrink-0 hover:text-primary transition-colors"
            title="Tìm kiếm ngay"
          >
            search
          </button>
          <input
            ref={searchInputRef}
            type="text"
            defaultValue={currentSearch}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Tìm kiếm giáo dân..."
            className="flex-1 bg-transparent border-none p-0 text-sm text-on-surface focus:ring-0 placeholder:text-on-surface-variant/50 min-h-[36px]"
          />
          {isPending && (
            <span className="material-symbols-outlined text-primary text-sm animate-spin">progress_activity</span>
          )}
        </div>

        {/* Filter Drawer Slot — renders AdvancedFilterDrawer button */}
        {filterDrawerSlot}

        <div className="flex-1" />

        {/* Export CSV */}
        {canEdit && (
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            disabled={isExporting || total === 0}
            className="h-12 px-4 flex items-center gap-2 border border-outline text-on-surface text-sm font-medium rounded hover:bg-surface-container transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-lg">download</span>
            )}
            <span>{isExporting ? 'Đang xuất...' : 'Xuất CSV'}</span>
          </button>
        )}

        {/* Add New Parishioner (Tạm ẩn: Yêu cầu mọi giáo dân phải nằm trong Hộ giáo) */}
        {/* 
        {canEdit && (
          <Link
            id="add-parishioner-btn"
            href="/dashboard/parishioners/create"
            className="h-12 px-6 bg-primary text-white text-sm font-bold rounded flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            <span>Thêm Giáo dân mới</span>
          </Link>
        )}
        */}
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col gap-3">
        <div className="bg-surface border border-outline rounded flex items-center gap-2 px-3 py-2.5 focus-within:border-primary transition-colors">
          <button
            type="button"
            onClick={() => handleFilter('search', mobileSearchInputRef.current?.value || '')}
            className="material-symbols-outlined text-on-surface-variant text-lg shrink-0 hover:text-primary transition-colors"
          >
            search
          </button>
          <input
            ref={mobileSearchInputRef}
            type="text"
            defaultValue={currentSearch}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Tìm kiếm giáo dân..."
            className="flex-1 bg-transparent border-none p-0 text-sm text-on-surface focus:ring-0 placeholder:text-on-surface-variant/50 min-h-[44px]"
          />
        </div>

        <div className="flex gap-2">
          {/* Mobile: render the same AdvancedFilterDrawer button via slot */}
          <div className="flex-1">{filterDrawerSlot}</div>
          {canEdit && (
            <button
              onClick={handleExportCSV}
              disabled={isExporting || total === 0}
              className="flex-1 h-12 flex items-center justify-center gap-2 border border-outline text-on-surface text-sm font-medium rounded hover:bg-surface-container transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-lg">download</span>
              )}
              <span>{isExporting ? 'Đang xuất...' : 'Xuất CSV'}</span>
            </button>
          )}
        </div>
        {/* Add New Parishioner Mobile (Tạm ẩn) */}
        {/*
        {canEdit && (
          <Link
            href="/dashboard/parishioners/create"
            className="h-12 bg-primary text-white text-sm font-bold rounded flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            <span>Thêm Giáo dân mới</span>
          </Link>
        )}
        */}
      </div>

      {/* ── Active Filter Chips (both desktop + mobile) ──────────────────── */}
      <ActiveFilterChips searchParams={searchParams} pathname={pathname} router={router} zones={zones} />
    </div>
  );
}

// ─── Active Filter Chips ──────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  RESIDING: 'Đang cư trú',
  ABSENT: 'Vắng mặt',
  MOVED: 'Chuyển xứ',
  DECEASED: 'Đã qua đời',
};

const GENDER_LABELS: Record<string, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
};

const MARITAL_LABELS: Record<string, string> = {
  SINGLE: 'Độc thân',
  MARRIED: 'Đã kết hôn',
};

function ActiveFilterChips({
  searchParams,
  pathname,
  router,
  zones,
}: {
  searchParams: ReturnType<typeof useSearchParams>;
  pathname: string;
  router: ReturnType<typeof useRouter>;
  zones: Zone[];
}) {
  const [, startTransition] = useTransition();

  const chips: { key: string; label: string; originalKey?: string; value?: string }[] = [];

  const christianName = searchParams.get('christian_name');
  if (christianName) chips.push({ key: 'christian_name', label: `Tên Thánh: ${christianName}` });

  const statuses = searchParams.getAll('status');
  statuses.forEach(s => {
    chips.push({ key: `status:${s}`, label: STATUS_LABELS[s] ?? s, originalKey: 'status', value: s });
  });

  const gender = searchParams.get('gender');
  if (gender) chips.push({ key: 'gender', label: GENDER_LABELS[gender] ?? gender });

  const marital = searchParams.get('marital_status');
  if (marital) chips.push({ key: 'marital_status', label: MARITAL_LABELS[marital] ?? marital });

  const ageMin = searchParams.get('age_min');
  const ageMax = searchParams.get('age_max');
  if (ageMin || ageMax) {
    chips.push({
      key: '__age',
      label: `Tuổi: ${ageMin || '0'} – ${ageMax || '∞'}`,
    });
  }

  const zoneId = searchParams.get('zone_id');
  if (zoneId) {
    const zoneObj = zones.find((z) => z.id === zoneId);
    chips.push({ 
      key: 'zone_id', 
      label: `Giáo khu: ${zoneObj ? zoneObj.name : zoneId.slice(0, 8) + '…'}` 
    });
  }

  if (chips.length === 0) return null;

  const removeChip = (chip: { key: string; label: string; originalKey?: string; value?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (chip.key === '__age') {
      params.delete('age_min');
      params.delete('age_max');
    } else if (chip.originalKey && chip.value) {
      // For multi-value params like 'status'
      const allValues = params.getAll(chip.originalKey).filter(v => v !== chip.value);
      params.delete(chip.originalKey);
      allValues.forEach(v => params.append(chip.originalKey!, v));
    } else {
      params.delete(chip.key);
    }
    params.delete('page');
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    ['christian_name', 'status', 'gender', 'marital_status', 'age_min', 'age_max', 'zone_id', 'page'].forEach(
      (k) => params.delete(k)
    );
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[#E7E5E4]/60">
      <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider font-body shrink-0">
        Đang lọc:
      </span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 h-8 px-3 bg-primary/5 border border-primary/20 rounded text-xs font-body font-medium text-primary"
        >
          {chip.label}
          <button
            onClick={() => removeChip(chip)}
            className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary/20 transition-colors"
            aria-label={`Xóa lọc ${chip.label}`}
          >
            <span className="material-symbols-outlined text-[12px]">close</span>
          </button>
        </span>
      ))}
      <button
        onClick={clearAll}
        className="h-8 px-3 text-xs font-body font-medium text-[#78716C] hover:text-primary transition-colors"
      >
        Xóa tất cả
      </button>
    </div>
  );
}
