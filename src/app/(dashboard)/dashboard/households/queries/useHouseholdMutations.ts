"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export function useDeleteHousehold(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return apiFetch(`/api/v1/households/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["households"] });
    },
  });
}

export function useCreateHousehold() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      return apiFetch<{ id: string }>(`/api/v1/households`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["households"] });
    },
  });
}

export function useAddMemberToHousehold(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      return apiFetch<{ id: string }>(`/api/v1/households/${id}/members`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["households"] });
      queryClient.invalidateQueries({ queryKey: ["households", id] });
      queryClient.invalidateQueries({ queryKey: ["parishioners"] });
    },
  });
}

export function useSplitHousehold(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      return apiFetch<{ id: string }>(`/api/v1/households/${id}/split`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["households"] });
      queryClient.invalidateQueries({ queryKey: ["households", id] });
      queryClient.invalidateQueries({ queryKey: ["parishioners"] });
    },
  });
}

export function useUpdateHousehold(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      return apiFetch<{ id: string }>(`/api/v1/households/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["households"] });
      queryClient.invalidateQueries({ queryKey: ["households", id] });
      queryClient.invalidateQueries({ queryKey: ["parishioners"] });
    },
  });
}
