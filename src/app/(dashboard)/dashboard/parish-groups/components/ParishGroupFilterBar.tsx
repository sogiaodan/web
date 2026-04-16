"use client";

import { useState, useEffect, useRef } from 'react';
import { PRESET_ICONS } from './IconGalleryPicker';

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  canEdit: boolean;
}

export function ParishGroupFilterBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
}: Props) {
  const [localSearch, setLocalSearch] = useState(search);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    // Immediate search if empty or very short
    if (!localSearch) {
      onSearchChange('');
      return;
    }

    debounceRef.current = setTimeout(() => {
      onSearchChange(localSearch);
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [localSearch, onSearchChange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 w-full">
      {/* Search Input Card */}
      <div className="md:col-span-2 bg-surface border border-outline p-4 flex flex-col gap-2 relative overflow-hidden rounded shadow-sm">
        <div className="absolute top-0 right-0 w-8 h-8 bg-primary/5 rounded-bl-full" />
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tìm kiếm nâng cao</label>
          <span className="material-symbols-outlined text-on-surface-variant text-lg">search</span>
        </div>
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Tìm tên hội đoàn..."
          className="bg-transparent border-none p-0 text-on-surface font-body font-medium focus:ring-0 placeholder:text-on-surface-variant/40 min-h-[24px]"
        />
      </div>

      {/* Category Filter Card */}
      <div className="bg-surface border border-outline p-4 flex flex-col gap-2 relative overflow-hidden rounded shadow-sm">
        <div className="absolute top-0 right-0 w-8 h-8 bg-primary/5 rounded-bl-full" />
        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Phân loại</label>
        <select
          className="bg-transparent border-none p-0 text-on-surface font-body font-medium focus:ring-0 cursor-pointer disabled:opacity-50"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">Tất cả phân loại</option>
          {PRESET_ICONS.map((icon) => (
            <option key={icon.path} value={icon.label}>
              {icon.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
