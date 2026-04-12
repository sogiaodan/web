'use client';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthCard } from '@/components/auth/AuthCard';
import { BrandHeader } from '@/components/auth/BrandHeader';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { SystemAdminLoginForm } from './login-form';
import { ShieldCheck, History } from 'lucide-react';
import { useSystemAdmin } from '@/components/providers/system-admin-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SystemAdminLoginPage() {
  const { admin, isLoading } = useSystemAdmin();
  const router = useRouter();

  useEffect(() => {
    if (admin && !isLoading) {
      router.replace('/super-admin/dashboard');
    }
  }, [admin, isLoading, router]);

  return (
    <AuthLayout>
      <BrandHeader className="mb-12" />

      <AuthCard className="border-t-4 border-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
            <History className="h-24 w-24" />
        </div>
        
        <div className="mb-8 flex flex-col items-center">
          <h2 className="font-serif text-2xl font-bold text-foreground">
            Xác thực Quản trị viên
          </h2>
          <p className="text-sm text-muted mt-1 italic text-center">
            Vui lòng nhập tài khoản để truy cập kho lưu trữ.
          </p>
          <div className="mt-6 h-px w-24 bg-primary" />
        </div>

        <SystemAdminLoginForm />
        
        <div className="mt-8 flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2 text-[11px] font-bold text-primary/60 uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            <span>Khu vực bảo mật cấp độ S</span>
          </div>
        </div>
      </AuthCard>

      <AuthFooter className="mt-12" />
    </AuthLayout>
  );
}
