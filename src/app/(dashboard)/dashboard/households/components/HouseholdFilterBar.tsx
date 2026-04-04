'use client';

import { useTransition, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Zone } from '@/types/household';

export function HouseholdFilterBar({ zones: zonesRaw }: { zones: Zone[] }) {
  // Defensive check: ensure 'zones' is an array to prevent .map crashes
  const zones = Array.isArray(zonesRaw) ? zonesRaw : [];

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const currentZone = searchParams.get('zone_id') || '';
  const currentStatus = searchParams.get('status') || '';
  const currentSearch = searchParams.get('search') || '';

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // reset page to 1 when filtering
    params.delete('page');
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const handleSearch = (val: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleFilter('search', val);
    }, 300);
  };

  return (
    <>
      {/* ── MOBILE FILTERS: chip pills + search ── */}
      <div className="md:hidden mb-6 space-y-3">
        {/* Zone filter chips — horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => handleFilter('zone_id', '')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 min-h-[36px] ${
              currentZone === '' ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            Tất cả
          </button>
          {zones.map(z => (
            <button
              key={z.id}
              onClick={() => handleFilter('zone_id', currentZone === z.id ? '' : z.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 min-h-[36px] ${
                currentZone === z.id ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {z.name}
            </button>
          ))}
        </div>

        {/* Full-width search input */}
        <div className="bg-surface border border-outline rounded p-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-lg shrink-0">search</span>
          <input
            ref={searchInputRef}
            type="text"
            defaultValue={currentSearch}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Tên chủ hộ, địa chỉ hoặc mã hộ..."
            className="flex-1 bg-transparent border-none p-0 text-sm text-on-surface focus:ring-0 placeholder:text-on-surface-variant/40 min-h-[44px]"
          />
        </div>
      </div>

      {/* ── DESKTOP FILTERS: 4-column grid ── */}
      <div className="hidden md:grid grid-cols-4 gap-4 mb-8">
        {/* Zone Filter */}
        <div className="bg-surface border border-outline p-4 flex flex-col gap-2 relative overflow-hidden rounded shadow-sm">
          <div className="absolute top-0 right-0 w-8 h-8 bg-primary/5 rounded-bl-full" />
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Giáo khu</label>
          <select
            className="bg-transparent border-none p-0 text-on-surface font-body font-medium focus:ring-0 cursor-pointer disabled:opacity-50"
            value={currentZone}
            onChange={(e) => handleFilter('zone_id', e.target.value)}
            disabled={isPending}
          >
            <option value="">Tất cả giáo khu</option>
            {zones.map(z => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="bg-surface border border-outline p-4 flex flex-col gap-2 relative overflow-hidden rounded shadow-sm">
          <div className="absolute top-0 right-0 w-8 h-8 bg-primary/5 rounded-bl-full" />
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Trạng thái</label>
          <select
            className="bg-transparent border-none p-0 text-on-surface font-body font-medium focus:ring-0 cursor-pointer disabled:opacity-50"
            value={currentStatus}
            onChange={(e) => handleFilter('status', e.target.value)}
            disabled={isPending}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang cư trú</option>
            <option value="MOVED_OUT">Chuyển xứ</option>
            <option value="DISSOLVED">Giải thể (Vắng mặt)</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="col-span-2 bg-surface border border-outline p-4 flex flex-col gap-2 relative overflow-hidden rounded shadow-sm">
          <div className="absolute top-0 right-0 w-8 h-8 bg-primary/5 rounded-bl-full" />
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tìm kiếm nâng cao</label>
          <input
            ref={searchInputRef}
            type="text"
            defaultValue={currentSearch}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Tên chủ hộ, địa chỉ hoặc mã hộ..."
            className="bg-transparent border-none p-0 text-on-surface font-body focus:ring-0 placeholder:text-on-surface-variant/40"
          />
        </div>
      </div>
    </>
  );
}
