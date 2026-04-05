'use client';

import { Menu, Bell } from 'lucide-react';
import useSWR from 'swr';
import { ApiResponse } from '@/lib/auth-api';

export interface DashboardSummaryResponse {
  church_name: string;
  metrics: {
    total_parishioners: number;
    total_households: number;
  };
  activities: any[];
}

const fetcher = (url: string) => fetch(url).then(r => r.json()).then((res: ApiResponse<DashboardSummaryResponse>) => {
  if (res.status !== 200) throw new Error(res.message);
  return res.data;
});

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { data, isLoading } = useSWR('/api/v1/dashboard/summary', fetcher, {
    dedupingInterval: 30000,
    revalidateOnFocus: false,
  });

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-outline bg-surface px-4 shadow-sm lg:h-16 lg:px-8">
      <div className="flex items-center gap-x-3 lg:hidden flex-1 overflow-hidden">
        <button
          type="button"
          onClick={onMenuClick}
          className="-m-2.5 p-2.5 text-muted hover:text-foreground h-12 w-12 flex items-center justify-center shrink-0"
        >
          <span className="sr-only">Mở menu</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
        {isLoading ? (
          <div className="h-6 w-48 bg-outline/30 animate-pulse rounded"></div>
        ) : (
          <h1 className="font-serif text-lg font-bold text-foreground truncate max-w-full">
            {data?.church_name || 'Đang tải...'}
          </h1>
        )}
      </div>

      <div className="hidden lg:flex lg:flex-1 lg:items-center">
        {isLoading ? (
          <div className="h-7 w-96 bg-outline/30 animate-pulse rounded"></div>
        ) : (
          <h1 className="font-serif text-xl font-bold text-foreground truncate pr-4">
             {data?.church_name || 'Đang tải...'}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-x-4 lg:gap-x-6">
        <button
          type="button"
          className="relative rounded bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary h-[48px] w-[48px] lg:h-[32px] lg:w-[32px] flex items-center justify-center border border-primary/20 transition-colors duration-150"
        >
          <span className="sr-only">Xem thông báo</span>
          <Bell className="h-5 w-5 lg:h-4 lg:w-4" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
