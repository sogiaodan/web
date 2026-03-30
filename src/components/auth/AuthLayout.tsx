import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div
      className={cn(
        'flex min-h-screen flex-col items-center justify-center',
        // On mobile, background matches surface_container per specs. On desktop, it's Vellum.
        'bg-surface-container px-4 py-8 md:bg-vellum md:p-8',
        className
      )}
    >
      <div className="w-full max-w-[420px] flex-col items-center flex">
        {children}
      </div>
    </div>
  );
}
