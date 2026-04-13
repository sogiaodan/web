import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import {
  ParishGroupListResponse,
  ParishGroupDetail,
  ParishGroupCategory,
} from '@/types/parish-group';

export function useParishGroupCategoriesQuery() {
  return useQuery<ParishGroupCategory[], Error>({
    queryKey: ['parish-groups', 'categories'],
    queryFn: () => apiFetch<ParishGroupCategory[]>('/api/v1/parish-groups/categories'),
  });
}

export function useParishGroupsQuery(params?: Record<string, string | string[]>) {
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
  
  return useQuery<ParishGroupListResponse, Error>({
    queryKey: ['parish-groups', 'list', params],
    queryFn: () => apiFetch<ParishGroupListResponse>(`/api/v1/parish-groups?${queryString.toString()}`),
  });
}

export function useParishGroupDetailQuery(id: string) {
  return useQuery<ParishGroupDetail, Error>({
    queryKey: ['parish-groups', 'detail', id],
    queryFn: () => apiFetch<ParishGroupDetail>(`/api/v1/parish-groups/${id}`),
    enabled: !!id && id !== 'new',
    staleTime: 60_000,
  });
}
