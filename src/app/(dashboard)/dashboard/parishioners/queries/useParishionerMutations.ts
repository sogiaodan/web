import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';

export function useCreateParishioner() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      return apiFetch<{ id: string }>(`/api/v1/parishioners`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parishioners'] });
    },
  });
}

export function useUpdateParishioner(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      return apiFetch<{ id: string }>(`/api/v1/parishioners/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parishioners'] });
      queryClient.invalidateQueries({ queryKey: ['parishioners', id] });
    },
  });
}

export function useDeleteParishioner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiFetch(`/api/v1/parishioners/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parishioners'] });
    },
  });
}
