'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSystemAdmin } from '@/components/providers/system-admin-provider';
import SystemAdminSidebar from '@/components/dashboard/SystemAdminSidebar';
import SystemAdminHeader from '@/components/dashboard/SystemAdminHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function SystemAdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, isLoading } = useSystemAdmin();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and there's no admin, redirect to admin login
    if (!isLoading && !admin) {
      router.push('/super-admin/login');
    }
  }, [admin, isLoading, router]);

  // While checking auth, show a full-page loader
  if (isLoading || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-vellum">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner className="h-10 w-10 text-primary" />
          <p className="text-sm font-medium text-primary animate-pulse font-serif italic">
            Đang truy cập kho lưu trữ hệ thống...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row bg-vellum">
      <SystemAdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <SystemAdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
