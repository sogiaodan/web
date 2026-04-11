"use client";
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { ParishionerListResponse, ParishionerDetail } from '@/types/parishioner';

/**
 * Hook for fetching a filtered list of parishioners.
 * Handles array parameters for multi-select filters.
 */
export function useParishionersQuery(params?: Record<string, string | string[]>) {
  const queryString = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => {
          if (v) queryString.append(key, v);
        });
      } else if (value) {
        queryString.append(key, value);
      }
    });
  }
  
  return useQuery<ParishionerListResponse, Error>({
    queryKey: ['parishioners', params],
    queryFn: () => apiFetch<ParishionerListResponse>(`/api/v1/parishioners?${queryString.toString()}`),
  });
}

/**
 * Hook for fetching parishioners with Suspense support.
 */
export function useParishionersSuspenseQuery(params?: Record<string, string | string[]>) {
  const queryString = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => {
          if (v) queryString.append(key, v);
        });
      } else if (value) {
        queryString.append(key, value);
      }
    });
  }
  
  return useSuspenseQuery<ParishionerListResponse, Error>({
    queryKey: ['parishioners', params],
    queryFn: () => apiFetch<ParishionerListResponse>(`/api/v1/parishioners?${queryString.toString()}`),
  });
}

/**
 * Hook for fetching a single parishioner's full details.
 */
export function useParishionerDetailQuery(id: string) {
  return useQuery<ParishionerDetail, Error>({
    queryKey: ['parishioners', id],
    queryFn: () => apiFetch<ParishionerDetail>(`/api/v1/parishioners/${id}`),
    enabled: !!id,
    staleTime: 60_000,
  });
}
