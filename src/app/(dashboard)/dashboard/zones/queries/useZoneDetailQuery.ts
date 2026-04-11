"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { ZoneDetail } from "@/types/zone";

export function useZoneDetailQuery(id: string, params?: Record<string, string>) {
  const queryString = params ? new URLSearchParams(params).toString() : "";
  
  return useQuery({
    queryKey: ["zones", id, params],
    queryFn: () => apiFetch<ZoneDetail>(`/api/v1/zones/${id}${queryString ? `?${queryString}` : ""}`),
  });
}
