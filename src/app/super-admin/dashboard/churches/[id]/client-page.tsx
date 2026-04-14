'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Globe,
  Building2,
  Save,
  X,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  ShieldOff,
  AlertTriangle,
} from 'lucide-react';
import clsx from 'clsx';
import {
  useChurchDetailQuery,
  useUpdateChurchMutation,
  useToggleChurchStatusMutation,
  useTriggerChurchBackupMutation,
} from '@/lib/queries/useSystemAdminQueries';
import { UpdateChurchRequest, ChurchDetail } from '@/types/system-admin';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DetailPageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-3 w-48 bg-outline/40 rounded" />
        <div className="h-8 w-72 bg-outline/50 rounded" />
        <div className="flex gap-3">
          <div className="h-5 w-28 bg-outline/30 rounded" />
          <div className="h-5 w-20 bg-outline/30 rounded" />
        </div>
      </div>
      <div className="bg-white border border-outline rounded-sm p-8">
        <div className="h-4 w-32 bg-outline/40 rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 bg-outline/30 rounded" />
              <div className="h-10 w-full bg-outline/20 rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white border border-outline rounded-sm p-8">
        <div className="h-4 w-32 bg-outline/40 rounded mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-12 bg-outline/20 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Field Components ─────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  value: string;
  name: keyof UpdateChurchRequest | 'established_year' | 'schema_name';
  type?: string;
  readOnly?: boolean;
  isEditing: boolean;
  onChange: (name: keyof UpdateChurchRequest | 'established_year' | 'schema_name', value: string) => void;
}

function FormField({ label, value, name, type = 'text', readOnly = false, isEditing, onChange }: FieldProps) {
  const baseInput = clsx(
    'w-full px-3 py-2 text-sm border rounded-sm transition-all duration-200 outline-none',
    readOnly || !isEditing
      ? 'bg-vellum/60 border-outline/40 text-muted cursor-default'
      : 'bg-white border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground',
  );

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-muted uppercase tracking-widest">{label}</label>
      <input
        type={type}
        value={value}
        readOnly={readOnly || !isEditing}
        onChange={(e) => onChange(name as any, e.target.value)}
        className={baseInput}
        min={type === 'number' ? 1500 : undefined}
        max={type === 'number' ? 2100 : undefined}
      />
    </div>
  );
}

// ─── Status Toggle Dialog ─────────────────────────────────────────────────────

interface StatusDialogProps {
  currentStatus: 'ACTIVE' | 'INACTIVE';
  churchName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

function StatusToggleDialog({ currentStatus, churchName, onConfirm, onCancel, isLoading }: StatusDialogProps) {
  const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  const isDeactivating = nextStatus === 'INACTIVE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm animate-in fade-in duration-200" onClick={onCancel} />
      <div className="relative bg-white border border-outline rounded-sm shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200 space-y-6">
        <div className="flex items-start gap-4">
          <div className={clsx(
            'p-3 rounded-sm shrink-0',
            isDeactivating ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600',
          )}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-foreground">
              {isDeactivating ? 'Vô hiệu hóa Giáo xứ?' : 'Kích hoạt Giáo xứ?'}
            </h3>
            <p className="text-sm text-muted mt-1">
              {isDeactivating
                ? `Tất cả người dùng thuộc "${churchName}" sẽ không thể đăng nhập sau khi vô hiệu hóa.`
                : `Giáo xứ "${churchName}" sẽ trở lại trạng thái hoạt động bình thường.`}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 min-h-[48px] px-4 rounded-sm border border-outline bg-white text-sm font-bold text-foreground hover:bg-hover-bg transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={clsx(
              'flex-[2] min-h-[48px] px-4 rounded-sm text-sm font-bold text-white transition-all disabled:opacity-50',
              isDeactivating
                ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20'
                : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20',
            )}
          >
            {isLoading ? 'Đang xử lý...' : isDeactivating ? 'Xác nhận vô hiệu hóa' : 'Xác nhận kích hoạt'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Accounts Table ─────────────────────────────────────────────────────

function AdminAccountsTable({ church }: { church: ChurchDetail }) {
  return (
    <section className="bg-white border border-outline rounded-sm shadow-sm overflow-hidden">
      <div className="p-6 border-b border-outline">
        <h2 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
          <span className="h-px w-4 bg-primary" />
          Tài Khoản Quản Trị
        </h2>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-vellum/60 border-b border-outline">
            <tr>
              {['Tên', 'Email', 'Vai trò', 'Trạng thái', 'Đăng nhập lần cuối'].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/40">
            {church.admins.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted italic text-sm">
                  Chưa có tài khoản quản trị.
                </td>
              </tr>
            ) : (
              church.admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-vellum/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{admin.name}</td>
                  <td className="px-6 py-4 text-muted">{admin.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary uppercase tracking-wider">
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider',
                      admin.status === 'ACTIVE'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-stone-100 text-stone-500',
                    )}>
                      <span className={clsx(
                        'h-1.5 w-1.5 rounded-full',
                        admin.status === 'ACTIVE' ? 'bg-green-500' : 'bg-stone-400',
                      )} />
                      {admin.status === 'ACTIVE' ? 'Hoạt động' : 'Vô hiệu'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted text-xs">{formatDateTime(admin.last_login_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden divide-y divide-outline/40">
        {church.admins.length === 0 ? (
          <p className="px-6 py-8 text-center text-muted italic text-sm">Chưa có tài khoản quản trị.</p>
        ) : (
          church.admins.map((admin) => (
            <div key={admin.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground">{admin.name}</p>
                <span className={clsx(
                  'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                  admin.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-stone-500',
                )}>
                  {admin.status === 'ACTIVE' ? 'Hoạt động' : 'Vô hiệu'}
                </span>
              </div>
              <p className="text-xs text-muted">{admin.email}</p>
              <p className="text-xs text-muted">Đăng nhập lần cuối: {formatDateTime(admin.last_login_at)}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

// ─── Management Info Panel ────────────────────────────────────────────────────

interface ManagementPanelProps {
  church: ChurchDetail;
  onToggleStatus: () => void;
}

function ManagementPanel({ church, onToggleStatus }: ManagementPanelProps) {
  const isActive = church.status === 'ACTIVE';

  return (
    <section className="bg-white border border-outline rounded-sm shadow-sm p-6 space-y-6">
      <h2 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
        <span className="h-px w-4 bg-primary" />
        Thông Tin Quản Trị
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Trạng thái</p>
          <div className="flex items-center gap-2">
            <span className={clsx(
              'h-2.5 w-2.5 rounded-full shadow-sm',
              isActive ? 'bg-green-500 shadow-green-500/50' : 'bg-stone-400',
            )} />
            <span className={clsx(
              'text-sm font-bold',
              isActive ? 'text-green-700' : 'text-stone-500',
            )}>
              {isActive ? 'Đang hoạt động' : 'Vô hiệu hóa'}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted flex items-center gap-1">
            <Users className="h-3 w-3" /> Tổng tài khoản
          </p>
          <p className="text-sm font-bold text-foreground">{church.user_count}</p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Ngày khởi tạo
          </p>
          <p className="text-sm text-foreground">{formatDate(church.created_at)}</p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted flex items-center gap-1">
            <Clock className="h-3 w-3" /> Lần sao lưu cuối
          </p>
          <p className="text-sm text-foreground">{formatDateTime(church.last_backup_at)}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-outline/50">
        <button
          id="btn-toggle-status"
          onClick={onToggleStatus}
          className={clsx(
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm font-bold transition-all duration-200 min-h-[48px]',
            isActive
              ? 'border border-red-200 text-red-600 hover:bg-red-50'
              : 'border border-green-200 text-green-600 hover:bg-green-50',
          )}
        >
          {isActive ? (
            <>
              <ShieldOff className="h-4 w-4" />
              Vô hiệu hóa giáo xứ
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              Kích hoạt giáo xứ
            </>
          )}
        </button>
      </div>
    </section>
  );
}

// ─── Backup Health Panel ───────────────────────────────────────────────────────────────

function BackupHealthPanel({ churchId, lastBackupAt }: { churchId: string; lastBackupAt: string | null }) {
  const backupMutation = useTriggerChurchBackupMutation(churchId);

  const [backupAgeDays, setBackupAgeDays] = useState<number | null>(null);

  useEffect(() => {
    if (!lastBackupAt) {
      setBackupAgeDays(null);
      return;
    }
    const ageMs = Date.now() - new Date(lastBackupAt).getTime();
    setBackupAgeDays(Math.floor(ageMs / (1000 * 60 * 60 * 24)));
  }, [lastBackupAt]);

  let healthColor = 'bg-green-500';
  let healthLabel = 'Tốt';
  let healthBg = 'bg-green-50 border-green-100';
  let healthText = 'text-green-700';

  if (backupAgeDays === null) {
    healthColor = 'bg-stone-400';
    healthLabel = 'Chưa có sao lưu';
    healthBg = 'bg-stone-100 border-stone-200';
    healthText = 'text-stone-500';
  } else if (backupAgeDays > 7) {
    healthColor = 'bg-red-500';
    healthLabel = 'Cần sao lưu ngay';
    healthBg = 'bg-red-50 border-red-100';
    healthText = 'text-red-700';
  } else if (backupAgeDays > 3) {
    healthColor = 'bg-amber-400';
    healthLabel = 'Nên sao lưu sớm';
    healthBg = 'bg-amber-50 border-amber-100';
    healthText = 'text-amber-700';
  }

  return (
    <section className={clsx('border rounded-sm p-6 space-y-4', healthBg)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
          <span className="h-px w-4 bg-primary" />
          Tình Trạng Sao Lưu
        </h2>
        <div className="flex items-center gap-2">
          <span className={clsx('h-2.5 w-2.5 rounded-full', healthColor)} />
          <span className={clsx('text-[11px] font-bold uppercase tracking-wider', healthText)}>{healthLabel}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted flex items-center gap-1">
            <Clock className="h-3 w-3" /> Lần sao lưu gần nhất
          </p>
          <p className="text-sm font-medium text-foreground">
            {lastBackupAt
              ? `${formatDateTime(lastBackupAt)} (${backupAgeDays === 0 ? 'hôm nay' : `${backupAgeDays} ngày trước`})`
              : 'Chưa có bản sao lưu nào'}
          </p>
        </div>

        <button
          id="btn-trigger-backup"
          onClick={() => backupMutation.mutate()}
          disabled={backupMutation.isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[48px] rounded-sm bg-white border border-outline text-sm font-bold text-foreground hover:bg-hover-bg transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {backupMutation.isPending ? (
            <span className="animate-pulse">Đang kích hoạt...</span>
          ) : (
            <>
              <Clock className="h-4 w-4" />
              Sao lưu ngay
            </>
          )}
        </button>
      </div>

      {backupAgeDays !== null && backupAgeDays > 7 && (
        <p className="text-xs text-red-700 bg-red-100/60 border border-red-200 rounded-sm px-3 py-2">
          ⚠ Đã quá <strong>{backupAgeDays} ngày</strong> kể từ lần sao lưu cuối. Hãy sao lưu ngay để bảo vệ dữ liệu.
        </p>
      )}
    </section>
  );
}

// ─── Main Client Page ─────────────────────────────────────────────────────────

interface Props {
  id: string;
}

type FormState = {
  name: string;
  diocese: string;
  deanery: string;
  pastor_name: string;
  address: string;
  phone_number: string;
  patron_saint: string;
  established_year: string;
  schema_name: string;
};

function buildFormState(church: ChurchDetail): FormState {
  return {
    name: church.name ?? '',
    diocese: church.diocese ?? '',
    deanery: church.deanery ?? '',
    pastor_name: church.pastor_name ?? '',
    address: church.address ?? '',
    phone_number: church.phone_number ?? '',
    patron_saint: church.patron_saint ?? '',
    established_year: church.established_year?.toString() ?? '',
    schema_name: church.schema_name ?? '',
  };
}

export default function ChurchDetailClientPage({ id }: Props) {
  const { data: church, isLoading, error } = useChurchDetailQuery(id);
  const updateMutation = useUpdateChurchMutation(id);
  const toggleStatusMutation = useToggleChurchStatusMutation(id);

  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState<FormState | null>(() => (church ? buildFormState(church) : null));
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  // Sync form state from server data (only when not editing)
  const lastSyncRef = useRef<string>('');
  useEffect(() => {
    if (church && !isEditing) {
      const syncKey = church.id + isEditing + church.updated_at;
      if (lastSyncRef.current !== syncKey) {
        setFormState(buildFormState(church));
        lastSyncRef.current = syncKey;
      }
    }
  }, [church, isEditing]);

  const isDirty = useMemo(() => {
    if (!church || !formState) return false;
    const original = buildFormState(church);
    return (Object.keys(original) as (keyof FormState)[]).some(
      (key) => formState[key] !== original[key],
    );
  }, [church, formState]);

  const handleFieldChange = useCallback(
    (name: keyof UpdateChurchRequest | 'established_year' | 'schema_name', value: string) => {
      setFormState((prev) => (prev ? { ...prev, [name]: value } : prev));
    },
    [],
  );

  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    if (church) setFormState(buildFormState(church));
    setIsEditing(false);
  }, [church]);

  const handleSave = useCallback(async () => {
    if (!formState) return;
    const payload: UpdateChurchRequest = {
      name: formState.name || undefined,
      address: formState.address || undefined,
      phone_number: formState.phone_number || undefined,
      diocese: formState.diocese || undefined,
      deanery: formState.deanery || undefined,
      pastor_name: formState.pastor_name || undefined,
      patron_saint: formState.patron_saint || undefined,
      established_year: formState.established_year
        ? parseInt(formState.established_year, 10)
        : undefined,
    };
    try {
      await updateMutation.mutateAsync(payload);
      setIsEditing(false);
    } catch {
      // toast already shown by mutation onError
    }
  }, [formState, updateMutation]);

  const handleToggleStatusConfirm = useCallback(async () => {
    if (!church) return;
    const nextStatus = church.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await toggleStatusMutation.mutateAsync({ status: nextStatus });
      setShowStatusDialog(false);
    } catch {
      // toast already shown
    }
  }, [church, toggleStatusMutation]);

  if (isLoading || !formState) {
    return <DetailPageSkeleton />;
  }

  if (error || !church) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Building2 className="h-12 w-12 text-muted/40" />
        <p className="text-muted font-medium italic">Không tìm thấy giáo xứ hoặc đã có lỗi xảy ra.</p>
        <Link
          href="/super-admin/dashboard/churches"
          className="text-sm text-primary hover:underline font-medium"
        >
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  const isActive = church.status === 'ACTIVE';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-28">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted">
        <Link
          href="/super-admin/dashboard/churches"
          className="hover:text-primary transition-colors font-medium"
        >
          Quản trị Giáo xứ
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium truncate max-w-[200px]">{church.name}</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-3">
      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">{church.name}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary uppercase tracking-wider bg-primary/5 px-2.5 py-1 rounded">
              <Globe className="h-3 w-3" />
              {church.schema_name}
            </div>
            <div className={clsx(
              'flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider',
              isActive ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-stone-500',
            )}>
              <span className={clsx('h-2 w-2 rounded-full', isActive ? 'bg-green-500' : 'bg-stone-400')} />
              {isActive ? 'Đang hoạt động' : 'Vô hiệu hóa'}
            </div>
          </div>
        </div>

        <button
          id="btn-edit-church"
          onClick={handleStartEdit}
          disabled={isEditing}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm border border-outline bg-white text-sm font-bold text-foreground hover:bg-hover-bg transition-colors min-h-[48px] disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          <Pencil className="h-4 w-4" />
          Chỉnh sửa
        </button>
      </div>

      {/* Section 1: General Info */}
      <section className="bg-white border border-outline rounded-sm shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline">
          <h2 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
            <span className="h-px w-4 bg-primary" />
            Thông Tin Cơ Bản
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Tên Giáo Xứ"
              name="name"
              value={formState.name}
              isEditing={isEditing}
              onChange={handleFieldChange}
            />
            <FormField
              label="Giáo Phận"
              name="diocese"
              value={formState.diocese}
              isEditing={isEditing}
              onChange={handleFieldChange}
            />
            <FormField
              label="Giáo Hạt"
              name="deanery"
              value={formState.deanery}
              isEditing={isEditing}
              onChange={handleFieldChange}
            />
            <FormField
              label="Chánh Xứ Hiện Tại"
              name="pastor_name"
              value={formState.pastor_name}
              isEditing={isEditing}
              onChange={handleFieldChange}
            />
            {/* Full-width address */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Địa Chỉ</label>
              <input
                type="text"
                value={formState.address}
                readOnly={!isEditing}
                onChange={(e) => handleFieldChange('address', e.target.value)}
                className={clsx(
                  'w-full px-3 py-2 text-sm border rounded-sm transition-all duration-200 outline-none',
                  !isEditing
                    ? 'bg-vellum/60 border-outline/40 text-muted cursor-default'
                    : 'bg-white border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground',
                )}
              />
            </div>
            <FormField
              label="Số Điện Thoại"
              name="phone_number"
              value={formState.phone_number}
              isEditing={isEditing}
              onChange={handleFieldChange}
            />
            <FormField
              label="Bổn Mạng"
              name="patron_saint"
              value={formState.patron_saint}
              isEditing={isEditing}
              onChange={handleFieldChange}
            />
            <FormField
              label="Năm Thành Lập"
              name="established_year"
              value={formState.established_year}
              type="number"
              isEditing={isEditing}
              onChange={handleFieldChange}
            />
            <FormField
              label="Schema Name"
              name="schema_name"
              value={formState.schema_name}
              readOnly
              isEditing={isEditing}
              onChange={handleFieldChange}
            />
          </div>
        </div>
      </section>

      {/* Section 2: Management Info */}
      <ManagementPanel church={church} onToggleStatus={() => setShowStatusDialog(true)} />

      {/* Section 3: Backup Health */}
      <BackupHealthPanel churchId={id} lastBackupAt={church.last_backup_at} />

      {/* Section 4: Admin Accounts */}
      <AdminAccountsTable church={church} />

      {/* Sticky Footer (visible when dirty) */}
      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-outline bg-white/95 backdrop-blur-sm shadow-[0_-4px_24px_rgba(0,0,0,0.08)] animate-in slide-in-from-bottom duration-300">
          <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted">
              {isDirty && (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="italic">Có thay đổi chưa được lưu</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                id="btn-cancel-edit"
                onClick={handleCancelEdit}
                disabled={updateMutation.isPending}
                className="flex-1 sm:flex-none min-h-[48px] px-6 rounded-sm border border-outline bg-white text-sm font-bold text-foreground hover:bg-hover-bg transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                id="btn-save-church"
                onClick={handleSave}
                disabled={!isDirty || updateMutation.isPending}
                className="flex-[2] sm:flex-none inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-sm bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending ? (
                  <span className="animate-pulse">Đang lưu...</span>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Toggle Dialog */}
      {showStatusDialog && (
        <StatusToggleDialog
          currentStatus={church.status}
          churchName={church.name}
          onConfirm={handleToggleStatusConfirm}
          onCancel={() => setShowStatusDialog(false)}
          isLoading={toggleStatusMutation.isPending}
        />
      )}
    </div>
  );
}
