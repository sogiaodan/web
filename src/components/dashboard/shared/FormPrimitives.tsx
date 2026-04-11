'use client';

import React from 'react';

/**
 * Standard label for dashboard form fields
 */
export function FieldLabel({ children, required, className = '' }: { children: React.ReactNode; required?: boolean; className?: string }) {
  return (
    <label className={`block text-[10px] font-bold text-[#78716C] uppercase tracking-[0.12em] font-body mb-2 ${className}`}>
      {children}
      {required && <span className="text-primary ml-0.5">*</span>}
    </label>
  );
}

/**
 * Standard error message for dashboard form fields
 */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs font-body text-[#B91C1C] flex items-center gap-1">
      <span className="material-symbols-outlined text-xs">error</span>
      {message}
    </p>
  );
}

/**
 * Standard section header for dashboard forms
 */
export function SectionHeader({ icon, title, subtitle, className = '' }: { icon: string; title: string; subtitle?: string; className?: string }) {
  return (
    <div className={`flex items-start gap-3 mb-6 pb-4 border-b border-[#E7E5E4] ${className}`}>
      <div className="w-9 h-9 rounded bg-primary/10 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-primary text-lg">{icon}</span>
      </div>
      <div>
        <h2 className="font-display font-bold text-[#1C1917] text-base">{title}</h2>
        {subtitle && <p className="text-xs font-body text-[#78716C] mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

/**
 * Shared input classes for consistent styling
 */
export function getInputCls(disabled?: boolean, error?: boolean) {
  return `w-full bg-surface border rounded px-4 py-3 text-sm font-body text-[#1C1917] focus:ring-1 focus:ring-primary outline-none transition-all ${
    error 
      ? 'border-[#B91C1C] focus:border-[#B91C1C] focus:ring-[#B91C1C]' 
      : 'border-[#E7E5E4] focus:border-primary'
  } ${
    disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#A8A29E]'
  }`;
}
