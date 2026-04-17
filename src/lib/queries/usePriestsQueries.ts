'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { toast } from 'sonner';

// ─── Types ──────────────────────────────────────────────────────────────────

export type PriestType = 'INTERNAL' | 'EXTERNAL';
export type PriestPosition = 'PARISH_PRIEST' | 'ASSISTANT_PRIEST' | 'GUEST';

export interface Priest {
  id: string;
  christian_name: string | null;
  full_name: string;
  type: PriestType;
  position: PriestPosition;
  is_active: boolean;
  current_parish: string | null;
}

export interface CreatePriestPayload {
  christian_name?: string;
  full_name: string;
  type: PriestType;
  position: PriestPosition;
  is_active: boolean;
  current_parish?: string;
}

export type UpdatePriestPayload = Partial<CreatePriestPayload>;

// ─── Query Keys ─────────────────────────────────────────────────────────────

export const PRIESTS_QUERY_KEY = 'priests';

// ─── Queries ─────────────────────────────────────────────────────────────────

export function usePriestsQuery(
  filters: { is_active?: boolean } = {},
  options?: Omit<UseQueryOptions<Priest[], Error, Priest[], ['priests', typeof filters]>, 'queryKey' | 'queryFn'>
) {
  const params = new URLSearchParams();
  if (filters.is_active !== undefined) {
    params.set('is_active', String(filters.is_active));
  }
  const queryString = params.toString() ? `?${params.toString()}` : '';

  return useQuery<Priest[], Error, Priest[], ['priests', typeof filters]>({
    queryKey: [PRIESTS_QUERY_KEY, filters],
    queryFn: () => apiFetch<Priest[]>(`/api/v1/priests${queryString}`),
    ...options,
  });
}

export function usePriestDetailQuery(
  id: string | null,
  options?: Omit<UseQueryOptions<Priest, Error, Priest, ['priests', 'detail', string]>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Priest, Error, Priest, ['priests', 'detail', string]>({
    queryKey: [PRIESTS_QUERY_KEY, 'detail', id ?? ''],
    queryFn: () => apiFetch<Priest>(`/api/v1/priests/${id}`),
    enabled: !!id,
    ...options,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreatePriest() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string }, Error, CreatePriestPayload>({
    mutationFn: (payload) =>
      apiFetch<{ id: string }>('/api/v1/priests', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRIESTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_summary"] });
      toast.success('Thêm linh mục thành công');
    },
    onError: (err: unknown) => {
      const error = err as Error;
      toast.error(error.message || 'Lỗi kết nối');
    },
  });
}

export function useUpdatePriest() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string; payload: UpdatePriestPayload }>({
    mutationFn: ({ id, payload }) =>
      apiFetch<void>(`/api/v1/priests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRIESTS_QUERY_KEY] });
      toast.success('Cập nhật linh mục thành công');
    },
    onError: (err: unknown) => {
      const error = err as Error;
      toast.error(error.message || 'Lỗi kết nối');
    },
  });
}

export function useDeletePriest() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      apiFetch<void>(`/api/v1/priests/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRIESTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_summary"] });
      toast.success('Đã xóa linh mục thành công');
    },
    onError: (err: unknown) => {
      const error = err as Error;
      toast.error(error.message || 'Lỗi kết nối');
    },
  });
}
