"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { HouseholdListResponse } from "@/types/household";

export function useHouseholdsQuery(params?: Record<string, string>) {
  const queryString = params ? new URLSearchParams(params).toString() : "";
  const url = `/api/v1/households${queryString ? `?${queryString}` : ""}`;
  
  return useQuery<HouseholdListResponse, Error>({
    queryKey: ["households", params],
    queryFn: () => apiFetch<HouseholdListResponse>(url),
  });
}
