'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function SacramentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Sacraments error bounds:', error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-background-light">
      <div className="max-w-md w-full bg-surface border border-outline rounded p-8 text-center mt-4">
        <span className="material-symbols-outlined text-5xl text-red-500 mb-3 block">
          error
        </span>
        <h2 className="font-display font-bold text-lg text-on-surface mb-2">
          Đã xảy ra lỗi
        </h2>
        <p className="text-sm font-body text-on-surface-variant mb-6">
          Không thể xử lý yêu cầu quản lý Bí tích của bạn. Vui lòng thử lại sau.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full bg-primary text-white font-bold text-sm py-3 rounded-sm hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Thử lại
          </button>
          <Link
            href="/dashboard"
            className="w-full border border-outline text-on-surface-variant font-bold text-sm py-3 rounded-sm hover:bg-surface-hover hover:text-on-surface transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Quay lại Tổng quan
          </Link>
        </div>
      </div>
    </div>
  );
}
