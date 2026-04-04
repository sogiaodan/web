'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Zone } from '@/types/zone';

const CHRISTIAN_NAMES = [
  'Anna', 'Anê', 'Antôn', 'Augustinô', 'Barthôlômêô',
  'Catarina', 'Cecilia', 'Clara', 'Đaminh', 'Elisabeth',
  'Phanxicô', 'Phanxicô Xaviê', 'Giêrônimô',
  'Gioan', 'Gioan Baotixita', 'Gioan Bosco',
  'Giuse', 'Giuse Maria', 'G.B',
  'Lucia', 'Luca', 'Máccô', 'Marcô',
  'Maria', 'Maria Goretti', 'Maria Magdalena',
  'Micae', 'Nicolas', 'Phaolô', 'Phêrô',
  'Raphael', 'Rôsa', 'Simon',
  'Stêphanô', 'Têrêsa', 'Tôma', 'Vinh sơn',
];

const STATUS_OPTIONS = [
  { value: 'RESIDING', label: 'Đang cư trú' },
  { value: 'ABSENT', label: 'Vắng mặt' },
  { value: 'TRANSFERRED', label: 'Chuyển xứ' },
  { value: 'DECEASED', label: 'Đã qua đời' },
];

interface Props {
  zones: Zone[];
}

export function AdvancedFilterDrawer({ zones }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Local state mirrors URL params
  const [localFilters, setLocalFilters] = useState({
    christian_name: searchParams.get('christian_name') || '',
    age_min: searchParams.get('age_min') || '',
    age_max: searchParams.get('age_max') || '',
    gender: searchParams.get('gender') || '',
    status: searchParams.getAll('status').length > 0
      ? searchParams.getAll('status')
      : searchParams.get('status')
        ? [searchParams.get('status')!]
        : [],
    marital_status: searchParams.get('marital_status') || '',
    zone_id: searchParams.get('zone_id') || '',
  });

  // Sync local state when URL changes
  useEffect(() => {
    setLocalFilters({
      christian_name: searchParams.get('christian_name') || '',
      age_min: searchParams.get('age_min') || '',
      age_max: searchParams.get('age_max') || '',
      gender: searchParams.get('gender') || '',
      status: searchParams.get('status') ? [searchParams.get('status')!] : [],
      marital_status: searchParams.get('marital_status') || '',
      zone_id: searchParams.get('zone_id') || '',
    });
  }, [searchParams]);

  // Trap focus escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const hasActiveFilters =
    searchParams.has('christian_name') ||
    searchParams.has('age_min') ||
    searchParams.has('age_max') ||
    searchParams.has('gender') ||
    searchParams.has('status') ||
    searchParams.has('marital_status') ||
    searchParams.has('zone_id');

  const activeCount = [
    searchParams.get('christian_name'),
    searchParams.get('age_min') || searchParams.get('age_max'),
    searchParams.get('gender'),
    searchParams.get('status'),
    searchParams.get('marital_status'),
    searchParams.get('zone_id'),
  ].filter(Boolean).length;

  const setStatus = (value: string) => {
    setLocalFilters((p) => {
      const has = p.status.includes(value);
      return {
        ...p,
        status: has ? p.status.filter((s) => s !== value) : [...p.status, value],
      };
    });
  };

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    const FILTER_KEYS = ['christian_name', 'age_min', 'age_max', 'gender', 'status', 'marital_status', 'zone_id', 'page'];
    FILTER_KEYS.forEach((k) => params.delete(k));

    if (localFilters.christian_name) params.set('christian_name', localFilters.christian_name);
    if (localFilters.age_min) params.set('age_min', localFilters.age_min);
    if (localFilters.age_max) params.set('age_max', localFilters.age_max);
    if (localFilters.gender) params.set('gender', localFilters.gender);
    // Use first selected status (API supports one status currently)
    if (localFilters.status.length > 0) params.set('status', localFilters.status[0]);
    if (localFilters.marital_status) params.set('marital_status', localFilters.marital_status);
    if (localFilters.zone_id) params.set('zone_id', localFilters.zone_id);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
    setIsOpen(false);
  };

  const handleClear = () => {
    setLocalFilters({
      christian_name: '', age_min: '', age_max: '',
      gender: '', status: [], marital_status: '', zone_id: '',
    });
    const params = new URLSearchParams(searchParams.toString());
    ['christian_name', 'age_min', 'age_max', 'gender', 'status', 'marital_status', 'zone_id', 'page'].forEach((k) => params.delete(k));
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        id="filter-drawer-btn"
        onClick={() => setIsOpen(true)}
        className={`h-12 px-4 flex items-center gap-2 border text-sm font-medium rounded transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${
          hasActiveFilters
            ? 'border-primary text-primary bg-primary/5'
            : 'border-[#E7E5E4] text-[#78716C] hover:bg-[#F5F5F4] hover:border-[#D6D3D1]'
        }`}
      >
        <span className="material-symbols-outlined text-lg">tune</span>
        <span>Bộ lọc</span>
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full">
            {activeCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#1C1917]/40 backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Bộ lọc nâng cao"
        className={`fixed top-0 right-0 bottom-0 z-50 w-full md:w-[400px] bg-surface border-l border-[#E7E5E4] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E7E5E4] shrink-0">
          <div>
            <h2 className="font-display font-bold text-xl text-[#1C1917]">Bộ lọc nâng cao</h2>
            {activeCount > 0 && (
              <p className="text-xs font-body text-primary mt-0.5">{activeCount} bộ lọc đang áp dụng</p>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded hover:bg-[#F5F5F4] text-[#78716C] hover:text-[#1C1917] transition-colors"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

          {/* ── Tên Thánh ── */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-[#78716C] uppercase tracking-[0.12em]">
              Tên Thánh
            </label>
            <div className="relative">
              <select
                value={localFilters.christian_name}
                onChange={(e) => setLocalFilters((p) => ({ ...p, christian_name: e.target.value }))}
                className="w-full appearance-none bg-surface border border-[#E7E5E4] rounded px-4 py-3 text-sm font-body text-[#1C1917] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all pr-10"
              >
                <option value="">Tất cả Tên Thánh</option>
                {CHRISTIAN_NAMES.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#78716C] text-lg pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* ── Độ tuổi ── */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-[#78716C] uppercase tracking-[0.12em]">
              Độ tuổi
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={localFilters.age_min}
                  onChange={(e) => setLocalFilters((p) => ({ ...p, age_min: e.target.value }))}
                  placeholder="Từ"
                  min={0}
                  max={150}
                  className="w-full bg-surface border border-[#E7E5E4] rounded px-4 py-3 text-sm font-body text-[#1C1917] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              <span className="text-[#78716C] text-sm shrink-0">—</span>
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={localFilters.age_max}
                  onChange={(e) => setLocalFilters((p) => ({ ...p, age_max: e.target.value }))}
                  placeholder="Đến"
                  min={0}
                  max={150}
                  className="w-full bg-surface border border-[#E7E5E4] rounded px-4 py-3 text-sm font-body text-[#1C1917] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* ── Giới tính ── */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-[#78716C] uppercase tracking-[0.12em]">
              Giới tính
            </label>
            <div className="flex gap-3">
              {[
                { value: '', label: 'Tất cả', icon: 'people' },
                { value: 'MALE', label: 'Nam', icon: 'male' },
                { value: 'FEMALE', label: 'Nữ', icon: 'female' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 border rounded cursor-pointer transition-all text-sm font-body font-medium ${
                    localFilters.gender === opt.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-[#E7E5E4] text-[#78716C] hover:border-primary/40 hover:bg-[#F5F5F4]'
                  }`}
                >
                  <input
                    type="radio"
                    name="filter-gender"
                    value={opt.value}
                    checked={localFilters.gender === opt.value}
                    onChange={() => setLocalFilters((p) => ({ ...p, gender: opt.value }))}
                    className="sr-only"
                  />
                  <span className="material-symbols-outlined text-sm">{opt.icon}</span>
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* ── Tình trạng ── */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-[#78716C] uppercase tracking-[0.12em]">
              Tình trạng sinh hoạt
            </label>
            <div className="space-y-2">
              {STATUS_OPTIONS.map((opt) => {
                const checked = localFilters.status.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 px-4 py-3 border rounded cursor-pointer transition-all ${
                      checked
                        ? 'border-primary bg-primary/5'
                        : 'border-[#E7E5E4] hover:border-primary/30 hover:bg-[#F5F5F4]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                        checked ? 'bg-primary border-primary' : 'border-[#D6D3D1]'
                      }`}
                      onClick={() => setStatus(opt.value)}
                    >
                      {checked && (
                        <span className="material-symbols-outlined text-white text-xs">check</span>
                      )}
                    </div>
                    <span
                      className={`text-sm font-body font-medium ${checked ? 'text-primary' : 'text-[#1C1917]'}`}
                      onClick={() => setStatus(opt.value)}
                    >
                      {opt.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* ── Hôn nhân ── */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-[#78716C] uppercase tracking-[0.12em]">
              Tình trạng hôn nhân
            </label>
            <div className="relative">
              <select
                value={localFilters.marital_status}
                onChange={(e) => setLocalFilters((p) => ({ ...p, marital_status: e.target.value }))}
                className="w-full appearance-none bg-surface border border-[#E7E5E4] rounded px-4 py-3 text-sm font-body text-[#1C1917] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all pr-10"
              >
                <option value="">Tất cả</option>
                <option value="SINGLE">Độc thân</option>
                <option value="MARRIED">Đã kết hôn</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#78716C] text-lg pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* ── Giáo khu ── */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-[#78716C] uppercase tracking-[0.12em]">
              Giáo khu
            </label>
            <div className="relative">
              <select
                value={localFilters.zone_id}
                onChange={(e) => setLocalFilters((p) => ({ ...p, zone_id: e.target.value }))}
                className="w-full appearance-none bg-surface border border-[#E7E5E4] rounded px-4 py-3 text-sm font-body text-[#1C1917] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all pr-10"
              >
                <option value="">Tất cả giáo khu</option>
                {Array.isArray(zones) && zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#78716C] text-lg pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="shrink-0 border-t border-[#E7E5E4] px-6 py-4 bg-surface">
          <div className="flex items-center gap-3">
            <button
              onClick={handleClear}
              className="flex-1 h-12 border border-[#E7E5E4] text-[#78716C] text-sm font-medium rounded hover:bg-[#F5F5F4] hover:border-[#D6D3D1] transition-all active:scale-95"
            >
              Xóa bộ lọc
            </button>
            <button
              id="apply-filters-btn"
              onClick={handleApply}
              className="flex-1 h-12 bg-primary text-white text-sm font-bold rounded hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">check</span>
              Áp dụng
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
