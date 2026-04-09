"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export function useSaintNamesQuery(params?: { search?: string; gender?: string; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.gender) query.append('gender', params.gender);
  if (params?.limit) query.append('limit', params.limit.toString());
  
  return useQuery({
    queryKey: ["saint_names", params],
    queryFn: () => apiFetch<any>(`/api/v1/settings/saints?${query.toString()}`),
  });
}
