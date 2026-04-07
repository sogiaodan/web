'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { ParishionerSearchCombobox } from '@/components/ui/ParishionerSearchCombobox';
import CertificateBusinessNotes from './CertificateBusinessNotes';
import CertificatePreviewCard from './CertificatePreviewCard';
import { CertificateDetail, CertificateType } from '@/types/catechism';

interface CertificateFormProps {
  mode: 'create' | 'edit';
  initialData?: CertificateDetail;
  isViewer: boolean;
  isAdmin: boolean;
  parishName: string;
}

interface FormState {
  parishioner_id: string | null;
  certificate_type: CertificateType | '';
  issue_date: string;
  certificate_no: string;
  issued_by: string;
}

interface FormErrors {
  parishioner_id?: string;
  certificate_type?: string;
  issue_date?: string;
  issued_by?: string;
  _form?: string;
}

export function CertificateForm({
  mode,
  initialData,
  isViewer,
  isAdmin,
  parishName,
}: CertificateFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    parishioner_id: initialData?.parishioner?.id ?? null,
    certificate_type: initialData?.certificate_type ?? '',
    issue_date: initialData?.issue_date
      ? initialData.issue_date.slice(0, 10)
      : '',
    certificate_no: initialData?.certificate_no ?? '',
    issued_by: initialData?.issued_by ?? parishName,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.parishioner_id) newErrors.parishioner_id = 'Vui lòng chọn giáo dân.';
    if (!form.certificate_type) newErrors.certificate_type = 'Vui lòng chọn loại chứng chỉ.';
    if (!form.issue_date) newErrors.issue_date = 'Vui lòng chọn ngày cấp.';
    if (!form.issued_by.trim()) newErrors.issued_by = 'Vui lòng nhập nơi cấp.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    const payload = {
      parishioner_id: form.parishioner_id,
      certificate_type: form.certificate_type,
      issue_date: form.issue_date,
      issued_by: form.issued_by.trim(),
      certificate_no: form.certificate_no.trim() || null,
    };

    try {
      const url =
        mode === 'edit'
          ? `/api/v1/catechism-certificates/${initialData!.id}`
          : '/api/v1/catechism-certificates';
      const method = mode === 'edit' ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 409) {
          const typeLabel =
            form.certificate_type === 'RCIA' ? 'RCIA' : 'Hôn nhân';
          showToast('error', `Giáo dân này đã có chứng chỉ ${typeLabel} trong hệ thống.`);
        } else {
          showToast('error', body?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
        }
        return;
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
    } catch {
      showToast('error', 'Không thể kết nối đến máy chủ. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/catechism-certificates/${initialData!.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('success', 'Đã xóa chứng chỉ thành công.');
        setTimeout(() => {
          router.push('/dashboard/catechism');
          router.refresh();
        }, 1200);
      } else {
        showToast('error', 'Không thể xóa chứng chỉ. Vui lòng thử lại.');
      }
    } catch {
      showToast('error', 'Không thể kết nối đến máy chủ.');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const disabled = isViewer || isSubmitting;

  return (
    <>
      {/* Toast Notification */}
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

      {/* Delete Confirmation Dialog */}
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

      {/* Main layout: form + sidebar */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 bg-surface border border-outline rounded-sm p-6 md:p-8 min-w-0"
        >
          {/* Parishioner Field — full width, spans both columns */}
          <div className="mb-6">
            <ParishionerSearchCombobox
              label="NGƯỜI LÃNH NHẬN (PARISHIONER)"
              value={form.parishioner_id}
              onChange={(id) => {
                setForm((prev) => ({ ...prev, parishioner_id: id }));
                if (errors.parishioner_id) setErrors((e) => ({ ...e, parishioner_id: undefined }));
              }}
              placeholder="Tìm kiếm tên hoặc mã số giáo dân..."
              error={errors.parishioner_id}
              disabled={disabled || mode === 'edit'}
              initialSelected={
                initialData?.parishioner
                  ? {
                      id: initialData.parishioner.id,
                      christian_name: initialData.parishioner.christian_name,
                      full_name: initialData.parishioner.full_name,
                      birth_date: initialData.parishioner.birth_date,
                    }
                  : null
              }
            />
            {!errors.parishioner_id && (
              <p className="text-[11px] text-on-surface-variant font-body mt-1 flex items-center gap-1">
                <Lock className="h-3 w-3 shrink-0" />
                Hệ thống sẽ tự động đối soát thông tin cá nhân.
              </p>
            )}
          </div>

          {/* 2-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Certificate Type */}
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

            {/* Issue Date */}
            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                Ngày Cấp <span className="text-primary">*</span>
              </label>
              <input
                type="date"
                value={form.issue_date}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, issue_date: e.target.value }));
                  if (errors.issue_date) setErrors((er) => ({ ...er, issue_date: undefined }));
                }}
                disabled={disabled}
                className={`w-full px-3 py-3 bg-surface border rounded-sm outline-none text-sm font-body text-on-surface transition-all focus:ring-2 focus:border-transparent ${
                  errors.issue_date
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-outline focus:ring-primary'
                } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
              {errors.issue_date && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.issue_date}</p>
              )}
            </div>

            {/* Certificate Number */}
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

            {/* Issued By */}
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

          {/* Form error */}
          {errors._form && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-600 font-body">
              {errors._form}
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-8 pt-6 border-t border-outline">
            {/* Delete button (ADMIN + edit mode) */}
            {isAdmin && mode === 'edit' && (
              <button
                type="button"
                onClick={() => setShowDeleteDialog(true)}
                className="md:mr-auto text-sm font-medium text-red-600 hover:text-red-700 hover:underline transition-colors h-12 px-4 focus-visible:ring-2 focus-visible:ring-red-500 rounded-sm outline-none"
              >
                Xóa chứng chỉ
              </button>
            )}
            {!isAdmin && mode === 'edit' && <div />}

            <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={() => router.push('/dashboard/catechism')}
                disabled={isSubmitting}
                className="w-full md:w-auto px-6 h-12 border border-outline text-on-surface-variant text-sm font-medium rounded-sm hover:bg-surface-hover transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary outline-none"
              >
                Hủy
              </button>

              {!isViewer && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-6 h-12 bg-primary text-white text-sm font-bold rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">autorenew</span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">lock</span>
                      Lưu Chứng Chỉ
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {isViewer && (
            <p className="mt-4 text-xs text-on-surface-variant font-body text-center italic">
              Bạn đang ở chế độ xem. Liên hệ Quản trị viên để chỉnh sửa.
            </p>
          )}
        </form>

        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <CertificateBusinessNotes />
          <CertificatePreviewCard 
            certificateType={form.certificate_type}
            issueDate={form.issue_date}
            certificateNo={form.certificate_no}
            issuedBy={form.issued_by}
          />
        </div>
      </div>
    </>
  );
}
