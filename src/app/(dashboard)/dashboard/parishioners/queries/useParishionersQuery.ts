"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { ParishionerListResponse } from "@/types/parishioner";

export function useParishionersQuery(params?: Record<string, string | string[]>) {
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
  
  return useQuery({
    queryKey: ["parishioners", params],
    queryFn: () => apiFetch<ParishionerListResponse>(`/api/v1/parishioners?${queryString.toString()}`),
  });
}
