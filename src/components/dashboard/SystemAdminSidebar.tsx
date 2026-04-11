'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Church,
  Settings,
  ShieldCheck,
  X,
  LogOut
} from 'lucide-react';
import clsx from 'clsx';
import { useSystemAdmin } from '@/components/providers/system-admin-provider';

const ADMIN_NAV_ITEMS = [
  { href: '/super-admin/dashboard', label: 'Tổng quan hệ thống', icon: LayoutDashboard },
  { href: '/super-admin/dashboard/churches', label: 'Quản trị Giáo xứ', icon: Church },
];

interface SystemAdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SystemAdminSidebar({ isOpen, onClose }: SystemAdminSidebarProps) {
  const pathname = usePathname();
  const { admin, logout } = useSystemAdmin();
  
  const getInitials = (name?: string) => {
    if (!name) return 'SA';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const SidebarContent = (
    <>
      <div className="flex h-16 shrink-0 items-center gap-3 px-6 pt-6 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded bg-primary text-white shadow-md">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-serif text-xl font-bold text-primary leading-tight">Hệ Thống</h1>
          <p className="text-[10px] uppercase tracking-widest text-muted font-bold">SUPER ADMIN</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col px-4 gap-y-1 overflow-y-auto mt-4">
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = item.href === '/super-admin/dashboard' 
            ? pathname === '/super-admin/dashboard' 
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'group flex items-center gap-x-3 px-3 py-3 lg:py-2.5 min-h-[48px] text-sm transition-all duration-150',
                isActive
                  ? 'bg-primary/5 text-primary font-semibold border-r-4 border-primary'
                  : 'text-muted hover:bg-hover-bg hover:text-foreground font-medium'
              )}
              onClick={() => onClose()}
            >
              <Icon
                className={clsx(
                  'h-5 w-5 shrink-0',
                  isActive ? 'text-primary' : 'text-muted group-hover:text-foreground'
                )}
                aria-hidden="true"
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col pt-4">
        <button
          onClick={logout}
          className="group flex items-center gap-x-3 px-7 py-3 text-sm font-medium text-muted hover:text-primary hover:bg-hover-bg transition-all duration-150"
        >
          <LogOut className="h-5 w-5" />
          Đăng xuất
        </button>
        <div className="flex items-center gap-x-4 border-t border-outline/50 bg-vellum/50 px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-white shrink-0 shadow-sm">
            {getInitials(admin?.name)}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-bold text-foreground leading-none mb-1">
              {admin?.name || 'Super Admin'}
            </span>
            <span className="truncate text-[10px] uppercase tracking-tighter text-primary font-bold">
              Quản trị toàn cầu
            </span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div 
        className={clsx(
          "fixed inset-0 z-40 bg-foreground/50 lg:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )} 
        onClick={onClose}
      />

      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-white border-r border-outline transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 h-dvh",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="absolute top-4 right-4 lg:hidden">
          <button 
            type="button" 
            className="p-2 min-h-[48px] min-w-[48px] inline-flex items-center justify-center text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            onClick={onClose}
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        {SidebarContent}
      </div>
    </>
  );
}
