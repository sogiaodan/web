'use client';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { BrandHeader } from '@/components/auth/BrandHeader';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { LoginForm } from './login-form';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';

export default function LoginPage() {
  const { isLoading } = useAuth();

  // Redirection is now handled centrally by AuthProvider to prevent history loops 
  // and ensure a single source of truth for auth-based navigation.

  // Handle loading state with our new premium spinner
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-10 w-10 items-center justify-center">
             <div className="absolute h-full w-full animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
             <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse font-display text-center">
            Đang kiểm tra thông tin...
          </p>
        </div>
      </div>
    );
  }

  // Even if 'user' exists in some stale state, letting them see the login form
  // is safer than a redirect loop. Successive login will fix the state.


  return (
    <AuthLayout>
      <BrandHeader className="mb-8" />
      <AuthCard>
        <div className="mb-6 flex flex-col items-center">
          <h2 className="font-serif text-[20px] md:text-[24px] font-bold text-foreground">
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
            className="text-[14px] font-medium text-primary hover:underline focus:outline-none focus:ring-1 focus:ring-primary inline-flex min-h-[44px] items-center justify-center p-2 mb-2"
          >
            Hỗ trợ kỹ thuật
          </Link>
        </div>
      </AuthCard>
      <AuthFooter />
    </AuthLayout>
  );
}
