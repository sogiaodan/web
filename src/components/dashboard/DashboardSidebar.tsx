'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Home,
  BookOpen,
  Map,
  Settings,
  Church,
  X,
  Scroll,
  ShieldCheck
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/components/providers/auth-provider';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/dashboard/parishioners', label: 'Danh sách Giáo dân', icon: Users },
  { href: '/dashboard/households', label: 'Hộ giáo', icon: Home },
  { href: '/dashboard/sacraments', label: 'Bí tích', icon: BookOpen },
  { href: '/dashboard/catechism', label: 'Chứng chỉ', icon: Scroll },
  { href: '/dashboard/zones', label: 'Giáo khu', icon: Map },
  { href: '/dashboard/parish-groups', label: 'Hội đoàn', icon: ShieldCheck },
];

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAccountPanel?: () => void;
}

export default function DashboardSidebar({ isOpen, onClose, onOpenAccountPanel }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'Quản trị viên';
      case 'EDITOR': return 'Biên tập viên';
      case 'VIEWER': return 'Người xem';
      default: return 'Người dùng';
    }
  };

  const SidebarContent = (
    <>
      <div className="flex h-16 shrink-0 items-center gap-3 px-6 pt-6 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded bg-primary text-white">
          <Church className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-serif text-xl font-bold text-primary">Sổ Giáo Dân</h1>
          <p className="text-xs text-muted">Hệ thống quản trị</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col px-4 gap-y-1 overflow-y-auto mt-4">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'group flex items-center gap-x-3 px-3 py-3 lg:py-2.5 min-h-[48px] text-sm transition-all duration-150',
                isActive
                  ? 'bg-[#FAF6F6] text-primary font-semibold border-r-4 border-primary'
                  : 'text-muted hover:bg-hover-bg hover:text-foreground font-medium'
              )}
              onClick={() => onClose()}
            >
              <Icon
                className={clsx(
                  'h-5 w-5 shrink-0',
                  isActive ? 'fill-primary/10 text-primary' : 'text-muted group-hover:text-foreground'
                )}
                aria-hidden="true"
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col pt-4">
        <Link
          href="/settings"
          onClick={() => onClose()}
          className={clsx(
            'group flex items-center gap-x-3 px-7 py-3 text-sm font-medium transition-duration-150',
            pathname.startsWith('/settings')
              ? 'bg-[#FAF6F6] text-primary font-semibold border-r-4 border-primary'
              : 'text-primary hover:bg-hover-bg'
          )}
        >
          <Settings 
            className={clsx(
              'h-5 w-5',
              pathname.startsWith('/settings') ? 'fill-primary/10 text-primary' : ''
            )} 
          />
          Cài đặt
        </Link>
        <button 
          onClick={onOpenAccountPanel}
          className="flex items-center gap-x-4 border-t border-outline/50 bg-vellum/50 px-6 py-4 hover:bg-hover-bg transition-colors text-left w-full outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-white shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-bold text-foreground">
              {user?.name || 'Người dùng'}
            </span>
            <span className="truncate text-xs text-muted">
              {getRoleLabel(user?.role)}
            </span>
          </div>
        </button>
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
        "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-surface border-r border-outline transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 h-dvh",
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
