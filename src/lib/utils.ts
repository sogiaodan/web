import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function sanitizeForSentry(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const SENSITIVE_KEYS = [
    'password', 
    'password_confirmation', 
    'new_password', 
    'token', 
    'accessToken', 
    'refreshToken', 
    'secret',
    'bank_account',
    'bank_name',
    'tax_code'
  ];

  const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key in sanitized) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeForSentry(sanitized[key]);
    } else if (typeof sanitized[key] === 'string' && sanitized[key].length > 2000) {
      sanitized[key] = sanitized[key].substring(0, 2000) + '... [TRUNCATED]';
    }
  }

  return sanitized;
}
