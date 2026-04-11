'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { FormInput } from '@/components/ui/FormInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { systemAdminApi } from '@/lib/system-admin-api';
import { X, Church, ShieldAlert } from 'lucide-react';
import { ChurchOnboardingRequest } from '@/types/system-admin';

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
}

export function ChurchOnboardingForm({ onSuccess, onCancel }: ChurchOnboardingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      schema_name: 'church_',
    }
  });

  const churchName = watch('name');

  // Auto-suggest schema name based on church name
  const suggestSchema = () => {
    if (!churchName) return;
    const slug = churchName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
    
    setValue('schema_name', `church_${slug}`);
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    try {
      await systemAdminApi.createChurch(data as ChurchOnboardingRequest);
      toast.success('Khởi tạo giáo xứ và hạ tầng thành công!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi khởi tạo thực thể giáo xứ.');
    } finally {
      setIsSubmitting(false);
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
        <button onClick={onCancel} className="p-2 hover:bg-hover-bg rounded-full transition-colors">
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
                <div className="flex items-end gap-2">
                    <div className="flex-1">
                        <FormInput
                            {...register('name')}
                            label="Tên Giáo Xứ"
                            placeholder="Giáo xứ Đa Minh"
                            error={errors.name?.message}
                            disabled={isSubmitting}
                        />
                    </div>
                    <button 
                        type="button" 
                        onClick={suggestSchema}
                        className="mb-1 p-2 text-xs font-bold text-primary hover:bg-primary/5 rounded transition-colors"
                        title="Gợi ý Schema Name"
                    >
                        Gợi ý
                    </button>
                </div>
                
                <FormInput
                    {...register('schema_name')}
                    label="Schema Name (Database)"
                    placeholder="church_da_minh"
                    error={errors.schema_name?.message}
                    disabled={isSubmitting}
                    helperText="Tên định danh duy nhất trong database (bắt đầu bằng church_)"
                />
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
                    disabled={isSubmitting}
                />
                <FormInput
                    {...register('admin_email')}
                    label="Email Quản Trị"
                    placeholder="admin@parish.org"
                    type="email"
                    error={errors.admin_email?.message}
                    disabled={isSubmitting}
                />
                <FormInput
                    {...register('admin_password')}
                    label="Mật Khẩu Ban Đầu"
                    placeholder="••••••••"
                    type="password"
                    error={errors.admin_password?.message}
                    disabled={isSubmitting}
                />
            </div>
          </section>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded-sm flex gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
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
          disabled={isSubmitting}
        >
          Hủy Bỏ
        </button>
        <PrimaryButton
          form="onboarding-form"
          type="submit"
          isLoading={isSubmitting}
          className="flex-[2] shadow-md shadow-primary/20"
        >
          Khởi Tạo Thực Thể
        </PrimaryButton>
      </div>
    </div>
  );
}
