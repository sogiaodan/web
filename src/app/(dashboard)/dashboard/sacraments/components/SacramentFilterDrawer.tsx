'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function SacramentFilterDrawer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Local state mirrors URL params
  const [localFilters, setLocalFilters] = useState({
    date_from: searchParams.get('date_from') || '',
    date_to: searchParams.get('date_to') || '',
  });

  // Sync local state when URL changes
  const [prevSyncKey, setPrevSyncKey] = useState(() => 
    (searchParams.get('date_from') || '') + (searchParams.get('date_to') || '')
  );

  const currentSyncKey = (searchParams.get('date_from') || '') + (searchParams.get('date_to') || '');

  if (currentSyncKey !== prevSyncKey) {
    setPrevSyncKey(currentSyncKey);
    setLocalFilters({
      date_from: searchParams.get('date_from') || '',
      date_to: searchParams.get('date_to') || '',
    });
  }

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

  const hasActiveFilters = searchParams.has('date_from') || searchParams.has('date_to');

  let activeCount = 0;
  if (searchParams.get('date_from') || searchParams.get('date_to')) activeCount++;

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('date_from');
    params.delete('date_to');
    params.delete('page');

    if (localFilters.date_from) params.set('date_from', localFilters.date_from);
    if (localFilters.date_to) params.set('date_to', localFilters.date_to);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
    setIsOpen(false);
  };

  const handleClear = () => {
    setLocalFilters({ date_from: '', date_to: '' });
    const params = new URLSearchParams(searchParams.toString());
    params.delete('date_from');
    params.delete('date_to');
    params.delete('page');
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`flex items-center justify-center gap-2 px-4 h-[40px] md:h-9 border rounded-sm transition-all focus-visible:ring-2 focus-visible:ring-primary ${
          hasActiveFilters ? 'border-primary text-primary bg-primary/5' : 'bg-surface text-on-surface border-outline hover:bg-surface-hover'
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

      {/* Drawer layout matching system */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Bộ lọc nâng cao"
        className={`fixed top-0 right-0 bottom-0 z-50 w-full md:w-[400px] bg-surface border-l border-outline flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline shrink-0">
          <div>
            <h2 className="font-display font-bold text-xl text-on-surface">Bộ lọc nâng cao</h2>
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
              Khoảng thời gian lãnh nhận
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
