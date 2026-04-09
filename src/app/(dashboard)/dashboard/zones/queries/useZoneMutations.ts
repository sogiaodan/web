"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { CreateZoneDto, UpdateZoneDto } from "@/types/zone";

export function useCreateZone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: CreateZoneDto) => {
      return apiFetch("/api/v1/zones", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
    },
  });
}

export function useUpdateZone(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: UpdateZoneDto) => {
      return apiFetch(`/api/v1/zones/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      queryClient.invalidateQueries({ queryKey: ["zones", id] });
    },
  });
}

export function useDeleteZone(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return apiFetch(`/api/v1/zones/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
    },
  });
}
