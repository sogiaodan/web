'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Check, Lock, X } from 'lucide-react';

interface ParishionerLookup {
  id: string;
  christian_name: string | null;
  full_name: string;
  birth_date: string;
}

interface ParishionerSearchComboboxProps {
  value: string | null; // ID of selected parishioner
  onChange: (id: string | null, parishioner?: ParishionerLookup) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  initialSelected?: ParishionerLookup | null;
}

export function ParishionerSearchCombobox({
  value,
  onChange,
  label = 'Người lãnh nhận',
  placeholder = 'Tìm kiếm tên hoặc mã giáo dân...',
  error,
  disabled = false,
  initialSelected = null,
}: ParishionerSearchComboboxProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ParishionerLookup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<ParishionerLookup | null>(initialSelected);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If value changes from outside (e.g., initial load or reset), update local state
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
        const res = await fetch(`/api/v1/parishioners/search?q=${encodeURIComponent(query)}&limit=10`);
        if (res.ok) {
          const json = await res.json();
          setResults(json.data || []);
        }
      } catch (err) {
        console.error('Failed to search parishioners', err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (person: ParishionerLookup) => {
    setSelected(person);
    setQuery('');
    setIsOpen(false);
    onChange(person.id, person);
  };

  const handleClear = () => {
    setSelected(null);
    onChange(null);
  };

  const formatName = (p: ParishionerLookup) => {
    return `${p.christian_name ? p.christian_name + ' ' : ''}${p.full_name}`;
  };

  const formatDate = (d: string | null) => {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString('vi-VN');
    } catch {
      return '';
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {label && (
        <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
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
              {selected.birth_date && (
                <span className="text-xs text-on-surface-variant font-body">
                  Sinh ngày: {formatDate(selected.birth_date)}
                </span>
              )}
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
            className={`w-full pl-9 pr-10 py-3 bg-surface border rounded-sm outline-none text-sm font-body text-on-surface placeholder:text-on-surface-variant transition-colors focus:ring-2 focus:border-transparent ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-outline focus:ring-primary'
            } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
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

      {error && <p className="mt-1 flex items-center gap-1 text-xs text-red-500 font-medium"> <span className="material-symbols-outlined text-sm">error</span> {error}</p>}

      {!selected && isOpen && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-surface border border-outline rounded-sm shadow-xl max-h-60 overflow-y-auto">
          {isLoading && results.length === 0 ? (
            <div className="p-4 text-center text-sm text-on-surface-variant">Đang tìm kiếm...</div>
          ) : results.length > 0 ? (
            <ul className="py-1">
              {results.map((person) => (
                <li key={person.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(person)}
                    className="w-full text-left px-4 py-2 hover:bg-surface-hover transition-colors flex flex-col focus-visible:bg-surface-hover focus-visible:outline-none"
                  >
                    <span className="font-display font-medium text-on-surface">
                      {formatName(person)}
                    </span>
                    {person.birth_date && (
                      <span className="text-xs text-on-surface-variant font-body">
                        Sinh ngày: {formatDate(person.birth_date)}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-on-surface-variant">
              Không tìm thấy giáo dân nào.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
