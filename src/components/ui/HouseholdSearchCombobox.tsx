'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Lock, X } from 'lucide-react';

interface HouseholdLookup {
  id: string;
  household_code: string;
  head?: {
    full_name: string;
    christian_name?: string | null;
  };
}

interface HouseholdSearchComboboxProps {
  value: string | null;
  onChange: (id: string | null, household?: HouseholdLookup) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export function HouseholdSearchCombobox({
  value,
  onChange,
  label = 'Tìm kiếm Hộ giáo',
  placeholder = 'Nhập mã số hộ giáo...',
  error,
  disabled = false,
}: HouseholdSearchComboboxProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HouseholdLookup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<HouseholdLookup | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) {
      setSelected(null);
      setQuery('');
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/v1/households?search=${encodeURIComponent(query)}&limit=10`);
        if (res.ok) {
          const json = await res.json();
          setResults(json.data?.items || []);
        }
      } catch (err) {
        console.error('Failed to search households', err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 350);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (household: HouseholdLookup) => {
    setSelected(household);
    setQuery('');
    setIsOpen(false);
    onChange(household.id, household);
  };

  const handleClear = () => {
    setSelected(null);
    onChange(null);
  };

  const formatName = (h: HouseholdLookup) => {
    return h.household_code;
  };

  const formatSub = (h: HouseholdLookup) => {
    if (!h.head) return 'Chưa có chủ hộ';
    return `Chủ hộ: ${h.head.christian_name ? h.head.christian_name + ' ' : ''}${h.head.full_name}`;
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {label && (
        <label className="block text-[11px] font-bold text-[#78716C] uppercase tracking-[0.12em] font-body mb-2">
          {label}
        </label>
      )}

      {selected ? (
        <div className={`relative flex items-center justify-between w-full px-4 py-3 bg-surface border rounded-sm outline-none ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-outline'} ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <Lock className="h-4 w-4 text-on-surface-variant shrink-0" />
            <div className="flex flex-col overflow-hidden">
              <span className="font-display font-medium text-on-surface truncate">
                {formatName(selected)}
              </span>
              <span className="text-xs text-on-surface-variant font-body">
                {formatSub(selected)}
              </span>
            </div>
          </div>
          {!disabled && (
            <button
              title="Xóa lựa chọn"
              type="button"
              onClick={handleClear}
              className="p-1 rounded hover:bg-surface-hover text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <input
            type="text"
            className={`w-full pl-9 pr-10 py-3 bg-surface border border-[#E7E5E4] rounded outline-none text-sm font-body text-[#1C1917] placeholder:text-[#A8A29E] transition-all hover:border-[#A8A29E] focus:border-primary focus:ring-1 focus:ring-primary ${
              error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            disabled={disabled}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
          )}
        </div>
      )}

      {error && <p className="mt-1 flex items-center gap-1 text-xs text-[#B91C1C] font-medium font-body"><span className="material-symbols-outlined text-xs">error</span> {error}</p>}

      {!selected && isOpen && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-surface border border-outline rounded-sm shadow-xl max-h-60 overflow-y-auto">
          {isLoading && results.length === 0 ? (
            <div className="p-4 text-center text-sm text-[#78716C] font-body">Đang tìm kiếm...</div>
          ) : results.length > 0 ? (
            <ul className="py-1 flex flex-col">
              {results.map((household) => (
                <li key={household.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(household)}
                    className="w-full text-left px-4 py-2 hover:bg-[#F5F5F4] transition-colors border-b border-[#E7E5E4] last:border-0 focus-visible:bg-[#F5F5F4] focus-visible:outline-none"
                  >
                    <span className="font-body font-semibold text-[#1C1917] block">
                      {formatName(household)}
                    </span>
                    <span className="text-xs text-[#78716C] font-body block">
                      {formatSub(household)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-[#78716C] italic font-body">
              Không tìm thấy hộ giáo nào.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
