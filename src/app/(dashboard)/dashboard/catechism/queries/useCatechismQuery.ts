import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { CertificateListResponse, CertificateDetail, CertificateType } from '@/types/catechism';

export function useCatechismQuery(params?: Record<string, string>) {
  const queryString = new URLSearchParams(params).toString();
  
  return useQuery<CertificateListResponse, Error>({
    queryKey: ['catechism', params],
    queryFn: () => apiFetch<CertificateListResponse>(`/api/v1/catechism-certificates?${queryString}`),
    staleTime: 60_000,
  });
}

export function useCatechismDetailQuery(id: string) {
  return useQuery<CertificateDetail, Error>({
    queryKey: ['catechism', id],
    queryFn: () => apiFetch<CertificateDetail>(`/api/v1/catechism-certificates/${id}`),
    enabled: !!id,
    staleTime: 60_000,
  });
}
