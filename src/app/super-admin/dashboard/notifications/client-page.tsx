'use client';

import { useState, useCallback, useEffect } from 'react';
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
  Monitor,
  Rows3,
  ToggleLeft,
  ToggleRight,
  Calendar,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CircleStop,
  Play,
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
  NotificationDisplayType,
  CreateSystemNotificationRequest,
  UpdateSystemNotificationRequest,
} from '@/types/system-admin';
import { FormInput } from '@/components/ui/FormInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function getTypeMeta(type: NotificationDisplayType) {
  switch (type) {
    case 'BANNER':
      return { label: 'Banner', icon: Megaphone, class: 'bg-primary/10 text-primary' };
    case 'PANEL':
      return { label: 'Thông báo', icon: Bell, class: 'bg-blue-50 text-blue-700' };
    case 'POPUP':
      return { label: 'Popup', icon: Rows3, class: 'bg-violet-50 text-violet-700' };
    case 'MAINTENANCE':
      return { label: 'Bảo trì', icon: Wrench, class: 'bg-amber-50 text-amber-700' };
  }
}

// ─── Notification Schema ──────────────────────────────────────────────────────

/** Converts UTC ISO string from server to local "YYYY-MM-DDTHH:mm" for input */
function toLocalInput(utcString?: string): string {
  if (!utcString) return '';
  const date = new Date(utcString);
  if (isNaN(date.getTime())) return '';
  // Adjust for timezone offset manually to get local ISO string
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().slice(0, 16);
}

/** Converts local "YYYY-MM-DDTHH:mm" from input to UTC ISO string for server */
function toUtcISO(localString?: string): string | undefined {
  if (!localString) return undefined;
  const date = new Date(localString);
  if (isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

const notifSchema = z.object({
  title: z.string().min(2, 'Tiêu đề phải ít nhất 2 ký tự'),
  message: z.string().min(5, 'Nội dung phải ít nhất 5 ký tự'),
  extended_content: z.string().optional(),
  display_type: z.enum(['BANNER', 'PANEL', 'POPUP', 'MAINTENANCE']),
  starts_at: z.string().min(1, 'Vui lòng chọn thời gian bắt đầu'),
  ends_at: z.string().min(1, 'Vui lòng chọn thời gian kết thúc'),
}).refine((data) => {
  if (data.starts_at && data.ends_at) {
    return new Date(data.ends_at) > new Date(data.starts_at);
  }
  return true;
}, {
  message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
  path: ['ends_at'],
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
  const [showExtended, setShowExtended] = useState(!!editing?.extended_content);

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
      extended_content: editing?.extended_content ?? '',
      display_type: editing?.display_type ?? 'PANEL',
      starts_at: toLocalInput(editing?.starts_at) || (() => {
        const nextHour = new Date();
        nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
        return new Date(nextHour.getTime() - nextHour.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      })(),
      ends_at: toLocalInput(editing?.ends_at) || (() => {
        const oneMonth = new Date();
        oneMonth.setDate(oneMonth.getDate() + 30);
        oneMonth.setHours(23, 59, 0, 0);
        return new Date(oneMonth.getTime() - oneMonth.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      })(),
    },
  });

  const displayType = watch('display_type');
  const startsAt = watch('starts_at');

  useEffect(() => {
    if (editing) return; 

    const start = new Date(startsAt);
    if (isNaN(start.getTime())) return;

    if (displayType === 'MAINTENANCE') {
      const end = new Date(start.getTime() + 4 * 60 * 60 * 1000); 
      setValue('ends_at', new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    } else {
      const end = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000); 
      end.setHours(23, 59, 0, 0);
      setValue('ends_at', new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    }
  }, [displayType, startsAt, setValue, editing]);

  const onSubmit = async (data: NotifFormData) => {
    const payload = {
      ...data,
      extended_content: data.extended_content || undefined,
      starts_at: toUtcISO(data.starts_at),
      ends_at: toUtcISO(data.ends_at),
    };
    try {
      if (editing) {
        await updateMutation.mutateAsync(payload as UpdateSystemNotificationRequest);
      } else {
        await createMutation.mutateAsync(payload as CreateSystemNotificationRequest);
      }
      onClose();
    } catch {}
  };

  const TYPE_OPTIONS: { value: NotificationDisplayType; label: string; description: string }[] = [
    { value: 'PANEL', label: 'Thông báo (Panel)', description: 'Hiện trong dropdown chuông ở header' },
    { value: 'BANNER', label: 'Banner', description: 'Dải màu ở đầu trang dashboard' },
    { value: 'POPUP', label: 'Popup khi đăng nhập', description: 'Modal hiện 1 lần mỗi phiên' },
    { value: 'MAINTENANCE', label: 'Bảo trì hệ thống', description: 'Chặn toàn bộ UI trong khoảng starts_at → ends_at' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative w-full max-w-lg flex flex-col bg-white shadow-2xl border-l border-outline h-full animate-in slide-in-from-right duration-300">
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
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">
                Mô tả ngắn
              </label>
              <textarea
                {...register('message')}
                rows={3}
                placeholder="Mô tả tóm tắt hiển thị trực tiếp trong banner / panel / popup..."
                disabled={isPending}
                className="w-full px-3 py-2.5 text-sm border border-outline rounded-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all disabled:bg-vellum/60 disabled:text-muted"
              />
              {errors.message && <p className="text-xs text-red-600">{errors.message.message}</p>}
            </div>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setShowExtended(!showExtended)}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted hover:text-primary transition-colors group"
              >
                {showExtended ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                Nội dung chi tiết (HTML)
                <span className="px-1.5 py-0.5 bg-violet-50 text-violet-700 text-[9px] font-bold rounded uppercase tracking-wider">Tùy chọn</span>
              </button>

              {showExtended && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                  <textarea
                    {...register('extended_content')}
                    rows={8}
                    placeholder={'<h2>Tiêu đề</h2>\n<p>Nội dung chi tiết...</p>\n<ul><li>Điểm 1</li></ul>'}
                    disabled={isPending}
                    className="w-full px-3 py-2.5 text-sm border border-outline rounded-sm bg-white font-mono focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-y transition-all disabled:bg-vellum/60 disabled:text-muted"
                  />
                  <p className="text-[10px] text-muted italic">
                    Khi có nội dung này, người dùng sẽ thấy nút <strong>"Xem chi tiết"</strong> dẫn tới trang /dashboard/announcements/[id].
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">
                Loại hiển thị
              </label>
              <div className="grid grid-cols-1 gap-2">
                {TYPE_OPTIONS.map((o) => {
                  const meta = getTypeMeta(o.value);
                  const Icon = meta.icon;
                  const selected = displayType === o.value;
                  return (
                    <label
                      key={o.value}
                      className={clsx(
                        'flex items-center gap-3 p-3 rounded-sm border cursor-pointer transition-all',
                        selected
                          ? 'border-primary bg-primary/[0.03]'
                          : 'border-outline hover:border-primary/40 hover:bg-vellum/50',
                      )}
                    >
                      <input
                        type="radio"
                        {...register('display_type')}
                        value={o.value}
                        className="sr-only"
                        disabled={isPending}
                      />
                      <div className={clsx('p-1.5 rounded', meta.class, 'shrink-0')}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground">{o.label}</p>
                        <p className="text-xs text-muted">{o.description}</p>
                      </div>
                      {selected && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {displayType === 'MAINTENANCE' && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-sm text-xs text-amber-800 leading-relaxed">
                ⚠️ Chế độ <strong>Bảo trì</strong> sẽ <strong>chặn toàn bộ giao diện</strong> người dùng trong khoảng thời gian bắt đầu → kết thúc. Hãy đặt thời gian chính xác.
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Bắt đầu
                </label>
                <input
                  type="datetime-local"
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
                  type="datetime-local"
                  {...register('ends_at')}
                  disabled={isPending}
                  className="w-full h-11 px-3 text-sm border border-outline rounded-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>
          </form>
        </div>

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

interface NotificationCardProps {
  notif: SystemNotification;
  onEdit: (n: SystemNotification) => void;
  onDelete: (n: SystemNotification) => void;
  onEndNow: (n: SystemNotification) => void;
  onStartNow: (n: SystemNotification) => void;
  isActioning?: boolean;
}

function NotificationCard({
  notif,
  onEdit,
  onDelete,
  onEndNow,
  onStartNow,
  isActioning,
}: NotificationCardProps) {
  const meta = getTypeMeta(notif.display_type);
  const Icon = meta.icon;
  const now = new Date();
  const isExpired = notif.ends_at ? new Date(notif.ends_at) < now : false;
  const isScheduled = notif.starts_at ? new Date(notif.starts_at) > now : false;
  const isRunning = !isExpired && !isScheduled;

  return (
    <article className={clsx(
      'bg-white border rounded-sm shadow-sm transition-all duration-200 p-6 space-y-4',
      isRunning ? 'border-primary/20' : 'border-outline opacity-70',
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={clsx('p-2 rounded-sm', meta.class)}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-serif font-bold text-foreground">
                {notif.title}
              </h3>
              <span className={clsx(
                'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded',
                meta.class
              )}>
                {meta.label}
              </span>
              <span className={clsx(
                'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded',
                isExpired ? 'bg-red-50 text-red-600' :
                isScheduled ? 'bg-blue-50 text-blue-600' :
                'bg-green-50 text-green-700'
              )}>
                {isExpired ? 'Hết hạn' :
                 isScheduled ? 'Sắp diễn ra' :
                 'Đang hoạt động'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isScheduled && (
            <button
              onClick={() => onStartNow(notif)}
              disabled={isActioning}
              title="Kích hoạt ngay"
              className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-sm hover:bg-blue-50 transition-colors text-muted hover:text-blue-600 disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
            </button>
          )}
          {isRunning && (
            <button
              onClick={() => onEndNow(notif)}
              disabled={isActioning}
              title="Kết thúc ngay"
              className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-sm hover:bg-amber-50 transition-colors text-muted hover:text-amber-600 disabled:opacity-50"
            >
              <CircleStop className="h-4 w-4" />
            </button>
          )}
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
  const [actioningId, setActioningId] = useState<string | null>(null);

  const updateMutation = useUpdateSystemNotificationMutation(actioningId ?? '');

  const handleStartNow = async (n: SystemNotification) => {
    if (!confirm(`Bạn có chắc muốn kích hoạt thông báo "${n.title}" ngay bây giờ không?`)) return;
    setActioningId(n.id);
    try {
      await updateMutation.mutateAsync({
        starts_at: new Date().toISOString(),
      });
    } finally {
      setActioningId(null);
    }
  };

  const handleEndNow = async (n: SystemNotification) => {
    if (!confirm(`Bạn có chắc muốn kết thúc thông báo "${n.title}" ngay bây giờ?`)) return;
    setActioningId(n.id);
    try {
      await updateMutation.mutateAsync({
        ends_at: new Date().toISOString(),
      });
    } finally {
      setActioningId(null);
    }
  };

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

  const now = new Date();
  const active = (notifications ?? []).filter((n) => {
    const isExpired = n.ends_at ? new Date(n.ends_at) < now : false;
    const isScheduled = n.starts_at ? new Date(n.starts_at) > now : false;
    return !isExpired && !isScheduled;
  });
  const inactive = (notifications ?? []).filter((n) => {
    const isExpired = n.ends_at ? new Date(n.ends_at) < now : false;
    const isScheduled = n.starts_at ? new Date(n.starts_at) > now : false;
    return isExpired || isScheduled;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">Thông Báo Hệ Thống</h1>
          <p className="text-sm text-muted mt-1">Quản lý thông báo và thông điệp phát sóng toàn nền tảng</p>
        </div>
        <PrimaryButton
          id="btn-create-notification"
          onClick={handleOpenCreate}
          className="gap-2 w-full sm:w-auto shadow-md shadow-primary/20"
        >
          <Plus className="h-4 w-4" />
          Tạo thông báo mới
        </PrimaryButton>
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
                <NotificationCard
                  key={n.id}
                  notif={n}
                  onEdit={handleOpenEdit}
                  onDelete={setDeletingNotif}
                  onEndNow={handleEndNow}
                  onStartNow={handleStartNow}
                  isActioning={actioningId === n.id}
                />
              ))}
            </section>
          )}
          {inactive.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted flex items-center gap-2">
                <span className="h-px w-4 bg-muted" /> Đã ẩn ({inactive.length})
              </h2>
              {inactive.map((n) => (
                <NotificationCard
                  key={n.id}
                  notif={n}
                  onEdit={handleOpenEdit}
                  onDelete={setDeletingNotif}
                  onEndNow={handleEndNow}
                  onStartNow={handleStartNow}
                  isActioning={actioningId === n.id}
                />
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
