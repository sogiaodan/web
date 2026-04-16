"use client";

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { ZoneListResponse } from "@/types/zone";

export interface UseZonesParams {
  limit?: number;
}

export function useZonesQuery(
  params?: UseZonesParams, 
  options?: Omit<UseQueryOptions<ZoneListResponse, Error, ZoneListResponse, readonly unknown[]>, "queryKey" | "queryFn">
) {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  const queryString = queryParams.toString();
  const url = `/api/v1/zones${queryString ? `?${queryString}` : ""}`;

  return useQuery<ZoneListResponse, Error, ZoneListResponse, readonly unknown[]>({
    queryKey: ["zones", params],
    queryFn: () => apiFetch<ZoneListResponse>(url),
    ...options,
  });
}
