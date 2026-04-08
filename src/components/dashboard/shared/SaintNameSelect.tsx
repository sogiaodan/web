'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getOrRefreshSaintNames, SaintName } from '@/lib/cache-saint-names';

interface SaintNameSelectProps {
  value: string;
  onChange: (value: string) => void;
  gender?: 'MALE' | 'FEMALE' | string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

const FALLBACK_SAINTS: SaintName[] = [
  { name: 'Giuse', is_popular: true, gender: 'MALE' },
  { name: 'Maria', is_popular: true, gender: 'FEMALE' },
  { name: 'Phêrô', is_popular: true, gender: 'MALE' },
  { name: 'Phaolô', is_popular: true, gender: 'MALE' },
  { name: 'Anna', is_popular: true, gender: 'FEMALE' },
  { name: 'Gioan', is_popular: true, gender: 'MALE' },
  { name: 'Têrêsa', is_popular: true, gender: 'FEMALE' },
];

export function SaintNameSelect({
  value,
  onChange,
  gender,
  label = 'Tên Thánh',
  required = false,
  disabled = false,
  error,
  className = '',
}: SaintNameSelectProps) {
  const [saintNames, setSaintNames] = useState<SaintName[]>([]);
  const [showAllSaints, setShowAllSaints] = useState(false);

  useEffect(() => {
    getOrRefreshSaintNames().then(setSaintNames);
  }, []);

  const filteredSaints = useMemo(() => {
    const pool = saintNames.length > 0 ? saintNames : FALLBACK_SAINTS;
    return pool.filter((n) => {
      const matchesPopular = showAllSaints || n.is_popular;
      // If gender is set, only show matching gender. If not set, show all.
      const matchesGender = !gender || n.gender === gender;
      return matchesPopular && matchesGender;
    });
  }, [saintNames, showAllSaints, gender]);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-[10px] font-bold text-[#78716C] uppercase tracking-[0.12em] font-body mb-2">
          {label}
          {required && <span className="text-primary ml-0.5">*</span>}
        </label>
      )}
      <div className="space-y-2">
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`w-full appearance-none bg-surface border border-[#E7E5E4] rounded px-4 py-3 text-sm font-body text-[#1C1917] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all pr-10 ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#A8A29E]'
            } ${error ? 'border-red-500' : ''}`}
          >
            <option value="">{required ? '-- Chọn Tên Thánh --' : 'Tất cả Tên Thánh'}</option>
            {filteredSaints.map((n) => (
              <option key={n.name} value={n.name}>
                {n.name}
              </option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#78716C] text-lg pointer-events-none">
            expand_more
          </span>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={() => setShowAllSaints(!showAllSaints)}
            className="text-xs text-primary font-medium hover:underline flex items-center gap-1 transition-all"
          >
            <span className="material-symbols-outlined text-sm">
              {showAllSaints ? 'unfold_less' : 'unfold_more'}
            </span>
            {showAllSaints ? 'Chỉ hiện Tên Thánh phổ biến' : 'Hiện tất cả Tên Thánh'}
          </button>
        )}
        {error && (
          <p className="mt-1.5 text-xs font-body text-[#B91C1C] flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">error</span>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
