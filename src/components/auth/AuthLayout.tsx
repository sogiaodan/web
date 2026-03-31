import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { BookOpen } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div
      className={cn(
        'relative flex min-h-screen flex-col items-center justify-center',
        // On mobile, background matches surface_container per specs. On desktop, it's Vellum.
        'bg-surface-container px-4 py-8 md:bg-vellum md:p-8 overflow-hidden',
        className
      )}
    >
      {/* Liturgical watermark (subtle archive seal) on mobile */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 md:hidden opacity-[0.03] text-foreground">
        <BookOpen className="h-[280px] w-[280px] -mb-16" strokeWidth={1} />
      </div>

      <div className="relative z-10 w-full max-w-[420px] flex-col items-center flex">
        {children}
      </div>
    </div>
  );
}
