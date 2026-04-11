'use client';

import React from 'react';

interface GenderSelectProps {
  value: 'MALE' | 'FEMALE' | string;
  onChange: (value: 'MALE' | 'FEMALE') => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  variant?: 'cards' | 'toggle';
}

export function GenderSelect({
  value,
  onChange,
  label = 'Giới tính',
  required = false,
  disabled = false,
  error,
  className = '',
  variant = 'cards'
}: GenderSelectProps) {
  const options = [
    { value: 'MALE' as const, label: 'Nam', icon: 'male' },
    { value: 'FEMALE' as const, label: 'Nữ', icon: 'female' },
  ];

  const labelCls = "block text-[10px] font-bold text-[#78716C] uppercase tracking-[0.12em] font-body mb-2";

  if (variant === 'toggle') {
    return (
      <div className={`space-y-1.5 ${className}`}>
        {label && (
          <label className={labelCls}>
            {label}
            {required && <span className="text-primary ml-0.5">*</span>}
          </label>
        )}
        <div className="flex bg-[#F5F5F4] p-1 rounded border border-[#E7E5E4] h-[46px] w-full md:w-max">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              className={`flex-1 md:px-8 rounded text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                value === opt.value
                  ? 'bg-white text-primary shadow-sm border border-[#E7E5E4]/50'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="material-symbols-outlined text-lg">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
        {error && <p className="mt-1.5 text-xs font-body text-[#B91C1C]">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className={labelCls}>
          {label}
          {required && <span className="text-primary ml-0.5">*</span>}
        </label>
      )}
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`flex-1 min-w-[120px] flex items-center gap-3 px-5 py-3 border rounded cursor-pointer transition-all group ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            } ${
              value === opt.value
                ? 'border-primary bg-primary/5'
                : 'border-[#E7E5E4] hover:border-primary/40 hover:bg-[#F5F5F4]'
            }`}
          >
            <input
              type="radio"
              name={`gender-${label}`}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => !disabled && onChange(opt.value)}
              disabled={disabled}
              className="sr-only"
            />
            <span
              className={`material-symbols-outlined text-xl ${
                value === opt.value ? 'text-primary' : 'text-[#78716C]'
              }`}
            >
              {opt.icon}
            </span>
            <span
              className={`font-body font-semibold text-sm ${
                value === opt.value ? 'text-primary' : 'text-[#1C1917]'
              }`}
            >
              {opt.label}
            </span>
            {value === opt.value && (
              <span className="material-symbols-outlined text-primary text-sm ml-auto">
                check_circle
              </span>
            )}
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-body text-[#B91C1C] flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">error</span>
          {error}
        </p>
      )}
    </div>
  );
}
