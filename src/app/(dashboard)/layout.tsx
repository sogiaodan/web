'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ZonesProvider } from '@/components/providers/zones-provider';
import AccountPanel from '@/components/dashboard/settings/AccountPanel';
import FeedbackModal from '@/components/dashboard/FeedbackModal';
import ForceChangePasswordModal from '@/components/dashboard/settings/ForceChangePasswordModal';
import SystemBanner from '@/components/notifications/SystemBanner';
import SystemPopup from '@/components/notifications/SystemPopup';
import SystemMaintenanceOverlay from '@/components/notifications/SystemMaintenanceOverlay';
import { useActiveNotificationsQuery } from '@/lib/queries/useActiveNotificationsQuery';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountPanelOpen, setAccountPanelOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const { user, isLoading } = useAuth();

  const { data: activeNotifications = [] } = useActiveNotificationsQuery();

  // While checking auth, show a full-page loader to prevent "FOUC"
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
      <div className="flex h-dvh flex-col lg:flex-row bg-background overflow-hidden">
        <DashboardSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenAccountPanel={() => {
            setSidebarOpen(false);
            setAccountPanelOpen(true);
          }}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader
            onMenuClick={() => setSidebarOpen(true)}
            onHelpClick={() => setFeedbackModalOpen(true)}
          />

          {/* System-wide dismissable banner(s) */}
          <SystemBanner notifications={activeNotifications} />

          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>

        <AccountPanel isOpen={accountPanelOpen} onClose={() => setAccountPanelOpen(false)} />
        <FeedbackModal isOpen={feedbackModalOpen} onClose={() => setFeedbackModalOpen(false)} />
        <ForceChangePasswordModal isOpen={!!user?.is_first_login} />

        {/* Session popup — shown once per session after login */}
        <SystemPopup notifications={activeNotifications} />

        {/* Maintenance overlay — non-dismissable, blocks entire UI */}
        <SystemMaintenanceOverlay notifications={activeNotifications} />
      </div>
    </ZonesProvider>
  );
}
