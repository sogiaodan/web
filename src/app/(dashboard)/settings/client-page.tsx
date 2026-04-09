'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  BookHeart, 
  Church, 
  Database, 
  LogOut, 
  ChevronRight,
  CloudDownload,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { authApi } from '@/lib/auth-api';
import { SettingsAPI, BackupStatusResponse } from '@/lib/api/settings';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function SettingsPage() {
  const { user, refreshContext } = useAuth();
  const router = useRouter();
  
  const [backupStatus, setBackupStatus] = useState<BackupStatusResponse['data'] | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await SettingsAPI.getBackupStatus();
        setBackupStatus(response.data);
      } catch (err) {
        console.error('Failed to fetch backup status', err);
      }
    };
    fetchStatus();
  }, []);

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      await SettingsAPI.triggerBackup();
      toast.success('Data backup successful');
      // Refresh status after backup
      const response = await SettingsAPI.getBackupStatus();
      setBackupStatus(response.data);
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra trong quá trình sao lưu');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authApi.logout();
      await refreshContext();
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra');
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const role = user?.role;
  const isAdmin = role === 'ADMIN';
  const isEditor = role === 'EDITOR';

  const menuItems = [
    {
      id: 'accounts',
      icon: Shield,
      label: 'Account Management',
      subtitle: 'Manage permissions and system users',
      href: '/settings/accounts',
      show: isAdmin,
    },
    {
      id: 'saints',
      icon: BookHeart,
      label: 'Saint Names',
      subtitle: 'Directory of Christian names used in records',
      href: '/settings/saints',
      show: isAdmin || isEditor,
    },
    {
      id: 'parish',
      icon: Church,
      label: 'Parish Information',
      subtitle: 'Update basic info and parish address',
      href: '/settings/parish',
      show: isAdmin,
    },
  ];

  const visibleMenuItems = menuItems.filter(item => item.show);

  const formattedBackupTime = backupStatus?.last_backup_at 
    ? new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit', 
        hour: '2-digit', minute: '2-digit'
      }).format(new Date(backupStatus.last_backup_at))
    : 'Chưa có bản sao lưu';

  return (
    <div className="flex-1 p-6 md:p-8 lg:max-w-4xl lg:mx-auto">
      <div className="mb-6 lg:mb-8">
        <h1 className="font-serif text-[20px] md:text-2xl lg:text-[24px] font-bold text-foreground">
          System Settings
        </h1>
      </div>

      <div className="flex flex-col gap-6">
        {/* Menu Cards */}
        <div className="flex flex-col border border-outline rounded bg-surface overflow-hidden">
          {visibleMenuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`group flex items-center p-4 min-h-[48px] hover:bg-hover-bg transition-colors ${
                  index !== 0 ? 'border-t border-outline' : ''
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container text-foreground mr-4">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <span className="font-sans text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                    {item.label}
                  </span>
                  <span className="font-sans text-[13px] text-muted">
                    {item.subtitle}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted group-hover:text-foreground transition-colors ml-4" />
              </Link>
            );
          })}

          {/* Backup Card */}
          {isAdmin && (
            <div className={`flex items-center p-4 min-h-[48px] ${visibleMenuItems.length > 0 ? 'border-t border-outline' : ''}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container text-foreground mr-4">
                <Database className="h-5 w-5" />
              </div>
              <div className="flex-1 flex flex-col justify-center mr-4">
                <span className="font-sans text-base font-semibold text-foreground">
                  Data Backup
                </span>
                <span className="font-sans text-[13px] text-muted">
                  Download a full backup of current data
                </span>
              </div>
              <button
                onClick={handleBackup}
                disabled={isBackingUp}
                className="shrink-0 inline-flex items-center justify-center rounded bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[48px] md:min-h-[36px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBackingUp ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner className="h-4 w-4 text-white" />
                    Đang xử lý...
                  </span>
                ) : (
                  'Backup Now'
                )}
              </button>
            </div>
          )}

          {/* Logout Card */}
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className={`group flex items-center p-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary text-left min-h-[48px] hover:bg-hover-bg transition-colors w-full ${
               (visibleMenuItems.length > 0 || isAdmin) ? 'border-t border-outline' : ''
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container text-primary mr-4">
              <LogOut className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <span className="font-sans text-base font-semibold text-primary">
                Logout
              </span>
              <span className="font-sans text-[13px] text-muted">
                End the current session
              </span>
            </div>
          </button>
        </div>

        {/* Info Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="flex flex-col bg-surface-container border border-outline rounded p-4 h-full">
            <div className="flex items-center gap-2 mb-2 text-muted">
              <CloudDownload className="h-4 w-4 shrink-0" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                LAST BACKUP
              </span>
            </div>
            <div className="font-sans text-base font-semibold text-foreground">
              {formattedBackupTime}
            </div>
          </div>
          
          <div className="flex flex-col bg-surface-container border border-outline rounded p-4 h-full">
            <div className="flex items-center gap-2 mb-2 text-muted">
              <RefreshCw className="h-4 w-4 shrink-0" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                SYSTEM VERSION
              </span>
            </div>
            <div className="font-sans text-base font-semibold text-foreground">
              {backupStatus?.system_version || 'v2.4.1 stable'}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <>
          <div className="fixed inset-0 z-[100] bg-foreground/50 transition-opacity" onClick={() => !isLoggingOut && setIsLogoutModalOpen(false)} />
          <div className="fixed left-[50%] top-[50%] z-[110] w-full max-w-[calc(100vw-32px)] md:max-w-md translate-x-[-50%] translate-y-[-50%]">
            <div className="bg-background rounded shadow-xl overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-outline flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-foreground">
                  Xác nhận đăng xuất
                </h3>
              </div>
              <div className="px-6 py-8 border-b border-outline">
                <p className="text-base text-foreground text-center">
                  Are you sure you want to log out?
                </p>
              </div>
              <div className="px-6 py-4 bg-surface flex items-center justify-end gap-3 rounded-b">
                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(false)}
                  disabled={isLoggingOut}
                  className="rounded px-4 py-2 text-sm font-medium text-foreground hover:bg-hover-bg border border-outline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[48px] transition-colors disabled:opacity-50 flex-1 md:flex-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[48px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px] flex-1 md:flex-none"
                >
                  {isLoggingOut ? <LoadingSpinner className="h-4 w-4" /> : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
