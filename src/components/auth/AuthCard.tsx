import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function AuthCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        // Mobile: borders merge into the background or card goes flush.
        // Desktop: tonal container, outline, 2px border radius, no shadow.
        'relative w-full overflow-hidden rounded-none md:rounded-[2px]',
        'bg-surface-container md:bg-surface-container-low',
        'border-0 md:border md:border-outline-variant shadow-none',
        'px-6 py-8 md:p-10',
        className
      )}
    >
      {children}
    </div>
  );
}
