"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export function useHouseholdsQuery(params?: Record<string, string>) {
  const queryString = params ? new URLSearchParams(params).toString() : "";
  
  return useQuery({
    queryKey: ["households", params],
    queryFn: () => apiFetch(`/api/v1/households${queryString ? `?${queryString}` : ""}`),
  });
}
