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
  RefreshCw,
  HelpCircle,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { authApi } from '@/lib/auth-api';
import { SettingsAPI, SettingsAccountsAPI, BackupStatusResponse } from '@/lib/api/settings';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FormInput } from '@/components/ui/FormInput';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { 
  useBackupStatusQuery, 
  useBackupMutation 
} from '@/lib/queries/useSettingsQueries';
import FeedbackModal from '@/components/dashboard/FeedbackModal';
import { useQueryClient } from '@tanstack/react-query';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const { data: backupData } = useBackupStatusQuery();
  const backupMutation = useBackupMutation();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
  const backupStatus = backupData?.data;

  const handleLeaveParish = async () => {
    if (deleteConfirmEmail !== user?.email) {
      toast.error('Email xác nhận không chính xác');
      return;
    }

    setIsDeleting(true);
    try {
      await SettingsAccountsAPI.leaveParish();
      toast.success('Đã rời khỏi giáo xứ. Sau đây bạn sẽ được đăng xuất.');
      setTimeout(async () => {
        queryClient.clear();
        await logout();
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra');
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      queryClient.clear();
      await logout();
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra');
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const handleBackup = () => {
    backupMutation.mutate();
  };


  const role = user?.role;
  const isAdmin = role === 'ADMIN';
  const isEditor = role === 'EDITOR';

  const menuItems = [
    {
      id: 'accounts',
      icon: Shield,
      label: 'Quản lý Tài khoản',
      subtitle: 'Quản lý quyền và người dùng hệ thống',
      href: '/settings/accounts',
      show: isAdmin,
    },
    {
      id: 'saints',
      icon: BookHeart,
      label: 'Tên Thánh',
      subtitle: 'Danh mục tên Thánh sử dụng trong hồ sơ',
      href: '/settings/saints',
      show: isAdmin || isEditor,
    },
    {
      id: 'parish',
      icon: Church,
      label: 'Thông tin Giáo xứ',
      subtitle: 'Cập nhật thông tin cơ bản và địa chỉ giáo xứ',
      href: '/settings/parish',
      show: isAdmin,
    },
    {
      id: 'feedback',
      icon: HelpCircle,
      label: 'Trợ giúp & Góp ý',
      subtitle: 'Hướng dẫn sử dụng và báo cáo sự cố',
      onClick: () => setIsFeedbackModalOpen(true),
      show: true,
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
      <div className="mb-6 lg:mb-8 flex items-center justify-between relative">
        <h1 className="font-serif text-[20px] md:text-2xl lg:text-[24px] font-bold text-foreground">
          Cài đặt Hệ thống
        </h1>
        <div className="relative">
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className="p-2 h-10 w-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="More options"
          >
            <MoreVertical className="h-6 w-6 text-muted" />
          </button>
          
          {isMoreMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsMoreMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-md border border-outline bg-background shadow-lg z-50 py-1 animate-in fade-in zoom-in duration-200 origin-top-right">
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    setIsDeleteModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-primary hover:bg-hover-bg flex items-center gap-3 transition-colors min-h-[48px]"
                >
                  <Trash2 className="h-4 w-4" />
                  Rời khỏi giáo xứ / Xóa tài khoản
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Menu Cards */}
        <div className="flex flex-col border border-outline rounded bg-surface overflow-hidden">
          {visibleMenuItems.map((item, index) => {
            const Icon = item.icon;
            
            const content = (
              <>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container text-foreground mr-4">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 flex flex-col justify-center text-left">
                  <span className="font-sans text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                    {item.label}
                  </span>
                  <span className="font-sans text-[13px] text-muted">
                    {item.subtitle}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted group-hover:text-foreground transition-colors ml-4" />
              </>
            );

            const className = `group flex items-center p-4 min-h-[48px] hover:bg-hover-bg transition-colors w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              index !== 0 ? 'border-t border-outline' : ''
            }`;

            if (item.onClick) {
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={className}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href!}
                className={className}
              >
                {content}
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
                  Sao lưu Dữ liệu
                </span>
                <span className="font-sans text-[13px] text-muted">
                  Tải xuống bản sao lưu toàn bộ dữ liệu hiện tại
                </span>
              </div>
              <button
                onClick={handleBackup}
                disabled={backupMutation.isPending}
                className="shrink-0 inline-flex items-center justify-center rounded bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[48px] md:min-h-[36px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {backupMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner className="h-4 w-4 text-white" />
                    Đang xử lý...
                  </span>
                ) : (
                  'Sao lưu ngay'
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
                Đăng xuất
              </span>
              <span className="font-sans text-[13px] text-muted">
                Kết thúc phiên làm việc hiện tại
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
                BẢN SAO LƯU CUỐI
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
                PHIÊN BẢN HỆ THỐNG
              </span>
            </div>
            <div className="font-sans text-base font-semibold text-foreground">
              {process.env.NEXT_PUBLIC_VERSION ? `v${process.env.NEXT_PUBLIC_VERSION} stable` : (backupStatus?.system_version || 'v1.0.0 stable')}
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
                  Bạn có chắc chắn muốn đăng xuất?
                </p>
              </div>
              <div className="px-6 py-4 bg-surface flex items-center justify-end gap-3 rounded-b">
                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(false)}
                  disabled={isLoggingOut}
                  className="rounded px-4 py-2 text-sm font-medium text-foreground hover:bg-hover-bg border border-outline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[48px] transition-colors disabled:opacity-50 flex-1 md:flex-none"
                >
                  Hủy
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[48px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px] flex-1 md:flex-none"
                >
                  {isLoggingOut ? <LoadingSpinner className="h-4 w-4" /> : 'Đăng xuất'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />

      {/* Delete/Leave Confirmation Modal */}
      {isDeleteModalOpen && (
        <>
          <div className="fixed inset-0 z-[100] bg-foreground/50 transition-opacity" onClick={() => !isDeleting && setIsDeleteModalOpen(false)} />
          <div className="fixed left-[50%] top-[50%] z-[110] w-full max-w-[calc(100vw-32px)] md:max-w-md translate-x-[-50%] translate-y-[-50%]">
            <div className="bg-background rounded shadow-xl overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-outline flex items-center justify-between bg-surface-container">
                <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Xác nhận rời giáo xứ
                </h3>
              </div>
              <div className="px-6 py-6 border-b border-outline space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded p-3">
                  <p className="font-sans text-[13px] text-amber-800 leading-relaxed">
                    <strong>Lưu ý:</strong> Hành động này sẽ khóa quyền truy cập của bạn vào hệ thống quản lý của giáo xứ hiện tại ngay lập tức. Bạn chỉ có thể quay lại nếu được Admin mời lại.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <p className="font-sans text-sm text-foreground">
                    Vui lòng nhập email <span className="font-bold underline text-primary">{user?.email}</span> để xác nhận:
                  </p>
                  <FormInput
                    value={deleteConfirmEmail}
                    onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
                    autoComplete="off"
                    className="h-12"
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-surface-container flex items-center justify-end gap-3 rounded-b flex-col md:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteConfirmEmail('');
                  }}
                  disabled={isDeleting}
                  className="rounded px-4 py-2 text-sm font-medium text-foreground hover:bg-hover-bg border border-outline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[48px] transition-colors disabled:opacity-50 w-full md:w-auto"
                >
                  Hủy
                </button>
                <button
                  onClick={handleLeaveParish}
                  disabled={isDeleting || deleteConfirmEmail !== user?.email}
                  className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[48px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px] w-full md:w-auto"
                >
                  {isDeleting ? <LoadingSpinner className="h-4 w-4" /> : 'Xác nhận rời đi'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
