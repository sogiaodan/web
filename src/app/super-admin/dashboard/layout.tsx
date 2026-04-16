'use client';

import { useState } from 'react';
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


  // While checking auth, show a full-page loader
  if (isLoading) {
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

  // Provider will handle the hard redirect. Show a fallback in case it takes a moment.
  if (!admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-vellum">
        <div className="text-center space-y-4 p-8">
          <p className="text-sm text-muted-foreground font-serif italic">
            Phiên đăng nhập không hợp lệ hoặc đã hết hạn.
          </p>
          <button
            onClick={() => { window.location.href = '/super-admin/login'; }}
            className="px-6 py-2 bg-primary text-white rounded-sm text-sm font-semibold shadow-md hover:opacity-90 transition-opacity"
          >
            Quay lại trang Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col lg:flex-row bg-vellum overflow-hidden">
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
