import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';

export function useCreateCatechism() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      return apiFetch(`/api/v1/catechism-certificates`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catechism'] });
    },
  });
}

export function useUpdateCatechism(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      return apiFetch(`/api/v1/catechism-certificates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catechism'] });
    },
  });
}

export function useDeleteCatechism() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiFetch(`/api/v1/catechism-certificates/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catechism'] });
    },
  });
}
