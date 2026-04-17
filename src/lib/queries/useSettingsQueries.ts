'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsAPI, ParishInfo } from '@/lib/api/settings';
import { toast } from 'sonner';

export function useBackupStatusQuery() {
  return useQuery({
    queryKey: ['settings', 'backup-status'],
    queryFn: () => SettingsAPI.getBackupStatus(),
  });
}

export function useParishQuery(enabled = true) {
  return useQuery({
    queryKey: ['settings', 'parish-info'],
    queryFn: () => SettingsAPI.getParishInfo(),
    enabled,
  });
}

export function useUpdateParishMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ParishInfo>) => SettingsAPI.updateParishInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'parish-info'] });
      toast.success('Parish information updated successfully');
    },
    onError: (err: unknown) => {
      const error = err as Error;
      toast.error(error.message || 'Lỗi cập nhật thông tin');
    },
  });
}

export function useBackupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => SettingsAPI.triggerBackup(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'backup-status'] });
      toast.success('Sao lưu dữ liệu thành công');
    },
    onError: (err: unknown) => {
      const error = err as Error;
      toast.error(error.message || 'Có lỗi xảy ra trong quá trình sao lưu');
    },
  });
}

export function useExportExcelMutation() {
  return useMutation({
    mutationFn: () => SettingsAPI.exportExcel(),
    onSuccess: () => {
      toast.success('Xuất dữ liệu Excel thành công');
    },
    onError: (err: unknown) => {
      const error = err as Error;
      toast.error(error.message || 'Có lỗi xảy ra khi xuất dữ liệu');
    },
  });
}

export function useLogoUploadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => SettingsAPI.uploadLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'parish-info'] });
      toast.success('Logo uploaded successfully');
    },
    onError: (err: unknown) => {
      const error = err as Error;
      toast.error(error.message || 'Lỗi tải ảnh lên');
    },
  });
}
