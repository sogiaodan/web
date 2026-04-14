import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';

export function useCreateParishGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      return apiFetch<{ id: string }>(`/api/v1/parish-groups`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parish-groups', 'list'] });
    },
  });
}

export function useUpdateParishGroup(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      return apiFetch<{ id: string }>(`/api/v1/parish-groups/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parish-groups', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['parish-groups', 'detail', id] });
    },
  });
}

export function useDeleteParishGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return apiFetch(`/api/v1/parish-groups/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parish-groups', 'list'] });
    },
  });
}

export function useAddParishGroupMember(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { parishioner_id: string; role?: string; joined_at?: string }) => {
      return apiFetch<{ id: string }>(`/api/v1/parish-groups/${groupId}/members`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parish-groups', 'detail', groupId] });
      queryClient.invalidateQueries({ queryKey: ['parish-groups', 'list'] });
    },
  });
}

export function useUpdateParishGroupMember(groupId: string, memberId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { role?: string; joined_at?: string }) => {
      return apiFetch<{ id: string }>(`/api/v1/parish-groups/${groupId}/members/${memberId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parish-groups', 'detail', groupId] });
    },
  });
}

export function useRemoveParishGroupMember(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: string) => {
      return apiFetch(`/api/v1/parish-groups/${groupId}/members/${memberId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parish-groups', 'detail', groupId] });
      queryClient.invalidateQueries({ queryKey: ['parish-groups', 'list'] });
    },
  });
}
