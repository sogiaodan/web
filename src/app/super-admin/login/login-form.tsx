'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { FormInput } from '@/components/ui/FormInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { systemAdminApi } from '@/lib/system-admin-api';
import { useSystemAdmin } from '@/components/providers/system-admin-provider';

const loginSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email quản trị').email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function SystemAdminLoginForm() {
  const router = useRouter();
  const { login } = useSystemAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const response = await systemAdminApi.login(data.email, data.password);
      login(response.user);
      toast.success('Xác thực quản trị hệ thống thành công');
      router.replace('/super-admin/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Lỗi xác thực hệ thống Central.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
      <FormInput
        {...register('email')}
        label="TÀI KHOẢN CENTRAL"
        placeholder="admin@giaodan.io.vn"
        type="email"
        error={errors.email?.message}
        disabled={isSubmitting}
      />

      <FormInput
        {...register('password')}
        label="CHÌA KHÓA HỆ THỐNG"
        placeholder="••••••••"
        type="password"
        error={errors.password?.message}
        disabled={isSubmitting}
      />

      <div className="mt-4">
        <PrimaryButton type="submit" isLoading={isSubmitting} className="w-full shadow-lg shadow-primary/20">
          Mở khóa hệ thống
        </PrimaryButton>
      </div>
    </form>
  );
}
