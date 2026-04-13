"use client";

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { ParishGroupCategory } from '@/types/parish-group';

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  categoryId: string;
  onCategoryChange: (value: string) => void;
  categories: ParishGroupCategory[];
  canEdit: boolean;
}

export function ParishGroupFilterBar({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  categories,
}: Props) {
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, onSearchChange]);

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-outline rounded-xl bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[48px]"
          placeholder="Tìm tên hội đoàn..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
      </div>

      <div className="w-full md:w-64 flex-shrink-0">
        <select
          className="block w-full pl-3 pr-10 py-3 border border-outline rounded-xl bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none transition-all min-h-[48px]"
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em'
          }}
        >
          <option value="">Tất cả phân loại</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} {cat.group_count !== undefined ? `(${cat.group_count})` : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
