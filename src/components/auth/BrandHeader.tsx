import { Book } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BrandHeader({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center', className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary text-primary mb-3">
        <Book className="h-5 w-5" />
      </div>
      <h1 className="font-serif text-[20px] font-bold tracking-tight text-foreground md:text-[24px]">
        Sổ Giáo Dân
      </h1>
      <p className="mt-1 font-sans text-[10px] font-medium tracking-[0.15em] text-outline-variant md:text-[12px]">
        PARISH MANAGEMENT SYSTEM
      </p>
    </div>
  );
}
