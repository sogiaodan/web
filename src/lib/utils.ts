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

export function sanitizeForSentry(obj: unknown): unknown {
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

  const sanitized = Array.isArray(obj) 
    ? [...obj] as unknown[] 
    : { ...(obj as Record<string, unknown>) };

  const target = sanitized as Record<string, unknown>;

  for (const key in target) {
    const val = target[key];
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      target[key] = '[REDACTED]';
    } else if (typeof val === 'object' && val !== null) {
      target[key] = sanitizeForSentry(val);
    } else if (typeof val === 'string' && val.length > 2000) {
      target[key] = val.substring(0, 2000) + '... [TRUNCATED]';
    }
  }

  return target;
}
