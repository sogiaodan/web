'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';

interface Priest {
  id: string;
  christian_name: string | null;
  full_name: string;
  is_active: boolean;
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
  const [showAll, setShowAll] = useState(false);

  // Fetch all priests and categorize them client-side
  const { data: priests, isLoading } = useQuery({
    queryKey: ['priests_dropdown'],
    queryFn: () => apiFetch<Priest[]>('/api/v1/priests'),
    staleTime: 300000,
  });

  const activePriests = priests?.filter((p) => p.is_active);
  const inactivePriests = priests?.filter((p) => !p.is_active);

  // Default active list, always including the currently selected priest (even if inactive) to avoid empty select box
  const visibleActivePriests = priests?.filter((p) => p.is_active || p.id === value);

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
            if (val === 'SHOW_ALL') {
              setShowAll(true);
              return;
            }
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
          
          {!showAll ? (
            <>
              {visibleActivePriests?.map((p) => (
                <option key={p.id} value={p.id} className="text-on-surface">
                  Lm. {p.christian_name ? p.christian_name + ' ' : ''}{p.full_name}
                  {!p.is_active ? ' (Không còn đương nhiệm)' : ''}
                </option>
              ))}
              {inactivePriests && inactivePriests.length > 0 && (
                <option value="SHOW_ALL" className="text-primary font-semibold">
                  -- Linh mục cựu / ngoài giáo xứ... --
                </option>
              )}
            </>
          ) : (
            <>
              {activePriests && activePriests.length > 0 && (
                <optgroup label="Linh mục đương nhiệm" className="text-xs font-bold text-on-surface-variant">
                  {activePriests.map((p) => (
                    <option key={p.id} value={p.id} className="text-sm text-on-surface font-normal">
                      Lm. {p.christian_name ? p.christian_name + ' ' : ''}{p.full_name}
                    </option>
                  ))}
                </optgroup>
              )}
              {inactivePriests && inactivePriests.length > 0 && (
                <optgroup label="Linh mục cựu / Ngoài giáo xứ" className="text-xs font-bold text-on-surface-variant">
                  {inactivePriests.map((p) => (
                    <option key={p.id} value={p.id} className="text-sm text-on-surface-variant font-normal">
                      Lm. {p.christian_name ? p.christian_name + ' ' : ''}{p.full_name} (Không đương nhiệm)
                    </option>
                  ))}
                </optgroup>
              )}
            </>
          )}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-lg pointer-events-none">
          expand_more
        </span>
      </div>
      {error && <p className="mt-1 flex items-center gap-1 text-xs text-red-500 font-medium"> <span className="material-symbols-outlined text-sm">error</span> {error}</p>}
    </div>
  );
}
