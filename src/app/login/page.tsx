import { AuthLayout } from '@/components/auth/AuthLayout';
import { BrandHeader } from '@/components/auth/BrandHeader';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { LoginForm } from './login-form';
import { Lock } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <AuthLayout>
      <BrandHeader className="mb-8" />
      <AuthCard>
        <div className="mb-6 flex flex-col items-center">
          <h2 className="font-serif text-[24px] font-bold text-foreground">
            Chào mừng bạn trở lại
          </h2>
          <div className="mt-4 h-px w-full bg-outline-variant opacity-50" />
        </div>
        <LoginForm />
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-1.5 text-[12px] opacity-80 text-[#1C1917]">
            <Lock className="h-3 w-3" />
            <span>Truy cập được bảo mật theo tiêu chuẩn lưu trữ giáo hội</span>
          </div>
          <Link
            href="/support"
            className="text-[14px] font-medium text-primary hover:underline focus:outline-none focus:ring-1 focus:ring-primary"
          >
            Hỗ trợ kỹ thuật
          </Link>
        </div>
      </AuthCard>
      <AuthFooter />
    </AuthLayout>
  );
}
