'use client';

import { useTransition, useRef, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Zone } from '@/types/household';
import { toast } from 'sonner';

export function HouseholdFilterBar({ zones: zonesRaw, total = 0 }: { zones: Zone[], total?: number }) {
  // Defensive check: ensure 'zones' is an array to prevent .map crashes
  const zones = Array.isArray(zonesRaw) ? zonesRaw : [];

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  
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
      }, 500);
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');
      params.delete('limit');
      
      const response = await fetch(`/api/v1/households/export?${params.toString()}`);
      
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
      a.download = `hogiao_export_${new Date().getTime()}.csv`;
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
        <div className="flex gap-2">
          <div className="flex-1 bg-surface border border-outline rounded p-3 flex items-center gap-2">
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
              placeholder="Tên chủ hộ hoặc mã hộ..."
              className="flex-1 bg-transparent border-none p-0 text-sm text-on-surface focus:ring-0 placeholder:text-on-surface-variant/40 min-h-[44px]"
            />
          </div>
          <button
            onClick={handleExportCSV}
            disabled={isExporting || total === 0}
            className="w-12 flex items-center justify-center border border-outline rounded text-on-surface hover:bg-surface-container disabled:opacity-50"
          >
            {isExporting ? (
              <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-lg">download</span>
            )}
          </button>
        </div>
      </div>

      {/* ── DESKTOP FILTERS: 4-column grid ── */}
      <div className="hidden md:flex items-center gap-4 mb-8">
        <div className="flex-1 grid grid-cols-4 gap-4">
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tìm kiếm nâng cao</label>
              <button
                type="button"
                onClick={() => handleFilter('search', searchInputRef.current?.value || '')}
                className="material-symbols-outlined text-on-surface-variant text-lg hover:text-primary transition-all active:scale-90"
                title="Tìm ngay"
              >
                search
              </button>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              defaultValue={currentSearch}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Tên chủ hộ hoặc mã hộ..."
              className="bg-transparent border-none p-0 text-on-surface font-body focus:ring-0 placeholder:text-on-surface-variant/40"
            />
          </div>
        </div>

        {/* Export Button Desktop */}
        <button
          onClick={handleExportCSV}
          disabled={isExporting || total === 0}
          className="h-[76px] px-6 flex flex-col items-center justify-center gap-1 border border-outline text-on-surface text-xs font-bold rounded shadow-sm hover:bg-surface-container transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest min-w-[100px]"
        >
          {isExporting ? (
            <span className="material-symbols-outlined text-xl animate-spin text-primary">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-xl text-primary">download</span>
          )}
          <span>{isExporting ? 'Đang xuất' : 'Xuất CSV'}</span>
        </button>
      </div>
    </>
  );
}
