"use client";

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { SaintName } from "@/lib/api/settings";

export interface UseSaintNamesParams {
  search?: string;
  gender?: string;
  limit?: number;
}

export function useSaintNamesQuery(
  params?: UseSaintNamesParams,
  options?: Omit<UseQueryOptions<SaintName[], Error, SaintName[], readonly unknown[]>, "queryKey" | "queryFn">
) {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.gender) query.append('gender', params.gender);
  if (params?.limit) query.append('limit', params.limit.toString());
  
  const queryString = query.toString();
  const url = `/api/v1/settings/saints${queryString ? `?${queryString}` : ""}`;

  return useQuery({
    queryKey: ["saint_names", params],
    queryFn: () => apiFetch<SaintName[]>(url),
    ...options,
  });
}
