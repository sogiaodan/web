'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Loader2 } from 'lucide-react';
import { SacramentFilterDrawer } from './SacramentFilterDrawer';

interface SacramentFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  onExport: () => void;
  isExporting?: boolean;
  total?: number;
}

export function SacramentFilterBar({
  search,
  onSearchChange,
  onExport,
  isExporting = false,
  total = 0,
}: SacramentFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(search);

  // Debounce search
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
      <div className="relative w-full md:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Tìm tên, số hiệu..."
          className="w-full pl-9 pr-4 py-2 bg-surface text-on-surface text-sm border border-outline rounded-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all h-[40px] md:h-9"
        />
      </div>
      
      <SacramentFilterDrawer />

      <button
        className="flex items-center justify-center gap-2 px-4 bg-surface text-on-surface border border-outline rounded-sm hover:bg-surface-hover transition-colors h-[40px] md:h-9 outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onExport}
        disabled={isExporting || total === 0}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span className="hidden md:inline">{isExporting ? 'Đang xuất...' : 'Xuất CSV'}</span>
      </button>
    </div>
  );
}
