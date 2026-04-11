'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { systemAdminApi } from '@/lib/system-admin-api';
import {
  SystemAdminStats,
  ChurchListItem,
  ChurchDetail,
  UpdateChurchRequest,
  UpdateChurchResponse,
  ToggleChurchStatusRequest,
  ToggleChurchStatusResponse,
  ChurchOnboardingRequest,
  ChurchOnboardingResponse,
  ContactRequest,
  UpdateContactRequestStatusRequest,
  UpdateContactRequestStatusResponse,
  SystemNotification,
  CreateSystemNotificationRequest,
  UpdateSystemNotificationRequest,
  AuditLogQuery,
  AuditLogListResponse,
  BackupRecord,
} from '@/types/system-admin';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const systemAdminKeys = {
  all: ['system-admin'] as const,
  stats: () => [...systemAdminKeys.all, 'stats'] as const,
  churches: (params?: { search?: string; status?: 'ACTIVE' | 'INACTIVE' }) =>
    [...systemAdminKeys.all, 'churches', params ?? {}] as const,
  churchDetail: (id: string) => [...systemAdminKeys.all, 'churches', id] as const,
  contactRequests: () => [...systemAdminKeys.all, 'contact-requests'] as const,
  notifications: () => [...systemAdminKeys.all, 'notifications'] as const,
  auditLogs: (params?: AuditLogQuery) => [...systemAdminKeys.all, 'audit-logs', params ?? {}] as const,
  backups: () => [...systemAdminKeys.all, 'backups'] as const,
};

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export function useSystemAdminStatsQuery(
  options?: Omit<UseQueryOptions<SystemAdminStats, Error, SystemAdminStats, any>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<SystemAdminStats, Error>({
    queryKey: systemAdminKeys.stats(),
    queryFn: () => systemAdminApi.getStats(),
    staleTime: 30_000,
    ...options,
  });
}

// ─── Churches List ────────────────────────────────────────────────────────────

export function useChurchesQuery(
  params?: { search?: string; status?: 'ACTIVE' | 'INACTIVE' },
  options?: Omit<UseQueryOptions<ChurchListItem[], Error, ChurchListItem[], any>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<ChurchListItem[], Error>({
    queryKey: systemAdminKeys.churches(params),
    queryFn: () => systemAdminApi.getChurches(params),
    staleTime: 30_000,
    ...options,
  });
}

// ─── Church Detail ────────────────────────────────────────────────────────────

export function useChurchDetailQuery(
  id: string,
  options?: Omit<UseQueryOptions<ChurchDetail, Error, ChurchDetail, any>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<ChurchDetail, Error>({
    queryKey: systemAdminKeys.churchDetail(id),
    queryFn: () => systemAdminApi.getChurchById(id),
    enabled: !!id,
    staleTime: 30_000,
    ...options,
  });
}

// ─── Onboard Church ───────────────────────────────────────────────────────────

export function useOnboardChurchMutation() {
  const queryClient = useQueryClient();
  return useMutation<ChurchOnboardingResponse, Error, ChurchOnboardingRequest>({
    mutationFn: (data) => systemAdminApi.createChurch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemAdminKeys.churches() });
      queryClient.invalidateQueries({ queryKey: systemAdminKeys.stats() });
      toast.success('Khởi tạo giáo xứ thành công!');
    },
    onError: (error: any) => {
      if (error.status === 409) {
        toast.error('Schema name hoặc email đã tồn tại. Vui lòng kiểm tra lại.');
      } else {
        toast.error(error.message || 'Lỗi khi khởi tạo thực thể giáo xứ.');
      }
    },
  });
}

// ─── Update Church ────────────────────────────────────────────────────────────

export function useUpdateChurchMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation<UpdateChurchResponse, Error, UpdateChurchRequest>({
    mutationFn: (data) => systemAdminApi.updateChurch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemAdminKeys.churchDetail(id) });
      queryClient.invalidateQueries({ queryKey: systemAdminKeys.churches() });
      toast.success('Cập nhật thông tin giáo xứ thành công!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Lỗi cập nhật thông tin giáo xứ.');
    },
  });
}

// ─── Toggle Church Status ─────────────────────────────────────────────────────

export function useToggleChurchStatusMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation<ToggleChurchStatusResponse, Error, ToggleChurchStatusRequest>({
    mutationFn: (data) => systemAdminApi.toggleChurchStatus(id, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: systemAdminKeys.churchDetail(id) });
      queryClient.invalidateQueries({ queryKey: systemAdminKeys.churches() });
      queryClient.invalidateQueries({ queryKey: systemAdminKeys.stats() });
      const label = result.status === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa';
      toast.success(`Giáo xứ đã được ${label} thành công.`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Lỗi cập nhật trạng thái giáo xứ.');
    },
  });
}

// ─── Contact Requests ─────────────────────────────────────────────────────────

export function useSystemAdminContactRequestsQuery(
  options?: Omit<UseQueryOptions<ContactRequest[], Error, ContactRequest[], any>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<ContactRequest[], Error>({
    queryKey: systemAdminKeys.contactRequests(),
    queryFn: () => systemAdminApi.getContactRequests(),
    staleTime: 30_000,
    ...options,
  });
}

export function useUpdateContactRequestStatusMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation<UpdateContactRequestStatusResponse, Error, UpdateContactRequestStatusRequest>({
    mutationFn: (data) => systemAdminApi.updateContactRequestStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemAdminKeys.contactRequests() });
      toast.success('Cập nhật trạng thái yêu cầu liên hệ thành công!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Lỗi cập nhật trạng thái yêu cầu liên hệ.');
    },
  });
}

// ─── System Notifications ─────────────────────────────────────────────────────

export function useSystemAdminNotificationsQuery(
  options?: Omit<UseQueryOptions<SystemNotification[], Error, SystemNotification[], any>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<SystemNotification[], Error>({
    queryKey: systemAdminKeys.notifications(),
    queryFn: () => systemAdminApi.getNotifications(),
    staleTime: 30_000,
    ...options,
  });
}

export function useCreateSystemNotificationMutation() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string }, Error, CreateSystemNotificationRequest>({
    mutationFn: (data) => systemAdminApi.createNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemAdminKeys.notifications() });
      toast.success('Tạo thông báo hệ thống thành công!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Lỗi khi tạo thông báo hệ thống.');
    },
  });
}

export function useUpdateSystemNotificationMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation<{ id: string }, Error, UpdateSystemNotificationRequest>({
    mutationFn: (data) => systemAdminApi.updateNotification(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemAdminKeys.notifications() });
      toast.success('Cập nhật thông báo hệ thống thành công!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Lỗi khi cập nhật thông báo hệ thống.');
    },
  });
}

export function useDeleteSystemNotificationMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation<null, Error, void>({
    mutationFn: () => systemAdminApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemAdminKeys.notifications() });
      toast.success('Xóa thông báo hệ thống thành công!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Lỗi khi xóa thông báo hệ thống.');
    },
  });
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export function useSystemAdminAuditLogsQuery(
  params?: AuditLogQuery,
  options?: Omit<UseQueryOptions<AuditLogListResponse, Error, AuditLogListResponse, any>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<AuditLogListResponse, Error>({
    queryKey: systemAdminKeys.auditLogs(params),
    queryFn: () => systemAdminApi.getAuditLogs(params),
    staleTime: 30_000,
    ...options,
  });
}

// ─── Backups ──────────────────────────────────────────────────────────────────

export function useSystemAdminBackupsQuery(
  options?: Omit<UseQueryOptions<BackupRecord[], Error, BackupRecord[], any>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<BackupRecord[], Error>({
    queryKey: systemAdminKeys.backups(),
    queryFn: () => systemAdminApi.getBackups(),
    staleTime: 30_000,
    ...options,
  });
}

export function useTriggerChurchBackupMutation(churchId: string) {
  const queryClient = useQueryClient();
  return useMutation<{ message: string; church_id: string }, Error, void>({
    mutationFn: () => systemAdminApi.triggerChurchBackup(churchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemAdminKeys.backups() });
      queryClient.invalidateQueries({ queryKey: systemAdminKeys.churchDetail(churchId) });
      toast.success('Yêu cầu sao lưu giáo xứ thành công!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Lỗi khi yêu cầu sao lưu giáo xứ.');
    },
  });
}
