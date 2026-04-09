"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { ZoneListResponse } from "@/types/zone";

export interface UseZonesParams {
  limit?: number;
}

export function useZonesQuery(params?: UseZonesParams, options?: any) {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  const queryString = queryParams.toString();
  const url = `/api/v1/zones${queryString ? `?${queryString}` : ""}`;

  return useQuery<ZoneListResponse, Error>({
    queryKey: ["zones", params],
    queryFn: () => apiFetch<ZoneListResponse>(url),
    ...options,
  });
}
