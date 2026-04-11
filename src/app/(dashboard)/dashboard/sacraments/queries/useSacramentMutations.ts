import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export function useCreateSacrament() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: any) => {
      return apiFetch<{ id: string }>(`/api/v1/sacraments`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sacraments"] });
    },
  });
}

export function useUpdateSacrament(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: any) => {
      return apiFetch<{ id: string }>(`/api/v1/sacraments/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sacraments"] });
    },
  });
}

export function useCreateMarriage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: any) => {
      return apiFetch<{ id: string }>(`/api/v1/sacraments/marriages`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sacraments"] });
    },
  });
}

export function useUpdateMarriage(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: any) => {
      return apiFetch<{ id: string }>(`/api/v1/sacraments/marriages/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sacraments"] });
    },
  });
}

export function useBatchCreateSacraments() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ endpoint, payload }: { endpoint: string, payload: any }) => {
      return apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sacraments"] });
    },
  });
}
