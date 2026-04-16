'use client';

import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '@/lib/utils';

interface LoadingSectionProps {
  message?: string;
  className?: string;
  fullPage?: boolean;
}

export function LoadingSection({ 
  message = 'Đang tải dữ liệu...', 
  className,
  fullPage = false
}: LoadingSectionProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-4",
      fullPage ? "min-h-[70vh] w-full" : "py-12 w-full",
      className
    )}>
      <LoadingSpinner className="h-10 w-10 text-primary" />
      {message && (
        <p className="text-sm font-medium text-muted-foreground animate-pulse font-display text-center">
          {message}
        </p>
      )}
    </div>
  );
}
