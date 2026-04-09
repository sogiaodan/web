"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export function useHouseholdDetailQuery(id: string) {
  return useQuery({
    queryKey: ["households", id],
    queryFn: () => apiFetch(`/api/v1/households/${id}`),
  });
}
