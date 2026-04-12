'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { FormInput } from '@/components/ui/FormInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { X, Church, ShieldAlert, Pencil, Check } from 'lucide-react';
import { ChurchOnboardingRequest } from '@/types/system-admin';
import { UseMutationResult } from '@tanstack/react-query';
import { ChurchOnboardingResponse } from '@/types/system-admin';

const onboardingSchema = z.object({
  name: z.string().min(2, 'Tên giáo xứ phải ít nhất 2 ký tự'),
  schema_name: z.string()
    .min(3, 'Schema name phải ít nhất 3 ký tự')
    .regex(/^church_[a-z0-9_]+$/, 'Phải bắt đầu bằng church_ và chỉ chứa chữ thường, số, dấu gạch dưới'),
  admin_name: z.string().min(2, 'Tên quản trị viên phải ít nhất 2 ký tự'),
  admin_email: z.string().email('Email không hợp lệ'),
  admin_password: z.string().min(8, 'Mật khẩu phải ít nhất 8 ký tự'),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

interface ChurchOnboardingFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  mutation: UseMutationResult<ChurchOnboardingResponse, Error, ChurchOnboardingRequest>;
}

/** Convert a Vietnamese church name to a valid schema slug.
 *  e.g. "Nam Hưng" => "church_namhung"
 */
function toSchemaSlug(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]/g, '');     // remove everything except a-z and digits (no underscores from spaces)
  return slug ? `church_${slug}` : 'church_';
}

export function ChurchOnboardingForm({ onSuccess, onCancel, mutation }: ChurchOnboardingFormProps) {
  const { isPending } = mutation;
  const [isSchemaEditable, setIsSchemaEditable] = useState(false);
  const [isManuallyLocked, setIsManuallyLocked] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      schema_name: 'church_',
    },
  });

  const churchName = watch('name');
  const schemaName = watch('schema_name');

  // Auto-generate schema_name whenever church name changes.
  // Skips if user has manually confirmed a custom slug (isManuallyLocked).
  useEffect(() => {
    if (!isSchemaEditable && !isManuallyLocked && churchName) {
      setValue('schema_name', toSchemaSlug(churchName), { shouldValidate: true });
    }
  }, [churchName, isSchemaEditable, isManuallyLocked, setValue]);

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      await mutation.mutateAsync(data as ChurchOnboardingRequest);
      onSuccess();
    } catch {
      // Errors are handled in the mutation's onError callback (toast)
    }
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-2xl border-l border-outline animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between p-6 border-b border-outline bg-vellum/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-sm text-primary">
            <Church className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-foreground">Onboard Giáo Xứ Mới</h2>
            <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Thực thể Tenant mới</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-hover-bg rounded-full transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
          disabled={isPending}
          aria-label="Đóng"
        >
          <X className="h-5 w-5 text-muted" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <form id="onboarding-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <section>
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="h-px w-4 bg-primary" /> Thông tin Giáo xứ
            </h3>
            <div className="grid gap-4">
              {/* Church name — auto-generates schema_name on change */}
              <FormInput
                {...register('name')}
                label="Tên Giáo Xứ"
                placeholder="Giáo xứ Đa Minh"
                error={errors.name?.message}
                disabled={isPending}
              />

              {/* Schema name — auto-generated, lockable for manual override */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1.5">
                  Schema Name (Database)
                </p>

                {isSchemaEditable ? (
                  /* ── Manual edit mode ── */
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <FormInput
                        {...register('schema_name')}
                        placeholder="church_da_minh"
                        error={errors.schema_name?.message}
                        disabled={isPending}
                        helperText="Chỉ chứa chữ thường a-z, số 0-9 (không dấu, không khoảng trắng)"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => { setIsSchemaEditable(false); setIsManuallyLocked(true); }}
                      className="p-2 min-h-[40px] min-w-[40px] rounded-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center justify-center"
                      title="Xác nhận"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  /* ── Read-only pill mode ── */
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-sm border border-outline bg-vellum/40 group">
                    <code className="flex-1 text-sm font-mono text-foreground tracking-wide">
                      {schemaName || 'church_'}
                    </code>
                    <button
                      type="button"
                      onClick={() => { setIsSchemaEditable(true); setIsManuallyLocked(false); }}
                      className="p-1.5 rounded hover:bg-outline/60 transition-colors text-muted hover:text-foreground opacity-0 group-hover:opacity-100"
                      title="Chỉnh sửa Schema Name thủ công"
                      disabled={isPending}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {!isSchemaEditable && (
                  <p className="text-[10px] text-muted mt-1.5 italic">
                    Tự động sinh từ tên giáo xứ. Hover và bấm vào biểu tượng bút để chỉnh sửa thủ công.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="h-px w-4 bg-primary" /> Quản trị viên khởi tạo
            </h3>
            <div className="grid gap-4">
              <FormInput
                {...register('admin_name')}
                label="Tên Quản Trị Viên"
                placeholder="Lm. Gioan Baotixita"
                error={errors.admin_name?.message}
                disabled={isPending}
              />
              <FormInput
                {...register('admin_email')}
                label="Email Quản Trị"
                placeholder="admin@giaoparish.org"
                type="email"
                autoComplete="off"
                error={errors.admin_email?.message}
                disabled={isPending}
              />
              <FormInput
                {...register('admin_password')}
                label="Mật Khẩu Ban Đầu"
                placeholder="Tối thiểu 8 ký tự"
                type="password"
                autoComplete="new-password"
                error={errors.admin_password?.message}
                disabled={isPending}
              />
            </div>
          </section>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded-sm flex gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-normal">
              <strong>Lưu ý:</strong> Quá trình này hoàn toàn tự động. Email thông tin tài khoản có thể rơi vào mục <strong>Spam</strong>, hãy nhắc người dùng kiểm tra nếu không thấy trong Inbox. Thao tác khởi tạo này không thể hoàn tác trực tiếp từ UI.
            </p>
          </div>
        </form>
      </div>

      <div className="p-6 border-t border-outline bg-vellum/30 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 min-h-[48px] px-4 rounded-sm border border-outline bg-white text-sm font-bold text-foreground hover:bg-hover-bg transition-colors"
          disabled={isPending}
        >
          Hủy Bỏ
        </button>
        <PrimaryButton
          form="onboarding-form"
          type="submit"
          isLoading={isPending}
          className="flex-[2] shadow-md shadow-primary/20"
        >
          Khởi Tạo Thực Thể
        </PrimaryButton>
      </div>
    </div>
  );
}
