'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { FormInput } from '@/components/ui/FormInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { authApi } from '@/lib/auth-api';
import { useAuth } from '@/components/providers/auth-provider';

const loginSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
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
      const response = await authApi.login(data.email, data.password);
      login(response.user);
      toast.success('Đăng nhập thành công');
      router.replace('/');
    } catch (error: any) {
      toast.error(error.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
      <FormInput
        {...register('email')}
        label="EMAIL TRUY CẬP"
        placeholder="name@parish.org"
        type="email"
        error={errors.email?.message}
        disabled={isSubmitting}
      />

      <div className="relative">
        <FormInput
          {...register('password')}
          label="MẬT KHẨU"
          placeholder="••••••••"
          type="password"
          error={errors.password?.message}
          disabled={isSubmitting}
        />
        <div className="absolute right-0 top-0">
          <Link
            href="/forgot-password"
            className="text-[12px] font-medium text-primary hover:underline focus:outline-none focus:ring-1 focus:ring-primary inline-flex min-h-[44px] items-center p-2 -mr-2 -mt-2"
            tabIndex={-1}
          >
            Quên mật khẩu?
          </Link>
        </div>
      </div>

      <div className="mt-2">
        <PrimaryButton type="submit" isLoading={isSubmitting}>
          Đăng nhập
        </PrimaryButton>
      </div>
    </form>
  );
}
