import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { ParishionerListResponse, ParishionerDetail } from '@/types/parishioner';

export function useParishionersQuery(params?: Record<string, string>) {
  const queryString = new URLSearchParams(params).toString();
  
  return useQuery({
    queryKey: ['parishioners', params],
    queryFn: () => apiFetch<ParishionerListResponse>(`/api/v1/parishioners?${queryString}`),
    staleTime: 60_000,
  });
}

export function useParishionerDetailQuery(id: string) {
  return useQuery({
    queryKey: ['parishioners', id],
    queryFn: () => apiFetch<ParishionerDetail>(`/api/v1/parishioners/${id}`),
    enabled: !!id,
    staleTime: 60_000,
  });
}
