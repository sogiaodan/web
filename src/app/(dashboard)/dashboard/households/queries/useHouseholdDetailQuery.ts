"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { Household } from "@/types/household";

export function useHouseholdDetailQuery(id: string) {
  return useQuery<Household, Error>({
    queryKey: ["households", id],
    queryFn: () => apiFetch<Household>(`/api/v1/households/${id}`),
    enabled: !!id,
  });
}
