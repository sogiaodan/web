'use client';

import { useState } from 'react';
import { Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SettingsAPI } from '@/lib/api/settings';
import { toast } from 'sonner';

import clsx from 'clsx';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Mật khẩu hiện tại không được để trống'),
  new_password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/^[a-zA-Z0-9]+$/, 'Mật khẩu chỉ được chứa chữ cái và chữ số'),
  confirm_password: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirm_password'],
});

type ChangePasswordData = z.infer<typeof changePasswordSchema>;

interface ForceChangePasswordModalProps {
  isOpen: boolean;
}

export default function ForceChangePasswordModal({ isOpen }: ForceChangePasswordModalProps) {

  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordData) => {
    setIsLoading(true);
    try {
      await SettingsAPI.changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      toast.success('Mật khẩu đã được cập nhật. Vui lòng đăng nhập lại.', { duration: 5000 });
      
      // Delay to show toast then redirect to login to force fresh session
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Có lỗi xảy ra khi đổi mật khẩu');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-background rounded-sm shadow-2xl border border-outline overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-primary px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-sm">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold">Xác thực Bảo mật</h2>
              <p className="text-[10px] uppercase tracking-widest opacity-80 font-bold">Yêu cầu đổi mật khẩu lần đầu</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-sm flex gap-3">
             <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
             <p className="text-[13px] text-amber-800 leading-normal">
               Vì đây là lần đầu bạn đăng nhập bằng mật khẩu tạm thời, hệ thống yêu cầu bạn thiết lập mật khẩu mới để đảm bảo an toàn.
             </p>
          </div>

          <form id="force-password-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* CURRENT PASSWORD */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted uppercase tracking-wider">Mật khẩu tạm thời hiện tại</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  {...register('current_password')}
                  className={clsx(
                    "block w-full rounded-sm border px-3 py-2.5 pr-10 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[48px] transition-all",
                    errors.current_password ? "border-primary bg-primary/[0.02]" : "border-outline"
                  )}
                  placeholder="Nhập mật khẩu bạn vừa dùng để đăng nhập"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-muted hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.current_password && <p className="text-xs font-medium text-primary">{errors.current_password.message}</p>}
            </div>

            {/* NEW PASSWORD */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted uppercase tracking-wider">Mật khẩu mới</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  {...register('new_password')}
                  className={clsx(
                    "block w-full rounded-sm border px-3 py-2.5 pr-10 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[48px] transition-all",
                    errors.new_password ? "border-primary bg-primary/[0.02]" : "border-outline"
                  )}
                  placeholder="Thiết lập mật khẩu an toàn của bạn"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-muted hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[10px] text-muted italic">Tối thiểu 8 ký tự, gm chữ cái và chữ số.</p>
              {errors.new_password && <p className="text-xs font-medium text-primary">{errors.new_password.message}</p>}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted uppercase tracking-wider">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register('confirm_password')}
                  className={clsx(
                    "block w-full rounded-sm border px-3 py-2.5 pr-10 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[48px] transition-all",
                    errors.confirm_password ? "border-primary bg-primary/[0.02]" : "border-outline"
                  )}
                  placeholder="Nhập lại mật khẩu mới để xác nhận"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-muted hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirm_password && <p className="text-xs font-medium text-primary">{errors.confirm_password.message}</p>}
            </div>
          </form>
        </div>

        <div className="bg-vellum/30 px-6 py-4 border-t border-outline flex justify-center">
          <PrimaryButton
            type="submit"
            form="force-password-form"
            isLoading={isLoading}
            className="w-full shadow-lg shadow-primary/20"
          >
            Xác nhận Mật khẩu Mới
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
