'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  MoreVertical,
  Users,
  X,
  Filter,
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  usePriestsQuery,
  useCreatePriest,
  useUpdatePriest,
  useDeletePriest,
  Priest,
  PriestType,
  PriestPosition,
  CreatePriestPayload,
} from '@/lib/queries/usePriestsQueries';

// ─── Helpers / Constants ─────────────────────────────────────────────────────

const PRIEST_TYPE_LABELS: Record<PriestType, string> = {
  INTERNAL: 'Trong xứ',
  EXTERNAL: 'Ngoài xứ',
};

const PRIEST_POSITION_LABELS: Record<PriestPosition, string> = {
  PARISH_PRIEST: 'Chánh xứ',
  ASSISTANT_PRIEST: 'Phó xứ',
  GUEST: 'Cha Khách',
};

const TYPE_BADGE_CLASSES: Record<PriestType, string> = {
  INTERNAL: 'bg-emerald-100 text-emerald-700',
  EXTERNAL: 'bg-amber-100 text-amber-700',
};

const POSITION_BADGE_CLASSES: Record<PriestPosition, string> = {
  PARISH_PRIEST: 'bg-primary/10 text-primary',
  ASSISTANT_PRIEST: 'bg-blue-100 text-blue-700',
  GUEST: 'bg-surface-container text-muted',
};

// ─── Zod Schema ──────────────────────────────────────────────────────────────

const priestSchema = z.object({
  christian_name: z.string().trim().optional(),
  full_name: z.string().trim().min(2, 'Họ và tên phải có ít nhất 2 ký tự').max(255, 'Họ và tên quá dài'),
  type: z.enum(['INTERNAL', 'EXTERNAL'] as const),
  position: z.enum(['PARISH_PRIEST', 'ASSISTANT_PRIEST', 'GUEST'] as const),
  current_parish: z.string().trim().max(255, 'Tên giáo xứ quá dài').optional(),
  is_active: z.boolean(),
});

type PriestFormValues = z.infer<typeof priestSchema>;

// ─── Sub-Components ───────────────────────────────────────────────────────────

/** Individual table row action menu */
function RowActionMenu({
  priest,
  onEdit,
  onDelete,
}: {
  priest: Priest;
  onEdit: (p: Priest) => void;
  onDelete: (p: Priest) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="Tùy chọn"
        onClick={() => setOpen((o) => !o)}
        className={`p-2 w-[44px] h-[44px] md:w-[36px] md:h-[36px] rounded-full text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex items-center justify-center ${open ? 'bg-hover-bg text-foreground' : 'hover:bg-hover-bg'}`}
      >
        <MoreVertical className="h-5 w-5 md:h-4 md:w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-background border border-outline rounded shadow-lg overflow-hidden z-50">
          <button
            type="button"
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-foreground hover:bg-hover-bg transition-colors focus-visible:outline-none focus-visible:bg-hover-bg"
            onClick={() => { setOpen(false); onEdit(priest); }}
          >
            <Edit2 className="h-4 w-4" />
            Chỉnh sửa
          </button>
          <button
            type="button"
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-error hover:bg-error/10 transition-colors focus-visible:outline-none focus-visible:bg-error/10"
            onClick={() => { setOpen(false); onDelete(priest); }}
          >
            <Trash2 className="h-4 w-4" />
            Xóa
          </button>
        </div>
      )}
    </div>
  );
}

/** Desktop data table */
function PriestTable({
  priests,
  canEdit,
  onEdit,
  onDelete,
}: {
  priests: Priest[];
  canEdit: boolean;
  onEdit: (p: Priest) => void;
  onDelete: (p: Priest) => void;
}) {
  if (priests.length === 0) {
    return (
      <div className="hidden md:flex flex-col items-center justify-center py-16 text-center border border-outline rounded bg-surface">
        <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-muted" />
        </div>
        <p className="font-serif text-lg font-bold text-foreground">Chưa có linh mục nào</p>
        <p className="text-sm text-muted mt-1">Nhấn &quot;Thêm Linh mục&quot; để bắt đầu thêm</p>
      </div>
    );
  }

  return (
    <div className="hidden md:block border border-outline rounded bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-container border-b border-outline [&>th:first-child]:rounded-tl [&>th:last-child]:rounded-tr">
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Tên Thánh
            </th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Họ và Tên
            </th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Loại
            </th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Chức vụ
            </th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Giáo xứ HT
            </th>
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Trạng thái
            </th>
            {canEdit && (
              <th className="px-4 py-3 w-[60px]" />
            )}
          </tr>
        </thead>
        <tbody>
          {priests.map((priest, idx) => (
            <tr
              key={priest.id}
              className={`hover:bg-hover-bg transition-colors ${idx !== 0 ? 'border-t border-outline' : ''}`}
            >
              <td className="px-4 py-3 font-medium text-foreground">
                {priest.christian_name ? (
                  <span className="text-primary font-serif">{priest.christian_name}</span>
                ) : (
                  <span className="text-muted italic text-xs">—</span>
                )}
              </td>
              <td className="px-4 py-3 font-semibold text-foreground">
                {priest.full_name}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${TYPE_BADGE_CLASSES[priest.type]}`}>
                  {PRIEST_TYPE_LABELS[priest.type]}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${POSITION_BADGE_CLASSES[priest.position]}`}>
                  {PRIEST_POSITION_LABELS[priest.position]}
                </span>
              </td>
              <td className="px-4 py-3 text-foreground max-w-[180px] truncate" title={priest.current_parish ?? ''}>
                {priest.current_parish || <span className="text-muted italic text-xs">—</span>}
              </td>
              <td className="px-4 py-3">
                {priest.is_active ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    Đương nhiệm
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted inline-block" />
                    Đã chuyển xứ
                  </span>
                )}
              </td>
              {canEdit && (
                <td className="px-2 py-1 text-right">
                  <RowActionMenu priest={priest} onEdit={onEdit} onDelete={onDelete} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Mobile card list */
function PriestCardList({
  priests,
  canEdit,
  onEdit,
  onDelete,
}: {
  priests: Priest[];
  canEdit: boolean;
  onEdit: (p: Priest) => void;
  onDelete: (p: Priest) => void;
}) {
  if (priests.length === 0) {
    return (
      <div className="md:hidden flex flex-col items-center justify-center py-16 text-center border border-outline rounded bg-surface">
        <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-muted" />
        </div>
        <p className="font-serif text-lg font-bold text-foreground">Chưa có linh mục nào</p>
        <p className="text-sm text-muted mt-1">Nhấn &quot;Thêm Linh mục&quot; để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className="md:hidden flex flex-col gap-3">
      {priests.map((priest) => (
        <div
          key={priest.id}
          className="relative bg-surface border border-outline rounded p-4 flex items-start justify-between gap-3 hover:border-primary transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {priest.christian_name && (
                <span className="font-serif text-primary font-medium text-sm">{priest.christian_name}</span>
              )}
              <span className="font-serif font-bold text-[17px] text-foreground">{priest.full_name}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${TYPE_BADGE_CLASSES[priest.type]}`}>
                {PRIEST_TYPE_LABELS[priest.type]}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${POSITION_BADGE_CLASSES[priest.position]}`}>
                {PRIEST_POSITION_LABELS[priest.position]}
              </span>
              {priest.is_active ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100">
                  Đương nhiệm
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase text-muted bg-surface-container">
                  Đã chuyển xứ
                </span>
              )}
            </div>
            {priest.current_parish && (
              <p className="mt-2 text-xs text-muted truncate">{priest.current_parish}</p>
            )}
          </div>

          {canEdit && (
            <div className="shrink-0">
              <RowActionMenu priest={priest} onEdit={onEdit} onDelete={onDelete} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** Table skeleton for loading state */
function TableSkeleton() {
  return (
    <div className="border border-outline rounded overflow-hidden animate-pulse">
      <div className="bg-surface-container h-10 border-b border-outline" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`flex items-center gap-4 px-4 py-3 ${i > 0 ? 'border-t border-outline' : ''}`}>
          <div className="h-4 w-16 bg-foreground/10 rounded" />
          <div className="h-4 w-32 bg-foreground/10 rounded" />
          <div className="h-5 w-16 bg-foreground/10 rounded" />
          <div className="h-5 w-20 bg-foreground/10 rounded" />
          <div className="h-4 w-24 bg-foreground/10 rounded" />
          <div className="h-4 w-16 bg-foreground/10 rounded ml-auto" />
        </div>
      ))}
    </div>
  );
}

// ─── Priest Form Dialog (Create / Edit) ──────────────────────────────────────

function PriestFormDialog({
  mode,
  priest,
  onClose,
}: {
  mode: 'CREATE' | 'EDIT';
  priest?: Priest;
  onClose: () => void;
}) {
  const createMutation = useCreatePriest();
  const updateMutation = useUpdatePriest();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PriestFormValues>({
    resolver: zodResolver(priestSchema),
    defaultValues: {
      christian_name: priest?.christian_name ?? '',
      full_name: priest?.full_name ?? '',
      type: priest?.type ?? 'INTERNAL',
      position: priest?.position ?? 'PARISH_PRIEST',
      current_parish: priest?.current_parish ?? '',
      is_active: priest?.is_active ?? true,
    },
  });

  const isActive = useWatch({ control, name: 'is_active' });
  const position = useWatch({ control, name: 'position' });

  const onSubmit = async (values: PriestFormValues) => {
    const payload: CreatePriestPayload = {
      full_name: values.full_name,
      type: values.type,
      position: values.position,
      is_active: values.is_active,
      ...(values.christian_name ? { christian_name: values.christian_name } : {}),
      ...(values.current_parish ? { current_parish: values.current_parish } : {}),
    };

    try {
      if (mode === 'CREATE') {
        await createMutation.mutateAsync(payload);
      } else if (priest) {
        await updateMutation.mutateAsync({ id: priest.id, payload });
      }
      onClose();
    } catch {
      // Errors are handled in the mutation hooks via toast
    }
  };

  const inputCls = (hasError: boolean) =>
    `w-full h-12 px-4 rounded bg-surface border ${
      hasError
        ? 'border-error ring-1 ring-error'
        : 'border-outline focus:border-primary focus:ring-1 focus:ring-primary'
    } focus:outline-none text-sm text-foreground transition-all disabled:opacity-60 disabled:cursor-not-allowed`;

  const selectCls = (hasError: boolean) =>
    `w-full h-12 px-4 rounded bg-surface border appearance-none ${
      hasError
        ? 'border-error ring-1 ring-error'
        : 'border-outline focus:border-primary focus:ring-1 focus:ring-primary'
    } focus:outline-none text-sm text-foreground transition-all disabled:opacity-60 disabled:cursor-not-allowed`;

  const isPending = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-foreground/50 transition-opacity"
        onClick={() => !isPending && onClose()}
      />

      {/* Dialog: bottom sheet on mobile, centered on desktop */}
      <div className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 z-50 w-full md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-background rounded-t-2xl md:rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[92dvh] md:max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-outline flex items-center justify-between bg-surface shrink-0">
            <h2 className="font-serif text-xl font-bold text-foreground">
              {mode === 'CREATE' ? 'Thêm Linh mục' : 'Chỉnh sửa Linh mục'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              aria-label="Đóng"
              className="p-2 rounded-full hover:bg-hover-bg text-muted min-h-[48px] min-w-[48px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary -mr-2 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {/* Christian Name */}
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
                Tên Thánh
              </label>
              <input
                {...register('christian_name')}
                disabled={isPending}
                placeholder="VD: Phêrô, Giuse, Maria..."
                className={inputCls(!!errors.christian_name)}
              />
              {errors.christian_name && (
                <p className="mt-1 text-xs text-error">{errors.christian_name.message}</p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
                Họ và Tên <span className="text-error">*</span>
              </label>
              <input
                {...register('full_name')}
                disabled={isPending}
                placeholder="VD: Nguyễn Văn An"
                className={inputCls(!!errors.full_name)}
              />
              {errors.full_name && (
                <p className="mt-1 text-xs text-error">{errors.full_name.message}</p>
              )}
            </div>

            {/* Type + Position (2-column on desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
                  Loại <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select {...register('type')} disabled={isPending} className={selectCls(!!errors.type)}>
                    <option value="INTERNAL">Trong xứ</option>
                    <option value="EXTERNAL">Ngoài xứ</option>
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 h-4 w-4 text-muted pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
                  Chức vụ <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select {...register('position')} disabled={isPending} className={selectCls(!!errors.position)}>
                    <option value="PARISH_PRIEST">Chánh xứ</option>
                    <option value="ASSISTANT_PRIEST">Phó xứ</option>
                    <option value="GUEST">Cha Khách</option>
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 h-4 w-4 text-muted pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Current Parish — only shown for Cha Khách */}
            {position === 'GUEST' && (
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
                  Giáo xứ hiện tại
                </label>
                <input
                  {...register('current_parish')}
                  disabled={isPending}
                  placeholder="VD: Giáo xứ Thị Nghè"
                  className={inputCls(!!errors.current_parish)}
                />
                {errors.current_parish && (
                  <p className="mt-1 text-xs text-error">{errors.current_parish.message}</p>
                )}
              </div>
            )}

            {/* Active Status Toggle */}
            <div>
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">
                Trạng thái
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => setValue('is_active', !isActive, { shouldValidate: true })}
                disabled={isPending}
                className={`flex items-center gap-3 w-full p-4 border rounded transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[48px] ${
                  isActive ? 'border-emerald-300 bg-emerald-50' : 'border-outline hover:bg-hover-bg'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {/* Toggle pill */}
                <span
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    isActive ? 'bg-emerald-500' : 'bg-muted/40'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </span>
                <span className="flex flex-col items-start">
                  <span className="text-sm font-semibold text-foreground">
                    {isActive ? 'Đương nhiệm' : 'Đã chuyển xứ'}
                  </span>
                  <span className="text-xs text-muted">
                    {isActive
                      ? 'Linh mục sẽ xuất hiện trong danh sách chọn khi lập hồ sơ bí tích.'
                      : 'Linh mục sẽ được ẩn khỏi danh sách chọn mới.'}
                  </span>
                </span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-surface border-t border-outline flex flex-col-reverse md:flex-row items-center justify-end gap-3 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="w-full md:w-auto px-5 py-2 text-sm font-medium text-foreground hover:bg-hover-bg border border-outline rounded min-h-[48px] transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="w-full md:w-auto px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded min-h-[48px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending && <LoadingSpinner className="h-4 w-4" />}
              {mode === 'CREATE' ? 'Thêm linh mục' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────

function DeleteConfirmationDialog({
  priest,
  onClose,
}: {
  priest: Priest;
  onClose: () => void;
}) {
  const deleteMutation = useDeletePriest();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(priest.id);
      onClose();
    } catch {
      // Errors handled by the mutation hook toast
    }
  };

  const displayName = [priest.christian_name, priest.full_name].filter(Boolean).join(' ');

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-foreground/50 transition-opacity"
        onClick={() => !deleteMutation.isPending && onClose()}
      />
      <div className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 z-50 md:w-full md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2">
        <div className="bg-background rounded-xl shadow-xl overflow-hidden flex flex-col">
          <div className="p-6 pb-4">
            <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-error" />
            </div>
            <h3 className="font-serif text-[20px] font-bold text-foreground mb-2">
              Xóa Linh mục
            </h3>
            <p className="text-sm text-foreground">
              Bạn có chắc muốn xóa linh mục{' '}
              <strong className="font-serif text-primary">{displayName}</strong>?
            </p>
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-[13px] text-amber-800 leading-relaxed">
              <strong>Lưu ý:</strong> Linh mục sẽ được xóa mềm. Nếu đã liên kết với hồ
              sơ bí tích, dữ liệu lịch sử vẫn được giữ nguyên nhưng sẽ không còn trong
              danh sách chọn.
            </div>
          </div>

          <div className="px-6 py-4 bg-surface border-t border-outline flex flex-col-reverse md:flex-row items-center justify-end gap-3 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4">
            <button
              type="button"
              onClick={onClose}
              disabled={deleteMutation.isPending}
              className="w-full md:w-auto px-5 py-2 text-sm font-medium text-foreground hover:bg-hover-bg border border-outline rounded min-h-[48px] transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="w-full md:w-auto px-6 py-2 text-sm font-bold text-white bg-error hover:opacity-90 rounded min-h-[48px] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteMutation.isPending ? (
                <LoadingSpinner className="h-4 w-4" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Xóa linh mục
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

type ActiveFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

function FilterBar({
  value,
  onChange,
}: {
  value: ActiveFilter;
  onChange: (v: ActiveFilter) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      <div className="flex items-center gap-1.5 text-muted text-sm shrink-0">
        <Filter className="h-4 w-4" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Trạng thái</span>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide min-h-[36px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              value === opt
                ? 'bg-primary text-white'
                : 'bg-surface border border-outline text-foreground hover:bg-hover-bg'
            }`}
          >
            {opt === 'ALL' ? 'Tất cả' : opt === 'ACTIVE' ? 'Đương nhiệm' : 'Đã chuyển xứ'}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function PriestsClientPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('ALL');
  const [editingPriest, setEditingPriest] = useState<Priest | null>(null);
  const [deletingPriest, setDeletingPriest] = useState<Priest | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const queryFilters = useMemo(() => {
    if (activeFilter === 'ACTIVE') return { is_active: true };
    if (activeFilter === 'INACTIVE') return { is_active: false };
    return {};
  }, [activeFilter]);

  const { data: priests, isLoading, error, refetch } = usePriestsQuery(queryFilters);

  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const canDelete = user?.role === 'ADMIN';

  const handleEdit = useCallback((p: Priest) => setEditingPriest(p), []);
  const handleDelete = useCallback((p: Priest) => setDeletingPriest(p), []);

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 lg:max-w-6xl lg:mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm font-medium text-muted mb-6">
        <Link href="/settings" className="hover:text-primary transition-colors">
          Cài đặt
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-primary font-bold">Quản lý Linh mục</span>
      </nav>

      {/* Header + CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-[24px] md:text-[28px] font-bold text-foreground">
            Danh mục Linh mục
          </h1>
          <p className="font-sans text-sm md:text-base text-muted mt-1">
            Quản lý danh sách linh mục tham gia cử hành bí tích trong giáo xứ.
          </p>
        </div>
        {canEdit && (
          <button
            id="btn-add-priest"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[48px] w-full md:w-auto transition-colors shrink-0"
          >
            <Plus className="h-5 w-5" />
            Thêm Linh mục
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="mb-4">
        <FilterBar value={activeFilter} onChange={setActiveFilter} />
      </div>

      {/* Loading skeleton */}
      {isLoading && <TableSkeleton />}

      {/* Error state */}
      {!isLoading && error && (
        <div className="text-center py-12 border border-error/20 rounded bg-error/5">
          <p className="text-sm text-error font-medium">Có lỗi xảy ra khi tải danh sách linh mục.</p>
          <button
            onClick={() => refetch()}
            className="mt-3 text-sm text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Data: Desktop table + Mobile cards */}
      {!isLoading && !error && priests && (
        <>
          <PriestTable
            priests={priests}
            canEdit={canEdit || canDelete}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <PriestCardList
            priests={priests}
            canEdit={canEdit || canDelete}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Count */}
          {priests.length > 0 && (
            <p className="mt-4 text-xs text-muted text-right">
              {priests.length} linh mục
            </p>
          )}
        </>
      )}

      {/* Create dialog */}
      {isCreateOpen && (
        <PriestFormDialog mode="CREATE" onClose={() => setIsCreateOpen(false)} />
      )}

      {/* Edit dialog */}
      {editingPriest && (
        <PriestFormDialog
          mode="EDIT"
          priest={editingPriest}
          onClose={() => setEditingPriest(null)}
        />
      )}

      {/* Delete dialog */}
      {deletingPriest && (
        <DeleteConfirmationDialog
          priest={deletingPriest}
          onClose={() => setDeletingPriest(null)}
        />
      )}
    </div>
  );
}
