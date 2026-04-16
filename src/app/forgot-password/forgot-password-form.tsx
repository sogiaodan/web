'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { FormInput } from '@/components/ui/FormInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Mail } from 'lucide-react';
import { authApi } from '@/lib/auth-api';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(data.email);
      toast.success('Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.');
      setIsSuccess(true);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại sau');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="rounded-[4px] bg-surface-container p-4 text-center text-[14px] text-foreground border border-outline-variant">
        Chúng tôi đã gửi email hướng dẫn nếu tài khoản tồn tại trong hệ thống.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
      <FormInput
        {...register('email')}
        label="ĐỊA CHỈ EMAIL"
        placeholder="example@parish.com"
        type="email"
        error={errors.email?.message}
        PrefixIcon={Mail}
        disabled={isSubmitting}
      />
      
      <div className="mt-2">
        <PrimaryButton type="submit" isLoading={isSubmitting}>
          Gửi yêu cầu
        </PrimaryButton>
      </div>
    </form>
  );
}
