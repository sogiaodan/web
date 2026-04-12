'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { FormInput } from '@/components/ui/FormInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { authApi } from '@/lib/auth-api';

const resetPasswordSchema = z.object({
  new_password: z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/^[a-zA-Z0-9]+$/, 'Mật khẩu chỉ được chứa chữ cái và chữ số'),
  confirm_password: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Mật khẩu không khớp',
  path: ['confirm_password'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setIsLoading(false);
        setIsValidToken(false);
        return;
      }

      try {
        const response = await authApi.verifyResetToken(token);
        if (response.valid) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
        }
      } catch {
        toast.error('Lỗi khi xác minh liên kết.');
        setIsValidToken(false);
      } finally {
        setIsLoading(false);
      }
    }
    
    verifyToken();
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;
    setIsSubmitting(true);
    
    try {
      await authApi.resetPassword(token, data.new_password);
      toast.success('Mật khẩu đã được cập nhật thành công');
      router.push('/login');
    } catch (error: any) {
      if (error.message && error.message.includes('hết hạn')) {
         toast.error('Liên kết đã hết hạn.');
         router.push('/forgot-password');
      } else {
         toast.error(error.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="h-[48px] w-full animate-pulse rounded-[4px] bg-outline-variant/20" />
        <div className="h-[48px] w-full animate-pulse rounded-[4px] bg-outline-variant/20" />
        <div className="h-[48px] w-full animate-pulse rounded-[4px] bg-primary/20" />
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center text-foreground">
        <p className="font-medium text-primary">Liên kết không hợp lệ hoặc đã hết hạn.</p>
        <p className="mb-4 text-sm text-outline-variant font-sans px-2">Vui lòng yêu cầu liên kết thiết lập lại mật khẩu mới.</p>
        <Link
          href="/forgot-password"
          className="flex items-center gap-2 rounded bg-surface-container-low px-4 py-2 text-sm font-medium border border-outline-variant transition-colors hover:bg-surface-container-highest"
        >
          <ArrowLeft className="h-4 w-4" /> Yêu cầu mặt khẩu mới
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="rounded-[2px] bg-surface-container px-4 py-3 border border-outline-variant/50 text-[14px]">
        <p className="text-foreground/90 font-sans tracking-tight">
          <strong className="text-primary mr-1">Tùy chọn bảo mật:</strong>
          Tối thiểu 8 ký tự, gồm chữ cái và chữ số.
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="mt-2 flex w-full flex-col gap-4">
        <FormInput
          {...register('new_password')}
          label="MẬT KHẨU MỚI"
          placeholder="Nhập mật khẩu mới"
          type="password"
          error={errors.new_password?.message}
          disabled={isSubmitting}
        />
        
        <FormInput
          {...register('confirm_password')}
          label="XÁC NHẬN MẬT KHẨU MỚI"
          placeholder="Nhập lại mật khẩu mới"
          type="password"
          error={errors.confirm_password?.message}
          disabled={isSubmitting}
        />
        
        <div className="mt-4">
          <PrimaryButton type="submit" isLoading={isSubmitting}>
            Lưu mật khẩu
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
