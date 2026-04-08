'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ZonesProvider } from '@/components/providers/zones-provider';
import AccountPanel from '@/components/dashboard/settings/AccountPanel';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountPanelOpen, setAccountPanelOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirection logic is now centralized in AuthProvider. 
  // This prevents conflicting redirects during state transitions.

  // While checking auth, show a full-page loader to prevent "FOUC" (Flash of Unauthenticated Content)
  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner className="h-10 w-10 text-primary" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse font-display">
            Đang xác thực hệ thống...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ZonesProvider>
      <div className="flex min-h-dvh flex-col lg:flex-row bg-background">
        <DashboardSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          onOpenAccountPanel={() => {
            setSidebarOpen(false); // Close main sidebar on mobile when opening account panel
            setAccountPanelOpen(true);
          }}
        />
        
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
        
        <AccountPanel isOpen={accountPanelOpen} onClose={() => setAccountPanelOpen(false)} />
      </div>
    </ZonesProvider>
  );
}
