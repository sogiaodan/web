'use client';

import React, { useRef, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ZoneAdvancedFilterDrawer } from './ZoneAdvancedFilterDrawer';

export function ZoneParishionerFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const searchInputRef = useRef<HTMLInputElement>(null);
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
    
    if (val.length === 0) {
      handleFilter('search', '');
      return;
    }

    if (val.length >= 3) {
      debounceRef.current = setTimeout(() => {
        handleFilter('search', val);
      }, 300);
    }
  };

  return (
    <div className="mt-6 mb-2">
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="flex-1 max-w-sm bg-surface border border-outline rounded flex items-center gap-2 px-3 py-2.5 focus-within:border-primary transition-colors h-10">
          <span className="material-symbols-outlined text-on-surface-variant text-lg">search</span>
          <input
            ref={searchInputRef}
            type="text"
            defaultValue={currentSearch}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Tìm kiếm giáo dân..."
            className="flex-1 bg-transparent border-none p-0 text-sm text-on-surface focus:ring-0 placeholder:text-on-surface-variant/50"
          />
          {isPending && (
            <span className="material-symbols-outlined text-primary text-sm animate-spin">progress_activity</span>
          )}
        </div>

        {/* Filter Drawer */}
        <ZoneAdvancedFilterDrawer />
      </div>

      {/* Active Filter Chips */}
      <ActiveFilterChips searchParams={searchParams} pathname={pathname} router={router} />
    </div>
  );
}

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
}: {
  searchParams: ReturnType<typeof useSearchParams>;
  pathname: string;
  router: ReturnType<typeof useRouter>;
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

  if (chips.length === 0) return null;

  const removeChip = (chip: { key: string; label: string; originalKey?: string; value?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (chip.key === '__age') {
      params.delete('age_min');
      params.delete('age_max');
    } else if (chip.originalKey && chip.value) {
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
    ['christian_name', 'status', 'gender', 'marital_status', 'age_min', 'age_max', 'page', 'search'].forEach(
      (k) => params.delete(k)
    );
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3 p-2 bg-surface-container/30 rounded border border-outline/30">
      <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider shrink-0 ml-1">
        Đang lọc:
      </span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 h-7 px-2.5 bg-primary/5 border border-primary/20 rounded text-[11px] font-medium text-primary transition-all animate-in fade-in zoom-in duration-200"
        >
          {chip.label}
          <button
            onClick={() => removeChip(chip)}
            className="flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-primary/20 transition-colors"
            aria-label={`Xóa lọc ${chip.label}`}
          >
            <span className="material-symbols-outlined text-[10px]">close</span>
          </button>
        </span>
      ))}
      <button
        onClick={clearAll}
        className="h-7 px-2 text-[11px] font-medium text-[#78716C] hover:text-primary transition-colors"
      >
        Xóa tất cả
      </button>
    </div>
  );
}
