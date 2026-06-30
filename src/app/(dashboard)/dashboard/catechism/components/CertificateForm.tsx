'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Edit2, Trash2, Printer, Check, X, Loader2, MoreVertical } from 'lucide-react';
import { ParishionerSearchCombobox } from '@/components/ui/ParishionerSearchCombobox';
import { DatePicker } from '@/components/dashboard/shared/DatePicker';
import { SaintNameSelect } from '@/components/dashboard/shared/SaintNameSelect';
import CertificateBusinessNotes from './CertificateBusinessNotes';
import { CertificateType } from '@/types/catechism';
import { useAuth } from '@/components/providers/auth-provider';
import { useCatechismDetailQuery } from '../queries/useCatechismQuery';
import { useCreateCatechism, useUpdateCatechism, useDeleteCatechism } from '../queries/useCatechismMutations';
import { useParishQuery } from '@/lib/queries/useSettingsQueries';
import { PrintableCatechismCertificate } from './PrintableCatechismCertificate';

interface CertificateFormProps {
  mode: 'create' | 'edit';
  id?: string;
}

interface FormState {
  is_outsider: boolean;
  parishioner_id: string | null;
  outsider_christian_name: string;
  outsider_name: string;
  outsider_birth_date: string;
  outsider_gender: string;
  outsider_parish_name: string;
  certificate_type: CertificateType | '';
  issue_date: string;
  certificate_no: string;
  issued_by: string;
}

interface FormErrors {
  parishioner_id?: string;
  outsider_name?: string;
  outsider_birth_date?: string;
  certificate_type?: string;
  issue_date?: string;
  issued_by?: string;
  _form?: string;
}


export function CertificateForm({
  mode,
  id,
}: CertificateFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  const parishName = user?.church_name 
    ? (user.church_name.toLowerCase().startsWith('giáo xứ') ? user.church_name : `Giáo xứ ${user.church_name}`) 
    : '';
  const isAdmin = user?.role === 'ADMIN';
  const isViewer = user?.role === 'VIEWER';

  const { data: initialData, isLoading: isLoadingDetail } = useCatechismDetailQuery(id || '');
  const { data: parishResponse } = useParishQuery(mode === 'edit' && !!initialData);
  const parishInfo = parishResponse?.data;

  const createMutation = useCreateCatechism();
  const updateMutation = useUpdateCatechism(id || '');
  const deleteMutation = useDeleteCatechism();

  const [form, setForm] = useState<FormState & { parishioner_name?: string }>({
    is_outsider: false,
    parishioner_id: null,
    outsider_christian_name: '',
    outsider_name: '',
    outsider_birth_date: '',
    outsider_gender: '',
    outsider_parish_name: '',
    certificate_type: '',
    issue_date: '',
    certificate_no: '',
    issued_by: parishName,
    parishioner_name: '',
  });

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        is_outsider: initialData.is_outsider ?? false,
        parishioner_id: initialData.parishioner?.id ?? null,
        outsider_christian_name: initialData.outsider_christian_name ?? '',
        outsider_name: initialData.outsider_name ?? '',
        outsider_birth_date: initialData.outsider_birth_date
          ? initialData.outsider_birth_date.slice(0, 10)
          : '',
        outsider_gender: initialData.outsider_gender ?? '',
        outsider_parish_name: initialData.outsider_parish_name ?? '',
        certificate_type: initialData.certificate_type ?? '',
        issue_date: initialData.issue_date
          ? initialData.issue_date.slice(0, 10)
          : '',
        certificate_no: initialData.certificate_no ?? '',
        issued_by: initialData.issued_by ?? parishName,
        parishioner_name: initialData.parishioner
          ? `${initialData.parishioner.christian_name} ${initialData.parishioner.full_name}`
          : '',
      });
    }
  }, [initialData, mode, parishName]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isEditing, setIsEditing] = useState(mode === 'create');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Unused canWrite removed

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.is_outsider) {
      if (!form.parishioner_id) newErrors.parishioner_id = 'Vui lòng chọn giáo dân.';
    } else {
      if (!form.outsider_name.trim()) newErrors.outsider_name = 'Vui lòng nhập họ và tên.';
      if (form.outsider_birth_date) {
        const birthDate = new Date(form.outsider_birth_date);
        const year = birthDate.getFullYear();
        if (isNaN(birthDate.getTime()) || year < 1900 || year > new Date().getFullYear()) {
          newErrors.outsider_birth_date = 'Ngày sinh không hợp lệ.';
        }
      }
    }
    if (!form.certificate_type) newErrors.certificate_type = 'Vui lòng chọn loại chứng chỉ.';
    if (!form.issue_date) newErrors.issue_date = 'Vui lòng chọn ngày cấp.';
    if (!form.issued_by.trim()) newErrors.issued_by = 'Vui lòng nhập nơi cấp.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setErrors({});

    const payload = {
      is_outsider: form.is_outsider,
      parishioner_id: form.is_outsider ? null : form.parishioner_id,
      outsider_christian_name: form.is_outsider ? (form.outsider_christian_name.trim() || null) : null,
      outsider_name: form.is_outsider ? (form.outsider_name.trim() || null) : null,
      outsider_birth_date: form.is_outsider && form.outsider_birth_date ? form.outsider_birth_date : null,
      outsider_gender: form.is_outsider ? (form.outsider_gender.trim() || null) : null,
      outsider_parish_name: form.is_outsider ? (form.outsider_parish_name.trim() || null) : null,
      certificate_type: form.certificate_type,
      issue_date: form.issue_date,
      issued_by: form.issued_by.trim(),
      certificate_no: form.certificate_no.trim() || null,
    };

    try {
      if (mode === 'edit') {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }

      const successMsg =
        mode === 'edit'
          ? 'Cập nhật chứng chỉ thành công.'
          : 'Ghi nhận chứng chỉ Giáo lý thành công.';
      showToast('success', successMsg);

      setTimeout(() => {
        router.push('/dashboard/catechism');
        router.refresh();
      }, 1200);
    } catch (err: unknown) {
      const error = err as Error & { status?: number };
      if (error.status === 409) {
        const typeLabel = form.certificate_type === 'RCIA' ? 'RCIA' : 'Hôn nhân';
        showToast('error', `Giáo dân này đã có chứng chỉ ${typeLabel} trong hệ thống.`);
      } else {
        showToast('error', error.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại.');
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id!);
      showToast('success', 'Đã xóa chứng chỉ thành công.');
      setTimeout(() => {
        router.push('/dashboard/catechism');
        router.refresh();
      }, 1200);
    } catch {
      showToast('error', 'Không thể xóa chứng chỉ. Vui lòng thử lại.');
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;
  const disabled = isViewer || !isEditing || isSubmitting;

  if (mode === 'edit' && isLoadingDetail) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (mode === 'edit' && !isEditing && initialData) {
    const certTypeLabel =
      initialData.certificate_type === 'RCIA'
        ? 'Giáo lý Dự tòng (RCIA)'
        : 'Giáo lý Hôn nhân';

    const personName = initialData.is_outsider
      ? `${initialData.outsider_christian_name || ''} ${initialData.outsider_name || ''}`.trim()
      : `${initialData.parishioner?.christian_name || ''} ${initialData.parishioner?.full_name || ''}`.trim();

    return (
      <>
        {toast && (
          <div
            className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-5 py-3 rounded-sm shadow-xl text-sm font-medium font-body transition-all ${
              toast.type === 'success'
                ? 'bg-[#166534] text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            {toast.message}
          </div>
        )}

        {showDeleteDialog && (
          <>
            <div
              className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-[2px]"
              onClick={() => !isDeleting && setShowDeleteDialog(false)}
              aria-hidden="true"
            />
            <div
              role="alertdialog"
              aria-modal="true"
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-surface border border-outline rounded-sm shadow-2xl p-6"
            >
              <h3 className="font-display font-bold text-lg text-on-surface mb-2">
                Xác nhận xóa chứng chỉ
              </h3>
              <p className="text-sm text-on-surface-variant font-body mb-6">
                Bạn có chắc muốn xóa chứng chỉ này? Hành động này không thể hoàn tác.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={isDeleting}
                  className="px-4 h-10 border border-outline text-on-surface-variant text-sm font-medium rounded-sm hover:bg-surface-hover transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 h-10 bg-red-600 text-white text-sm font-bold rounded-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting && (
                    <span className="material-symbols-outlined animate-spin text-sm">autorenew</span>
                  )}
                  Xóa chứng chỉ
                </button>
              </div>
            </div>
          </>
        )}

        {/* Breadcrumb + Header – hidden on print */}
        <div className="print:hidden">
          <nav className="flex items-center gap-2 text-sm font-body text-on-surface-variant mb-6">
            <Link
              href="/dashboard/catechism"
              className="hover:text-primary transition-colors focus-visible:ring-1 focus-visible:ring-primary rounded outline-none"
            >
              Chứng chỉ
            </Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-on-surface font-medium truncate max-w-[200px]">Chi tiết</span>
          </nav>

          <div className="mb-8">
            <h1 className="text-[28px] md:text-4xl font-display font-bold text-on-surface mb-1">
              Chi tiết Chứng chỉ
            </h1>
            <p className="text-on-surface-variant font-body text-sm">
              Hồ sơ chứng chỉ của: <span className="font-bold">{personName || '—'}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start print:hidden">
          <div className="flex-1 space-y-6 w-full min-w-0">
            {/* Merged Info Card */}
            <div className="bg-surface border border-outline rounded-sm p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">
                    NGƯỜI LÃNH NHẬN
                  </span>
                  {initialData.is_outsider ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        {initialData.outsider_christian_name && (
                          <span className="text-sm font-bold text-primary block">
                            {initialData.outsider_christian_name}
                          </span>
                        )}
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
                          Người ngoài xứ
                        </span>
                      </div>
                      <h2 className="font-display font-bold text-2xl md:text-3xl text-on-surface mt-0.5">
                        {initialData.outsider_name}
                      </h2>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-bold text-primary block">
                        {initialData.parishioner?.christian_name || '—'}
                      </span>
                      <h2 className="font-display font-bold text-2xl md:text-3xl text-on-surface mt-0.5">
                        {initialData.parishioner?.full_name || '—'}
                      </h2>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!isViewer && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center justify-center gap-2 px-5 h-10 bg-primary text-white text-sm font-bold rounded-sm hover:bg-primary/90 transition-all focus-visible:ring-2 focus-visible:ring-primary outline-none shadow-sm active:scale-95"
                    >
                      <Edit2 className="h-4 w-4" />
                      Chỉnh sửa
                    </button>
                  )}
                  {isAdmin && (
                    <div className="relative shrink-0" ref={menuRef}>
                      <button
                        type="button"
                        onClick={() => setIsMenuOpen((o) => !o)}
                        className={`flex items-center justify-center p-2 h-10 w-10 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          isMenuOpen
                            ? 'bg-hover-bg text-foreground'
                            : 'text-muted hover:bg-hover-bg hover:text-foreground'
                        }`}
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-outline rounded shadow-lg overflow-hidden z-20">
                          <button
                            type="button"
                            onClick={() => {
                              setIsMenuOpen(false);
                              setShowDeleteDialog(true);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left font-medium"
                          >
                            <Trash2 className="h-4 w-4 shrink-0" />
                            Xóa chứng chỉ
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-outline/50">
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest block mb-1">
                    Ngày sinh
                  </span>
                  <span className="text-sm font-body font-medium text-on-surface">
                    {initialData.is_outsider 
                      ? initialData.outsider_birth_date ? new Date(initialData.outsider_birth_date).toLocaleDateString('vi-VN') : '—'
                      : initialData.parishioner?.birth_date ? new Date(initialData.parishioner.birth_date).toLocaleDateString('vi-VN') : '—'}
                  </span>
                </div>
                {initialData.is_outsider && (
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest block mb-1">Giới tính</span>
                    <span className="text-sm font-body font-medium text-on-surface">
                      {initialData.outsider_gender || '—'}
                    </span>
                  </div>
                )}
                {initialData.is_outsider && (
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest block mb-1">Giáo xứ gốc</span>
                    <span className="text-sm font-body font-medium text-on-surface">
                      {initialData.outsider_parish_name || '—'}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest block mb-1">LOẠI CHỨNG CHỈ</span>
                  <span className="text-sm font-body font-bold text-primary">
                    {certTypeLabel}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest block mb-1">NGÀY CẤP</span>
                  <span className="text-sm font-body font-medium text-on-surface">
                    {initialData.issue_date ? new Date(initialData.issue_date).toLocaleDateString('vi-VN') : '—'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest block mb-1">SỐ HIỆU CHỨNG CHỈ</span>
                  <span className="text-sm font-mono font-bold text-on-surface">
                    {initialData.certificate_no || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest block mb-1">NƠI CẤP</span>
                  <span className="text-sm font-body font-medium text-on-surface">
                    {initialData.issued_by}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-96 shrink-0 space-y-4 print:hidden">
            <CertificateBusinessNotes />
          </div>
        </div>

        {/* Full Width Certificate Section */}
        {initialData && (
          <div className="mt-8 space-y-6">
            <div className="bg-surface border border-outline rounded-md md:rounded-sm p-0 md:p-6 pb-0 overflow-hidden print:border-0 print:p-0 print:bg-transparent">
              <div className="px-4 py-3 md:pt-0 md:px-0 flex items-center justify-between border-b border-outline md:border-b-0 md:mb-6 print:hidden">
                <div className="flex items-center gap-2">
                  <Printer className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">
                    Mẫu In Chứng Chỉ (A4)
                  </h3>
                </div>
                <button
                  onClick={() => window.print()}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-sm font-bold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4" /> IN CHỨNG CHỈ (A4)
                </button>
              </div>

              <div className="bg-[#E7E5E4]/30 p-4 md:p-12 flex justify-center overflow-x-auto min-h-[600px] print:bg-transparent print:p-0 print:min-h-0">
                <div className="shadow-2xl hover:shadow-primary/10 transition-shadow print:shadow-none">
                  <PrintableCatechismCertificate
                    certificate={initialData}
                    parishInfo={parishInfo}
                  />
                </div>
              </div>

              <div className="bg-on-surface px-6 py-3 flex items-center justify-between text-surface print:hidden">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80 italic">
                    Mẫu phôi chuẩn A4
                  </span>
                  <div className="h-4 w-[1px] bg-surface/20"></div>
                  <span className="text-[10px] opacity-60">
                    Vui lòng kiểm tra kỹ thông tin trước khi in ấn thực tế.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* Breadcrumb + Header for create/edit form mode – hidden on print */}
      <div className="print:hidden">
        <nav className="flex items-center gap-2 text-sm font-body text-on-surface-variant mb-6">
          <Link
            href="/dashboard/catechism"
            className="hover:text-primary transition-colors focus-visible:ring-1 focus-visible:ring-primary rounded outline-none"
          >
            Chứng chỉ
          </Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface font-medium truncate max-w-[200px]">
            {mode === 'create' ? 'Ghi nhận mới' : 'Chỉnh sửa'}
          </span>
        </nav>

        <div className="mb-8">
          <h1 className="text-[28px] md:text-4xl font-display font-bold text-on-surface mb-1">
            {mode === 'create' ? 'Ghi nhận Chứng chỉ' : 'Chỉnh sửa Chứng chỉ'}
          </h1>
          <p className="text-on-surface-variant font-body text-sm">
            {mode === 'create' ? 'Điền đầy đủ thông tin để lưu chứng chỉ mới.' : 'Cập nhật thông tin chứng chỉ.'}
          </p>
        </div>
      </div>
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-5 py-3 rounded-sm shadow-xl text-sm font-medium font-body transition-all ${
            toast.type === 'success'
              ? 'bg-[#166534] text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          <span className="material-symbols-outlined text-sm">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {toast.message}
        </div>
      )}

      {showDeleteDialog && (
        <>
          <div
            className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-[2px]"
            onClick={() => !isDeleting && setShowDeleteDialog(false)}
            aria-hidden="true"
          />
          <div
            role="alertdialog"
            aria-modal="true"
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-surface border border-outline rounded-sm shadow-2xl p-6"
          >
            <h3 className="font-display font-bold text-lg text-on-surface mb-2">
              Xác nhận xóa chứng chỉ
            </h3>
            <p className="text-sm text-on-surface-variant font-body mb-6">
              Bạn có chắc muốn xóa chứng chỉ này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="px-4 h-10 border border-outline text-on-surface-variant text-sm font-medium rounded-sm hover:bg-surface-hover transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 h-10 bg-red-600 text-white text-sm font-bold rounded-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && (
                  <span className="material-symbols-outlined animate-spin text-sm">autorenew</span>
                )}
                Xóa chứng chỉ
              </button>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start print:hidden">
        <form
          onSubmit={handleSubmit}
          className="flex-1 bg-surface border border-outline rounded-sm p-6 md:p-8 min-w-0"
        >
          {/* Switch Object */}
          <div className="mb-6">
            <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Đối Tượng Nhận Chứng Chỉ <span className="text-primary">*</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (disabled) return;
                  setForm((prev) => ({ ...prev, is_outsider: false }));
                }}
                disabled={disabled}
                className={`flex-1 py-2.5 px-4 text-sm font-bold border rounded-sm transition-all text-center ${
                  !form.is_outsider
                    ? 'bg-primary border-primary text-white shadow-sm'
                    : 'bg-surface border-outline text-on-surface-variant hover:bg-surface-hover'
                } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                Giáo dân trong xứ
              </button>
              <button
                type="button"
                onClick={() => {
                  if (disabled) return;
                  setForm((prev) => ({ ...prev, is_outsider: true }));
                }}
                disabled={disabled}
                className={`flex-1 py-2.5 px-4 text-sm font-bold border rounded-sm transition-all text-center ${
                  form.is_outsider
                    ? 'bg-primary border-primary text-white shadow-sm'
                    : 'bg-surface border-outline text-on-surface-variant hover:bg-surface-hover'
                } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                Người ngoài xứ
              </button>
            </div>
          </div>

          {!form.is_outsider ? (
            <div className="mb-6">
              <ParishionerSearchCombobox
                label="NGƯỜI LÃNH NHẬN"
                value={form.parishioner_id || ''}
                onChange={(id, item) => {
                  setForm((prev) => ({ 
                    ...prev, 
                    parishioner_id: id || null,
                    parishioner_name: item ? `${item.christian_name} ${item.full_name}` : ''
                  }));
                  if (errors.parishioner_id) setErrors((e) => ({ ...e, parishioner_id: undefined }));
                }}
                placeholder="Tìm kiếm tên hoặc mã số giáo dân..."
                error={errors.parishioner_id}
                disabled={disabled}
                initialSelected={
                  initialData?.parishioner
                    ? {
                        id: initialData.parishioner.id,
                        christian_name: initialData.parishioner.christian_name,
                        full_name: initialData.parishioner.full_name,
                        birth_date: initialData.parishioner.birth_date,
                      }
                    : undefined
                }
              />
              {!errors.parishioner_id && (
                <p className="text-[11px] text-on-surface-variant font-body mt-1 flex items-center gap-1">
                  <Lock className="h-3 w-3 shrink-0" />
                  Hệ thống sẽ tự động đối soát thông tin cá nhân.
                </p>
              )}
            </div>
          ) : (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-5 border border-outline/50 p-4 rounded bg-stone-50/50">
              <SaintNameSelect
                value={form.outsider_christian_name}
                onChange={(val) => setForm((prev) => ({ ...prev, outsider_christian_name: val }))}
                gender={form.outsider_gender === 'Nam' ? 'MALE' : form.outsider_gender === 'Nữ' ? 'FEMALE' : undefined}
                disabled={disabled}
                label="Tên Thánh"
                className="w-full"
              />

              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                  Họ và tên <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={form.outsider_name}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, outsider_name: e.target.value }));
                    if (errors.outsider_name) setErrors((er) => ({ ...er, outsider_name: undefined }));
                  }}
                  disabled={disabled}
                  placeholder="Họ và tên người ngoài xứ"
                  className={`w-full px-3 py-3 bg-surface border rounded-sm outline-none text-sm font-body text-on-surface placeholder:text-on-surface-variant transition-all focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.outsider_name
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-outline focus:ring-primary'
                  } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                />
                {errors.outsider_name && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.outsider_name}</p>
                )}
              </div>

              <DatePicker
                label="Ngày sinh"
                value={form.outsider_birth_date}
                onChange={(val) => {
                  setForm((prev) => ({ ...prev, outsider_birth_date: val }));
                  if (errors.outsider_birth_date) setErrors((er) => ({ ...er, outsider_birth_date: undefined }));
                }}
                disabled={disabled}
                error={errors.outsider_birth_date}
                className="w-full"
              />

              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                  Giới tính
                </label>
                <select
                  value={form.outsider_gender}
                  onChange={(e) => setForm((prev) => ({ ...prev, outsider_gender: e.target.value }))}
                  disabled={disabled}
                  className={`w-full px-3 py-3 bg-surface border border-outline rounded-sm outline-none text-sm font-body text-on-surface transition-all focus:ring-2 focus:ring-primary focus:border-transparent appearance-none cursor-pointer ${
                    disabled ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                  Giáo xứ gốc
                </label>
                <input
                  type="text"
                  value={form.outsider_parish_name}
                  onChange={(e) => setForm((prev) => ({ ...prev, outsider_parish_name: e.target.value }))}
                  disabled={disabled}
                  placeholder="VD: Giáo xứ Tân Định"
                  className={`w-full px-3 py-3 bg-surface border border-outline rounded-sm outline-none text-sm font-body text-on-surface placeholder:text-on-surface-variant transition-all focus:ring-2 focus:ring-primary focus:border-transparent ${
                    disabled ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                />
              </div>
            </div>
          )}


          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                Loại Chứng Chỉ <span className="text-primary">*</span>
              </label>
              <select
                value={form.certificate_type}
                onChange={(e) => {
                  setForm((prev) => ({
                    ...prev,
                    certificate_type: e.target.value as CertificateType | '',
                  }));
                  if (errors.certificate_type)
                    setErrors((er) => ({ ...er, certificate_type: undefined }));
                }}
                disabled={disabled}
                className={`w-full px-3 py-3 bg-surface border rounded-sm outline-none text-sm font-body text-on-surface transition-all focus:ring-2 focus:border-transparent appearance-none cursor-pointer ${
                  errors.certificate_type
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-outline focus:ring-primary'
                } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <option value="">Chọn loại chứng chỉ</option>
                <option value="RCIA">Giáo lý Dự tòng (RCIA)</option>
                <option value="MARRIAGE_PREP">Giáo lý Hôn nhân</option>
              </select>
              {errors.certificate_type && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.certificate_type}</p>
              )}
            </div>

            <DatePicker
              label="Ngày Cấp"
              required
              value={form.issue_date}
              onChange={(val) => {
                setForm((prev) => ({ ...prev, issue_date: val }));
                if (errors.issue_date) setErrors((er) => ({ ...er, issue_date: undefined }));
              }}
              disabled={disabled}
              error={errors.issue_date}
              className="w-full"
            />

            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                Số Hiệu Chứng Chỉ
              </label>
              <input
                type="text"
                value={form.certificate_no}
                onChange={(e) => setForm((prev) => ({ ...prev, certificate_no: e.target.value }))}
                disabled={disabled}
                placeholder="VD: 2024/CC-HN-001"
                className={`w-full px-3 py-3 bg-surface border border-outline rounded-sm outline-none text-sm font-body text-on-surface placeholder:text-on-surface-variant transition-all focus:ring-2 focus:ring-primary focus:border-transparent ${
                  disabled ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                Nơi Cấp <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                value={form.issued_by}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, issued_by: e.target.value }));
                  if (errors.issued_by) setErrors((er) => ({ ...er, issued_by: undefined }));
                }}
                disabled={disabled}
                placeholder="Tên giáo xứ cấp chứng chỉ"
                className={`w-full px-3 py-3 bg-surface border rounded-sm outline-none text-sm font-body text-on-surface placeholder:text-on-surface-variant transition-all focus:ring-2 focus:border-transparent ${
                  errors.issued_by
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-outline focus:ring-primary'
                } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
              {errors.issued_by && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.issued_by}</p>
              )}
            </div>
          </div>

          {errors._form && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-600 font-body">
              {errors._form}
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-8 pt-6 border-t border-outline">
            {!isEditing ? (
              <>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  {!isViewer && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center justify-center gap-2 px-6 h-12 bg-primary text-white text-sm font-bold rounded-sm hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-primary outline-none shadow-sm"
                    >
                      <Edit2 className="h-4 w-4" />
                      Chỉnh sửa
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteDialog(true)}
                      className="flex items-center justify-center gap-2 px-4 h-12 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors rounded-sm outline-none"
                    >
                      <Trash2 className="h-4 w-4" />
                      Xóa
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 h-12 bg-primary text-white text-sm font-bold rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Lưu thay đổi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (mode === 'create') {
                        router.push('/dashboard/catechism');
                      } else {
                        setIsEditing(false);
                        if (initialData) {
                          setForm({
                            is_outsider: initialData.is_outsider ?? false,
                            parishioner_id: initialData.parishioner?.id ?? null,
                            outsider_christian_name: initialData.outsider_christian_name ?? '',
                            outsider_name: initialData.outsider_name ?? '',
                            outsider_birth_date: initialData.outsider_birth_date
                              ? initialData.outsider_birth_date.slice(0, 10)
                              : '',
                            outsider_gender: initialData.outsider_gender ?? '',
                            outsider_parish_name: initialData.outsider_parish_name ?? '',
                            certificate_type: initialData.certificate_type ?? '',
                            issue_date: initialData.issue_date
                              ? initialData.issue_date.slice(0, 10)
                              : '',
                            certificate_no: initialData.certificate_no ?? '',
                            issued_by: initialData.issued_by ?? parishName,
                            parishioner_name: initialData.parishioner
                              ? `${initialData.parishioner.christian_name} ${initialData.parishioner.full_name}`
                              : '',
                          });
                        }
                        setErrors({});
                      }
                    }}
                    disabled={isSubmitting}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 h-12 border border-outline text-on-surface-variant text-sm font-medium rounded-sm hover:bg-surface-hover transition-colors disabled:opacity-50 outline-none"
                  >
                    <X className="h-4 w-4" />
                    Hủy
                  </button>
                </div>
              </>
            )}
          </div>

          {isViewer && !isEditing && (
            <p className="mt-4 text-xs text-on-surface-variant font-body text-center italic">
              Bạn đang ở chế độ xem. Liên hệ Quản trị viên để chỉnh sửa.
            </p>
          )}
        </form>

        <div className="w-full lg:w-96 shrink-0 space-y-4 print:hidden">
          <CertificateBusinessNotes />
        </div>
      </div>

      {/* Full Width Certificate Section */}
      {mode === 'edit' && !isEditing && initialData && (
        <div className="mt-8 space-y-6">
          <div className="bg-surface border border-outline rounded-md md:rounded-sm p-0 md:p-6 pb-0 overflow-hidden print:border-0 print:p-0 print:bg-transparent">
            <div className="px-4 py-3 md:pt-0 md:px-0 flex items-center justify-between border-b border-outline md:border-b-0 md:mb-6 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">
                  Mẫu In Chứng Chỉ (A4)
                </h3>
              </div>
              <button
                onClick={() => window.print()}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-sm font-bold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" /> IN CHỨNG CHỈ (A4)
              </button>
            </div>

            <div className="bg-[#E7E5E4]/30 p-4 md:p-12 flex justify-center overflow-x-auto min-h-[600px] print:bg-transparent print:p-0 print:min-h-0">
              <div className="shadow-2xl hover:shadow-primary/10 transition-shadow print:shadow-none">
                <PrintableCatechismCertificate
                  certificate={initialData}
                  parishInfo={parishInfo}
                />
              </div>
            </div>

            <div className="bg-on-surface px-6 py-3 flex items-center justify-between text-surface print:hidden">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-widest opacity-80 italic">
                  Mẫu phôi chuẩn A4
                </span>
                <div className="h-4 w-[1px] bg-surface/20"></div>
                <span className="text-[10px] opacity-60">
                  Vui lòng kiểm tra kỹ thông tin trước khi in ấn thực tế.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
