'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Bell,
  Plus,
  Pencil,
  Trash2,
  X,
  Megaphone,
  Wrench,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Calendar,
} from 'lucide-react';
import clsx from 'clsx';
import {
  useSystemAdminNotificationsQuery,
  useCreateSystemNotificationMutation,
  useUpdateSystemNotificationMutation,
  useDeleteSystemNotificationMutation,
} from '@/lib/queries/useSystemAdminQueries';
import {
  SystemNotification,
  NotificationType,
  CreateSystemNotificationRequest,
  UpdateSystemNotificationRequest,
} from '@/types/system-admin';
import { FormInput } from '@/components/ui/FormInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getTypeMeta(type: NotificationType) {
  switch (type) {
    case 'MAINTENANCE':
      return { label: 'Bảo trì', icon: Wrench,     class: 'bg-amber-50 text-amber-700' };
    case 'FEATURE':
      return { label: 'Tính năng', icon: Sparkles,  class: 'bg-violet-50 text-violet-700' };
    case 'ANNOUNCEMENT':
      return { label: 'Thông báo', icon: Megaphone, class: 'bg-blue-50 text-blue-700' };
  }
}

// ─── Notification Schema ──────────────────────────────────────────────────────

const notifSchema = z.object({
  title: z.string().min(2, 'Tiêu đề phải ít nhất 2 ký tự'),
  message: z.string().min(5, 'Nội dung phải ít nhất 5 ký tự'),
  type: z.enum(['MAINTENANCE', 'FEATURE', 'ANNOUNCEMENT'] as const),
  is_active: z.boolean().optional(),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
});
type NotifFormData = z.infer<typeof notifSchema>;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function NotifSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white border border-outline rounded-sm p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-48 bg-outline/40 rounded" />
            <div className="h-5 w-24 bg-outline/30 rounded" />
          </div>
          <div className="h-3 w-full bg-outline/20 rounded" />
          <div className="h-3 w-2/3 bg-outline/20 rounded" />
        </div>
      ))}
    </div>
  );
}

// ─── Delete Confirmation ──────────────────────────────────────────────────────

function DeleteConfirmDialog({
  notif,
  onConfirm,
  onCancel,
}: {
  notif: SystemNotification;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const mutation = useDeleteSystemNotificationMutation(notif.id);
  const handleConfirm = async () => {
    await mutation.mutateAsync();
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white border border-outline rounded-sm shadow-2xl max-w-sm w-full p-8 space-y-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-red-50 rounded-sm text-red-600 shrink-0">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-foreground">Xóa thông báo?</h3>
            <p className="text-sm text-muted mt-1">
              Thông báo <strong>"{notif.title}"</strong> sẽ bị xóa vĩnh viễn.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={mutation.isPending}
            className="flex-1 min-h-[48px] rounded-sm border border-outline text-sm font-bold text-foreground hover:bg-hover-bg transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={mutation.isPending}
            className="flex-[2] min-h-[48px] rounded-sm bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50"
          >
            {mutation.isPending ? 'Đang xóa...' : 'Xác nhận xóa'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Notification Form Drawer ─────────────────────────────────────────────────

interface DrawerProps {
  editing?: SystemNotification;
  onClose: () => void;
}

function NotificationDrawer({ editing, onClose }: DrawerProps) {
  const createMutation = useCreateSystemNotificationMutation();
  const updateMutation = useUpdateSystemNotificationMutation(editing?.id ?? '');

  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<NotifFormData>({
    resolver: zodResolver(notifSchema),
    defaultValues: {
      title: editing?.title ?? '',
      message: editing?.message ?? '',
      type: editing?.type ?? 'ANNOUNCEMENT',
      is_active: editing?.is_active ?? true,
      starts_at: editing?.starts_at?.slice(0, 10) ?? '',
      ends_at: editing?.ends_at?.slice(0, 10) ?? '',
    },
  });

  const isActive = watch('is_active') ?? true;

  const onSubmit = async (data: NotifFormData) => {
    const payload = {
      ...data,
      starts_at: data.starts_at || undefined,
      ends_at: data.ends_at || undefined,
    };
    try {
      if (editing) {
        await updateMutation.mutateAsync(payload as UpdateSystemNotificationRequest);
      } else {
        await createMutation.mutateAsync(payload as CreateSystemNotificationRequest);
      }
      onClose();
    } catch {
      // toast handled by mutation
    }
  };

  const TYPE_OPTIONS: { value: NotificationType; label: string }[] = [
    { value: 'ANNOUNCEMENT', label: 'Thông báo chung' },
    { value: 'MAINTENANCE', label: 'Bảo trì hệ thống' },
    { value: 'FEATURE', label: 'Tính năng mới' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative w-full max-w-lg flex flex-col bg-white shadow-2xl border-l border-outline h-full animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline bg-vellum/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-sm text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <h2 className="font-serif text-lg font-bold text-foreground">
              {editing ? 'Sửa thông báo' : 'Tạo thông báo mới'}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="p-2 min-h-[48px] min-w-[48px] flex items-center justify-center hover:bg-hover-bg rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8">
          <form id="notif-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormInput
              {...register('title')}
              label="Tiêu đề"
              placeholder="Nâng cấp hệ thống định kỳ"
              error={errors.title?.message}
              disabled={isPending}
            />

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Nội dung</label>
              <textarea
                {...register('message')}
                rows={5}
                placeholder="Mô tả chi tiết thông báo..."
                disabled={isPending}
                className="w-full px-3 py-2.5 text-sm border border-outline rounded-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all disabled:bg-vellum/60 disabled:text-muted"
              />
              {errors.message && <p className="text-xs text-red-600">{errors.message.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Loại</label>
              <select
                {...register('type')}
                disabled={isPending}
                className="w-full h-11 px-3 text-sm border border-outline rounded-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer disabled:bg-vellum/60"
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Bắt đầu
                </label>
                <input
                  type="date"
                  {...register('starts_at')}
                  disabled={isPending}
                  className="w-full h-11 px-3 text-sm border border-outline rounded-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Kết thúc
                </label>
                <input
                  type="date"
                  {...register('ends_at')}
                  disabled={isPending}
                  className="w-full h-11 px-3 text-sm border border-outline rounded-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between p-4 bg-vellum/50 rounded-sm border border-outline/50">
              <div>
                <p className="text-sm font-bold text-foreground">Kích hoạt ngay</p>
                <p className="text-xs text-muted">Thông báo sẽ hiển thị cho người dùng</p>
              </div>
              <button
                type="button"
                onClick={() => setValue('is_active', !isActive)}
                disabled={isPending}
                className="p-1"
              >
                {isActive
                  ? <ToggleRight className="h-7 w-7 text-primary" />
                  : <ToggleLeft className="h-7 w-7 text-muted" />
                }
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-outline bg-vellum/30 flex gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 min-h-[48px] rounded-sm border border-outline bg-white text-sm font-bold text-foreground hover:bg-hover-bg disabled:opacity-50"
          >
            Hủy
          </button>
          <PrimaryButton
            form="notif-form"
            type="submit"
            isLoading={isPending}
            className="flex-[2] shadow-md shadow-primary/20"
          >
            {editing ? 'Lưu thay đổi' : 'Đăng thông báo'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

// ─── Notification Card ────────────────────────────────────────────────────────

function NotificationCard({
  notif,
  onEdit,
  onDelete,
}: {
  notif: SystemNotification;
  onEdit: (n: SystemNotification) => void;
  onDelete: (n: SystemNotification) => void;
}) {
  const meta = getTypeMeta(notif.type);
  const Icon = meta.icon;

  return (
    <article className={clsx(
      'bg-white border rounded-sm shadow-sm transition-all duration-200 p-6 space-y-4',
      notif.is_active ? 'border-primary/20' : 'border-outline opacity-70',
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={clsx('p-2 rounded-sm', meta.class)}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-foreground leading-tight">{notif.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={clsx(
                'text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded',
                meta.class,
              )}>
                {meta.label}
              </span>
              <span className={clsx(
                'text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded',
                notif.is_active
                  ? 'bg-green-50 text-green-700'
                  : 'bg-stone-100 text-stone-500',
              )}>
                {notif.is_active ? 'Đang hoạt động' : 'Ẩn'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(notif)}
            className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-sm hover:bg-hover-bg transition-colors text-muted hover:text-primary"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(notif)}
            className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-sm hover:bg-red-50 transition-colors text-muted hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="text-sm text-muted leading-relaxed">{notif.message}</p>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted pt-1 border-t border-outline/40">
        {(notif.starts_at || notif.ends_at) && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(notif.starts_at)} → {formatDate(notif.ends_at)}
          </span>
        )}
        <span>Tạo: {formatDate(notif.created_at)}</span>
      </div>
    </article>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SystemNotificationsClientPage() {
  const { data: notifications, isLoading, error } = useSystemAdminNotificationsQuery();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingNotif, setEditingNotif] = useState<SystemNotification | undefined>(undefined);
  const [deletingNotif, setDeletingNotif] = useState<SystemNotification | undefined>(undefined);

  const handleOpenCreate = useCallback(() => {
    setEditingNotif(undefined);
    setDrawerOpen(true);
  }, []);

  const handleOpenEdit = useCallback((n: SystemNotification) => {
    setEditingNotif(n);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setEditingNotif(undefined);
  }, []);

  const active = (notifications ?? []).filter((n) => n.is_active);
  const inactive = (notifications ?? []).filter((n) => !n.is_active);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">Thông Báo Hệ Thống</h1>
          <p className="text-sm text-muted mt-1">Quản lý thông báo và thông điệp phát sóng toàn nền tảng</p>
        </div>
        <button
          id="btn-create-notification"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[48px] rounded-sm bg-primary text-white text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Tạo thông báo mới
        </button>
      </div>

      {/* Summary pills */}
      {!isLoading && notifications && (
        <div className="flex flex-wrap gap-3">
          <div className="px-4 py-2 rounded-sm bg-green-50 border border-green-100 text-sm">
            <span className="font-bold text-green-700">{active.length}</span>
            <span className="text-green-600 ml-1.5">đang hoạt động</span>
          </div>
          <div className="px-4 py-2 rounded-sm bg-stone-100 border border-stone-200 text-sm">
            <span className="font-bold text-stone-600">{inactive.length}</span>
            <span className="text-stone-500 ml-1.5">đã ẩn</span>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <NotifSkeleton />
      ) : error ? (
        <div className="py-16 text-center text-muted italic">Lỗi tải dữ liệu. Thử làm mới trang.</div>
      ) : notifications?.length === 0 ? (
        <div className="py-24 text-center space-y-4">
          <Bell className="h-12 w-12 text-muted/40 mx-auto" />
          <p className="text-muted font-medium">Chưa có thông báo nào được tạo.</p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm border border-primary text-primary text-sm font-bold hover:bg-primary/5 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Tạo thông báo đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <span className="h-px w-4 bg-primary" /> Đang hoạt động ({active.length})
              </h2>
              {active.map((n) => (
                <NotificationCard key={n.id} notif={n} onEdit={handleOpenEdit} onDelete={setDeletingNotif} />
              ))}
            </section>
          )}
          {inactive.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted flex items-center gap-2">
                <span className="h-px w-4 bg-muted" /> Đã ẩn ({inactive.length})
              </h2>
              {inactive.map((n) => (
                <NotificationCard key={n.id} notif={n} onEdit={handleOpenEdit} onDelete={setDeletingNotif} />
              ))}
            </section>
          )}
        </div>
      )}

      {/* Drawer */}
      {drawerOpen && (
        <NotificationDrawer editing={editingNotif} onClose={handleCloseDrawer} />
      )}

      {/* Delete confirmation */}
      {deletingNotif && (
        <DeleteConfirmDialog
          notif={deletingNotif}
          onConfirm={() => setDeletingNotif(undefined)}
          onCancel={() => setDeletingNotif(undefined)}
        />
      )}
    </div>
  );
}
