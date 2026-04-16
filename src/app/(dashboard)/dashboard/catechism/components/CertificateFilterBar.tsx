'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, Download } from 'lucide-react';

interface CertificateFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  onExport: () => void;
}

export function CertificateFilterBar({
  search,
  onSearchChange,
  onExport,
}: CertificateFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(search);

  // Sync external search changes (e.g. cleared via URL)
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // 300ms debounce
  useEffect(() => {
    // Only trigger if localSearch is actually different from the URL state
    if (localSearch === search) return;

    const handler = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, search, onSearchChange]);

  return (
    <div className="flex flex-col md:flex-row md:justify-end gap-2 mb-4">
      <div className="relative w-full md:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Tìm tên, số hiệu..."
          className="w-full pl-9 pr-4 py-2 bg-surface text-on-surface text-sm border border-outline rounded-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all h-[40px] md:h-9"
        />
      </div>

      <CertificateDateFilter />

      <button
        type="button"
        className="flex items-center justify-center gap-2 px-4 bg-surface text-on-surface border border-outline rounded-sm hover:bg-surface-hover transition-colors h-[40px] md:h-9 outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={onExport}
      >
        <Download className="h-4 w-4" />
        <span className="hidden md:inline">Xuất CSV</span>
      </button>
    </div>
  );
}

// Inline date-range filter popover (extracted as separate concern)
function CertificateDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const [localFilters, setLocalFilters] = useState({
    date_from: searchParams.get('date_from') || '',
    date_to: searchParams.get('date_to') || '',
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalFilters({
      date_from: searchParams.get('date_from') || '',
      date_to: searchParams.get('date_to') || '',
    });
  }, [searchParams]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const hasActiveFilters = searchParams.has('date_from') || searchParams.has('date_to');
  const activeCount = hasActiveFilters ? 1 : 0;

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('date_from');
    params.delete('date_to');
    params.delete('page');
    if (localFilters.date_from) params.set('date_from', localFilters.date_from);
    if (localFilters.date_to) params.set('date_to', localFilters.date_to);
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
    setIsOpen(false);
  };

  const handleClear = () => {
    setLocalFilters({ date_from: '', date_to: '' });
    const params = new URLSearchParams(searchParams.toString());
    params.delete('date_from');
    params.delete('date_to');
    params.delete('page');
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`flex items-center justify-center gap-2 px-4 h-[40px] md:h-9 border rounded-sm transition-all focus-visible:ring-2 focus-visible:ring-primary outline-none ${
          hasActiveFilters
            ? 'border-primary text-primary bg-primary/5'
            : 'bg-surface text-on-surface border-outline hover:bg-surface-hover'
        }`}
      >
        <span className="material-symbols-outlined text-sm">filter_list</span>
        <span className="hidden md:inline">Lọc</span>
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full ml-1">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Lọc theo ngày cấp"
        className={`fixed top-0 right-0 bottom-0 z-50 w-full md:w-[400px] bg-surface border-l border-outline flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline shrink-0">
          <div>
            <h2 className="font-display font-bold text-xl text-on-surface">Lọc theo ngày cấp</h2>
            {activeCount > 0 && (
              <p className="text-xs font-body text-primary mt-0.5">{activeCount} bộ lọc đang áp dụng</p>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded hover:bg-surface-hover text-on-surface-variant hover:text-on-surface transition-colors focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          <div className="space-y-4">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.12em]">
              Khoảng thời gian cấp chứng chỉ
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <span className="block text-xs font-medium text-on-surface-variant mb-1">Từ ngày</span>
                <input
                  type="date"
                  value={localFilters.date_from}
                  onChange={(e) => setLocalFilters((p) => ({ ...p, date_from: e.target.value }))}
                  className="w-full bg-surface border border-outline rounded px-3 py-2 text-sm font-body text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              <span className="text-on-surface-variant text-sm shrink-0 mt-5">—</span>
              <div className="flex-1 relative">
                <span className="block text-xs font-medium text-on-surface-variant mb-1">Đến ngày</span>
                <input
                  type="date"
                  value={localFilters.date_to}
                  onChange={(e) => setLocalFilters((p) => ({ ...p, date_to: e.target.value }))}
                  className="w-full bg-surface border border-outline rounded px-3 py-2 text-sm font-body text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-outline px-6 py-4 bg-surface">
          <div className="flex items-center gap-3">
            <button
              onClick={handleClear}
              className="flex-1 h-12 border border-outline text-on-surface-variant text-sm font-medium rounded hover:bg-surface-hover hover:border-on-surface-variant transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-primary"
            >
              Xóa bộ lọc
            </button>
            <button
              onClick={handleApply}
              className="flex-1 h-12 bg-primary text-white text-sm font-bold rounded hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
