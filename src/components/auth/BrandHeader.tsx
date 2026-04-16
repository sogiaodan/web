import Image from 'next/image';
import { cn } from '@/lib/utils';

export function BrandHeader({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center', className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary overflow-hidden bg-white shadow-md mb-4 relative">
        <Image 
          src="/brand/icon-512.png" 
          alt="Logo" 
          fill 
          sizes="64px"
          className="object-contain" 
        />
      </div>
      <h1 className="font-serif text-[20px] font-bold tracking-tight text-foreground md:text-[24px]">
        Sổ Giáo Dân
      </h1>
      <p className="mt-1 font-sans text-[10px] font-medium tracking-[0.15em] text-outline-variant md:text-[12px]">
        HỆ THỐNG QUẢN TRỊ GIÁO XỨ
      </p>
    </div>
  );
}
