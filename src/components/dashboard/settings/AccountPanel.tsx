'use client';

import { useState, useEffect } from 'react';
import { X, Shield, Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/components/providers/auth-provider';
import { SettingsAPI } from '@/lib/api/settings';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface AccountPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Họ và tên không được để trống').max(255, 'Tối đa 255 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone_number: z.string().max(20, 'Tối đa 20 ký tự').optional().nullable(),
});

type UpdateProfileData = z.infer<typeof updateProfileSchema>;

const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Mật khẩu hiện tại không được để trống'),
  new_password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d).*$/, 'Mật khẩu phải bao gồm cả chữ cái và chữ số'),
  confirm_password: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirm_password'],
});

type ChangePasswordData = z.infer<typeof changePasswordSchema>;

export default function AccountPanel({ isOpen, onClose }: AccountPanelProps) {
  const { user, refreshContext } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'VIEW' | 'EDIT' | 'PASSWORD'>('VIEW');
  const [isLoading, setIsLoading] = useState(false);

  // Form hooks
  const profileForm = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: '', email: '', phone_number: '' },
  });

  const passwordForm = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current_password: '', new_password: '', confirm_password: '' },
  });

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode('VIEW'); // Reset to View mode when opening
    }
  }, [isOpen]);

  useEffect(() => {
    if (user && mode === 'EDIT') {
      profileForm.reset({
        name: user.name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
      });
    }
  }, [user, mode, profileForm]);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'Quản trị viên';
      case 'EDITOR': return 'Biên tập viên';
      case 'VIEWER': return 'Người xem';
      default: return 'Người dùng';
    }
  };

  const onUpdateProfile = async (data: UpdateProfileData) => {
    setIsLoading(true);
    try {
      await SettingsAPI.updateProfile(data);
      toast.success('Information updated successfully');
      await refreshContext();
      setMode('VIEW');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const onChangePassword = async (data: ChangePasswordData) => {
    setIsLoading(true);
    try {
      await SettingsAPI.changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      toast.success('Password changed successfully. Please log in again.');
      // Delay slightly for toast to be seen
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={clsx(
          "fixed inset-0 z-[60] bg-foreground/50 lg:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )} 
        onClick={onClose}
      />

      <div className={clsx(
        "fixed inset-y-0 right-0 z-[70] flex w-full lg:w-[320px] flex-col bg-background border-l border-outline shadow-xl transition-transform duration-300 ease-in-out lg:z-40",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline">
          <h2 className="font-sans text-base font-semibold text-foreground">
            {mode === 'VIEW' ? 'Account Information' : mode === 'EDIT' ? 'Edit Account' : 'Change Password'}
          </h2>
          <button 
            type="button" 
            className="p-2 -mr-2 text-muted hover:text-foreground inline-flex min-h-[48px] min-w-[48px] items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          {/* Avatar Section (Common for VIEW and EDIT) */}
          {mode !== 'PASSWORD' && (
            <div className="flex flex-col items-center mb-8">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-white mb-4">
                <span className="font-serif text-3xl font-bold">{getInitials(user?.name)}</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground text-center">
                {user?.name}
              </h3>
              <p className="text-sm text-primary font-medium mt-1">
                {getRoleLabel(user?.role)}
              </p>
            </div>
          )}

          {/* View Mode */}
          {mode === 'VIEW' && (
            <div className="flex flex-col gap-6">
              <hr className="border-t border-outline/50 -mx-6" />
              
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold tracking-wider text-muted uppercase">HỌ VÀ TÊN</label>
                <p className="text-sm text-foreground">{user?.name}</p>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold tracking-wider text-muted uppercase">EMAIL</label>
                <p className="text-sm text-foreground">{user?.email}</p>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold tracking-wider text-muted uppercase">SỐ ĐIỆN THOẠI</label>
                <p className="text-sm text-foreground">{user?.phone_number || '—'}</p>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold tracking-wider text-muted uppercase">QUYỀN HẠN</label>
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {getRoleLabel(user?.role)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 text-xs text-muted">
                <Shield className="h-4 w-4" />
                <span>Tài khoản đã được xác thực bởi hệ thống</span>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => setMode('EDIT')}
                  className="w-full inline-flex justify-center items-center rounded bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary min-h-[48px] transition-all duration-200"
                >
                  Chỉnh sửa thông tin
                </button>
              </div>
            </div>
          )}

          {/* Edit Mode */}
          {mode === 'EDIT' && (
            <form id="edit-profile-form" onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-xs font-medium text-foreground">Họ và tên</label>
                <input
                  type="text"
                  id="name"
                  {...profileForm.register('name')}
                  className={clsx(
                    "block w-full rounded border px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[48px] transition-all",
                    profileForm.formState.errors.name ? "border-primary text-primary" : "border-outline"
                  )}
                />
                {profileForm.formState.errors.name && (
                  <p className="text-xs text-primary">{profileForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-medium text-foreground">Email</label>
                <input
                  type="email"
                  id="email"
                  {...profileForm.register('email')}
                  className={clsx(
                    "block w-full rounded border px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[48px] transition-all",
                    profileForm.formState.errors.email ? "border-primary text-primary" : "border-outline"
                  )}
                />
                {profileForm.formState.errors.email && (
                  <p className="text-xs text-primary">{profileForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="phone" className="text-xs font-medium text-foreground">Số điện thoại</label>
                <input
                  type="tel"
                  id="phone"
                  {...profileForm.register('phone_number')}
                  className={clsx(
                    "block w-full rounded border px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[48px] transition-all",
                    profileForm.formState.errors.phone_number ? "border-primary text-primary" : "border-outline"
                  )}
                />
                {profileForm.formState.errors.phone_number && (
                  <p className="text-xs text-primary">{profileForm.formState.errors.phone_number.message}</p>
                )}
              </div>

              <div className="pt-4 mt-2 border-t border-outline">
                <button
                  type="button"
                  onClick={() => setMode('PASSWORD')}
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors inline-block min-h-[48px]"
                >
                  Change Security Password
                </button>
              </div>
            </form>
          )}

          {/* Password Mode */}
          {mode === 'PASSWORD' && (
            <form id="change-password-form" onSubmit={passwordForm.handleSubmit(onChangePassword)} className="flex flex-col gap-5">
              <div className="mb-2">
                <p className="text-sm text-muted">Vui lòng nhập mật khẩu cũ để xác thực yêu cầu, sau đó nhập mật khẩu mới.</p>
              </div>
              
              {/* CURRENT PASSWORD */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="current_password" className="text-xs font-semibold tracking-wider text-muted uppercase">MẬT KHẨU HIỆN TẠI</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    id="current_password"
                    {...passwordForm.register('current_password')}
                    className={clsx(
                      "block w-full rounded border px-3 py-2 pr-10 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[48px] transition-all form-input",
                      passwordForm.formState.errors.current_password ? "border-primary text-primary focus:ring-primary" : "border-outline"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-muted hover:text-foreground focus:outline-none"
                    aria-label={showCurrentPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordForm.formState.errors.current_password && (
                  <p className="text-xs text-primary">{passwordForm.formState.errors.current_password.message}</p>
                )}
              </div>

              {/* NEW PASSWORD */}
              <div className="flex flex-col gap-1.5 mt-2">
                <label htmlFor="new_password" className="text-xs font-semibold tracking-wider text-muted uppercase">MẬT KHẨU MỚI</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="new_password"
                    {...passwordForm.register('new_password')}
                    className={clsx(
                      "block w-full rounded border px-3 py-2 pr-10 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[48px] transition-all form-input",
                      passwordForm.formState.errors.new_password ? "border-primary text-primary focus:ring-primary" : "border-outline"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-muted hover:text-foreground focus:outline-none"
                    aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-muted leading-tight mt-1">
                  Tối thiểu 8 ký tự, gồm chữ cái và chữ số.
                </p>
                {passwordForm.formState.errors.new_password && (
                  <p className="text-xs text-primary mt-1">{passwordForm.formState.errors.new_password.message}</p>
                )}
              </div>

              {/* CONFIRM NEW PASSWORD */}
              <div className="flex flex-col gap-1.5 mt-2">
                <label htmlFor="confirm_password" className="text-xs font-semibold tracking-wider text-muted uppercase">XÁC NHẬN MẬT KHẨU MỚI</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm_password"
                    {...passwordForm.register('confirm_password')}
                    className={clsx(
                      "block w-full rounded border px-3 py-2 pr-10 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[48px] transition-all form-input",
                      passwordForm.formState.errors.confirm_password ? "border-primary text-primary focus:ring-primary" : "border-outline"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-muted hover:text-foreground focus:outline-none"
                    aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordForm.formState.errors.confirm_password && (
                  <p className="text-xs text-primary">{passwordForm.formState.errors.confirm_password.message}</p>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        {(mode === 'EDIT' || mode === 'PASSWORD') && (
          <div className="border-t border-outline p-4 bg-surface flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (mode === 'PASSWORD') {
                  setMode('EDIT');
                  passwordForm.reset();
                } else {
                  setMode('VIEW');
                  profileForm.reset();
                }
              }}
              className="flex-1 inline-flex justify-center items-center rounded border border-outline bg-transparent px-4 py-2 text-sm font-medium text-foreground hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[48px] transition-colors"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              form={mode === 'EDIT' ? 'edit-profile-form' : 'change-password-form'}
              className="flex-1 inline-flex justify-center items-center rounded bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[48px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  Đang xử lý...
                </span>
              ) : mode === 'EDIT' ? 'Lưu thay đổi' : 'Đổi mật khẩu'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
