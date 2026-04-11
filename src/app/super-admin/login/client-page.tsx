'use client';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthCard } from '@/components/auth/AuthCard';
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
      <div className="mb-12 flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-white shadow-2xl shadow-primary/40 mb-4 transform hover:scale-110 transition-transform duration-300">
          <ShieldCheck className="h-10 w-10" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-primary">Sacred Vellum</h1>
        <p className="text-[12px] uppercase tracking-[0.2em] text-muted font-black mt-1">Management Portal</p>
      </div>

      <AuthCard className="border-t-4 border-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
            <History className="h-24 w-24" />
        </div>
        
        <div className="mb-8 flex flex-col items-center">
          <h2 className="font-serif text-2xl font-bold text-foreground">
            Xác thực Quản trị viên
          </h2>
          <p className="text-sm text-muted mt-1 italic text-center">
            Vui lòng nhập chìa khóa để truy cập kho lưu trữ toàn cầu.
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

      <div className="mt-12 text-center">
        <p className="text-[14px] font-medium text-muted font-serif italic">
          &ldquo;Ghi dấu lịch sử, lưu giữ đức tin&rdquo;
        </p>
      </div>
    </AuthLayout>
  );
}
