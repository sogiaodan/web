import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { SacramentListResponse, MarriageListResponse, SacramentType } from "@/types/sacrament";

export function useSacramentsQuery(params?: Record<string, string>) {
  const queryString = new URLSearchParams(params).toString();
  const type = params?.type || 'BAPTISM';
  const isMarriage = type === 'MARRIAGE';
  
  const endpoint = isMarriage
    ? `/api/v1/sacraments/marriages?${queryString}`
    : `/api/v1/sacraments?${queryString}`;

  return useQuery({
    queryKey: ["sacraments", isMarriage ? "marriages" : "standard", params],
    queryFn: () => apiFetch<SacramentListResponse | MarriageListResponse>(endpoint),
    staleTime: 60_000,
  });
}

export function useSacramentDetailQuery(id: string, isMarriage: boolean) {
  const endpoint = isMarriage
    ? `/api/v1/sacraments/marriages/${id}`
    : `/api/v1/sacraments/${id}`;

  return useQuery({
    queryKey: ["sacraments", isMarriage ? "marriages" : "standard", id],
    queryFn: () => apiFetch<any>(endpoint),
    enabled: !!id,
    staleTime: 60_000,
  });
}
