'use client';

import { cn } from '@/lib/utils';

interface ErrorSectionProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  fullPage?: boolean;
}

export function ErrorSection({
  title = 'Đã xảy ra lỗi',
  message = 'Không thể tải dữ liệu. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.',
  onRetry,
  className,
  fullPage = false,
}: ErrorSectionProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-12 bg-surface border border-outline rounded gap-4",
        fullPage ? "min-h-[60vh] w-full" : "w-full my-4",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-red-500 text-3xl">
          error_outline
        </span>
      </div>
      <div className="space-y-1">
        <h3 className="font-display font-bold text-[#1C1917] text-lg">
          {title}
        </h3>
        <p className="text-sm text-on-surface-variant font-body max-w-md">
          {message}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-sm font-bold text-xs hover:bg-primary/95 transition-all shadow-sm cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          THỬ LẠI
        </button>
      )}
    </div>
  );
}
