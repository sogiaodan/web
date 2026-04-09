"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { ZoneListResponse } from "@/types/zone";

export function useZonesQuery() {
  return useQuery({
    queryKey: ["zones"],
    queryFn: () => apiFetch<ZoneListResponse>("/api/v1/zones"),
  });
}
