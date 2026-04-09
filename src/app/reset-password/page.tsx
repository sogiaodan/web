import { Suspense } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { BrandHeader } from '@/components/auth/BrandHeader';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { ResetPasswordForm } from './reset-password-form';
import { LockKeyhole } from 'lucide-react';
import Link from 'next/link';

export const runtime = 'edge';

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <BrandHeader className="mb-8" />
      <AuthCard>
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary text-primary">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h2 className="font-serif text-[20px] md:text-[24px] font-bold text-foreground">
            Thiết lập mật khẩu mới
          </h2>
        </div>
        
        <Suspense fallback={<div className="p-4 text-center">Đang tải...</div>}>
          <ResetPasswordForm />
        </Suspense>
        
        <div className="mt-6 flex flex-col items-center md:hidden">
          <Link
            href="/login"
            className="text-[14px] font-medium text-primary hover:underline focus:outline-none focus:ring-1 focus:ring-primary flex min-h-[44px] items-center justify-center p-2"
          >
            ← Quay lại đăng nhập
          </Link>
        </div>
      </AuthCard>
      <AuthFooter />
    </AuthLayout>
  );
}
