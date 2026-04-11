'use client';

import { Menu, ShieldCheck } from 'lucide-react';

interface SystemAdminHeaderProps {
  onMenuClick: () => void;
}

export default function SystemAdminHeader({ onMenuClick }: SystemAdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-outline bg-white px-4 shadow-sm lg:h-16 lg:px-8">
      <div className="flex items-center gap-x-3 lg:hidden flex-1 overflow-hidden">
        <button
          type="button"
          onClick={onMenuClick}
          className="-m-2.5 p-2.5 text-muted hover:text-foreground h-12 w-12 flex items-center justify-center shrink-0"
        >
          <span className="sr-only">Mở menu</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h1 className="font-serif text-lg font-bold text-foreground truncate max-w-full">
                Hệ Thống SGD
            </h1>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 lg:items-center">
        <h1 className="font-serif text-xl font-bold text-foreground pr-4 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Bảng Quản Trị Hệ Thống Global
        </h1>
      </div>

      <div className="flex items-center gap-x-4 lg:gap-x-6">
        <div className="hidden sm:block text-right">
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Trạng thái hệ thống</p>
            <p className="text-xs text-green-600 font-medium">Hoạt động bình thường</p>
        </div>
      </div>
    </header>
  );
}
