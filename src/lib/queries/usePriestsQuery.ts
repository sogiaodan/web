"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export function usePriestsQuery() {
  return useQuery({
    queryKey: ["priests"],
    queryFn: () => apiFetch<unknown[]>("/api/v1/priests"),
  });
}
