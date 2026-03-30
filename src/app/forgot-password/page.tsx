import { AuthLayout } from '@/components/auth/AuthLayout';
import { BrandHeader } from '@/components/auth/BrandHeader';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { ForgotPasswordForm } from './forgot-password-form';
import { KeyRound, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <BrandHeader className="mb-8" />
      <AuthCard>
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary text-primary">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="font-serif text-[24px] font-bold text-foreground">
            Quên mật khẩu?
          </h2>
          <p className="mt-2 text-[16px] leading-[1.6] text-outline-variant font-sans px-2">
            Nhập địa chỉ email liên kết với tài khoản của bạn. Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
          </p>
        </div>
        
        <ForgotPasswordForm />
        
        <div className="mt-6 flex flex-col items-center gap-6">
          <Link
            href="/login"
            className="flex items-center gap-2 text-[14px] font-medium text-primary hover:underline focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại đăng nhập
          </Link>
          <div className="font-serif italic text-[14px] text-outline-variant opacity-60">
            &quot;Servite Domino in laetitia&quot;
          </div>
        </div>
      </AuthCard>
      <AuthFooter />
    </AuthLayout>
  );
}
