import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { SacramentListResponse, MarriageListResponse } from "@/types/sacrament";

export function useSacramentsQuery(params?: Record<string, string>) {
  const type = params?.type || 'BAPTISM';
  const isMarriage = type === 'MARRIAGE';
  
  const searchParams = new URLSearchParams(params);
  if (isMarriage) {
    searchParams.delete('type');
  }
  const queryString = searchParams.toString();
  
  const endpoint = isMarriage
    ? `/api/v1/sacraments/marriages?${queryString}`
    : `/api/v1/sacraments?${queryString}`;

  return useQuery<SacramentListResponse | MarriageListResponse, Error>({
    queryKey: ["sacraments", isMarriage ? "marriages" : "standard", params],
    queryFn: () => apiFetch<SacramentListResponse | MarriageListResponse>(endpoint),
    staleTime: 60_000,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useSacramentDetailQuery<T = any>(id: string, isMarriage: boolean) {
  const endpoint = isMarriage
    ? `/api/v1/sacraments/marriages/${id}`
    : `/api/v1/sacraments/${id}`;

  return useQuery<T, Error>({
    queryKey: ["sacraments", isMarriage ? "marriages" : "standard", id],
    queryFn: () => apiFetch<T>(endpoint),
    enabled: !!id,
    staleTime: 60_000,
  });
}
