'use client';

const CACHE_KEY = 'sogiaodan_saint_names_cache';
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

export interface SaintName {
  name: string;
  gender: 'MALE' | 'FEMALE';
  is_popular: boolean;
}

/**
 * Lấy danh sách Tên Thánh từ cache (localStorage).
 * Nếu chưa có, sẽ trả về mảng rỗng và cần được fetch lại qua getOrRefreshSaintNames.
 */
export function getCachedSaintNames(): SaintName[] {
  if (typeof window === 'undefined') return [];
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return [];
  try {
    return JSON.parse(cached);
  } catch {
    return [];
  }
}

/**
 * Fetch danh sách từ API và lưu vào cache.
 * Chỉ gọi khi cần nạp dữ liệu lần đầu hoặc muốn làm mới thủ công.
 */
export async function refreshSaintNamesCache(): Promise<SaintName[]> {
  try {
    const res = await fetch('/api/v1/settings/saints');
    if (res.ok) {
      const body = await res.json();
      const data = body.data || [];
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      // Save timestamp to check TTL later if needed
      localStorage.setItem(`${CACHE_KEY}_ts`, Date.now().toString());
      return data;
    }
  } catch (err) {
    console.error('Failed to refresh saint names cache', err);
  }
  return [];
}

/**
 * Ưu tiên lấy từ cache, nếu cache trống thì mới fetch.
 * Đảm bảo hệ thống luôn có dữ liệu mà không làm phiền API quá nhiều.
 */
export async function getOrRefreshSaintNames(): Promise<SaintName[]> {
  const cached = getCachedSaintNames();
  const ts = typeof window !== 'undefined' ? localStorage.getItem(`${CACHE_KEY}_ts`) : null;
  const isExpired = !ts || (Date.now() - parseInt(ts)) > CACHE_TTL;

  if (cached.length > 0 && !isExpired) {
    return cached;
  }
  return await refreshSaintNamesCache();
}
