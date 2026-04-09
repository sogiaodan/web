'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';

interface Priest {
  id: string;
  christian_name: string | null;
  full_name: string;
}

interface PriestDropdownProps {
  value: string | null;
  onChange: (id: string | null, priest?: Priest) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}



export function PriestDropdown({
  value,
  onChange,
  label = 'Linh mục cử hành',
  placeholder = 'Chọn linh mục...',
  error,
  disabled = false,
}: PriestDropdownProps) {
  // Client-side cache with staleTime handled by React Query (set to 5 minutes to prevent unnecessary refetching of the priest list)
  const { data: priests, isLoading } = useQuery({
    queryKey: ['priests_dropdown'],
    queryFn: () => apiFetch<Priest[]>('/api/v1/priests?is_active=true'),
    staleTime: 300000,
  });

  return (
    <div className="w-full">
      {label && (
        <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value || ''}
          onChange={(e) => {
            const val = e.target.value;
            if (!val) {
              onChange(null);
              return;
            }
            const priest = priests?.find((p) => p.id === val);
            onChange(val, priest);
          }}
          disabled={disabled || isLoading}
          className={`w-full appearance-none bg-surface border rounded-sm px-4 py-3 text-sm font-body focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all pr-10 ${
            error ? 'border-red-500 ring-1 ring-red-500 text-on-surface' : 
            !value ? 'border-outline text-on-surface-variant' : 'border-outline text-on-surface'
          } ${disabled || isLoading ? 'opacity-70 cursor-not-allowed bg-surface-container' : ''}`}
        >
          <option value="" disabled hidden>{isLoading ? 'Đang tải...' : placeholder}</option>
          {priests?.map((p) => (
            <option key={p.id} value={p.id} className="text-on-surface">
              Lm. {p.christian_name ? p.christian_name + ' ' : ''}{p.full_name}
            </option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-lg pointer-events-none">
          expand_more
        </span>
      </div>
      {error && <p className="mt-1 flex items-center gap-1 text-xs text-red-500 font-medium"> <span className="material-symbols-outlined text-sm">error</span> {error}</p>}
    </div>
  );
}
