'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { Users, Home, RefreshCcw, Map, ShieldCheck } from 'lucide-react';
import MetricCard from '@/components/dashboard/MetricCard';
import OnboardingState from '@/components/dashboard/OnboardingState';
import { DashboardSummaryResponse } from '@/components/dashboard/DashboardHeader';



export default function DashboardOverviewPage() {
  const { data, error, isLoading, refetch: mutate } = useQuery({
    queryKey: ['dashboard_summary'],
    queryFn: () => apiFetch<DashboardSummaryResponse>('/api/v1/dashboard/summary'),
    staleTime: 30000,
  });

  // Handle Loading state with skeleton
  const isActuallyLoading = isLoading && !data;

  // Detect empty state (onboarding case)
  // Dashboard is empty if there are no households explicitly created.
  const isEmpty = data && data.metrics.total_households === 0;

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="rounded-full bg-red-50 p-4 mb-4">
          <RefreshCcw className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-serif font-bold text-foreground mb-2">Không thể tải dữ liệu</h2>
        <p className="text-muted text-sm max-w-md mb-6">
          Đã xảy ra lỗi trong quá trình lấy thông tin tổng quan. Vui lòng thử lại sau.
        </p>
        <button
          onClick={() => mutate()}
          className="inline-flex items-center justify-center rounded-sm bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors min-h-[44px]"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // If no data yet, show onboarding state
  if (!isLoading && isEmpty && data) {
    return <OnboardingState mutate={mutate} metrics={data.metrics} />;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1200px] mx-auto w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {isActuallyLoading ? (
          <>
            <div className="h-32 rounded-sm border border-outline bg-surface p-6 shadow-sm animate-pulse w-full"></div>
            <div className="h-32 rounded-sm border border-outline bg-surface p-6 shadow-sm animate-pulse w-full"></div>
            <div className="h-32 rounded-sm border border-outline bg-surface p-6 shadow-sm animate-pulse w-full"></div>
            <div className="h-32 rounded-sm border border-outline bg-surface p-6 shadow-sm animate-pulse w-full"></div>
          </>
        ) : (
          <>
            <MetricCard
              label="TỔNG SỐ GIÁO DÂN"
              value={data?.metrics.total_parishioners || 0}
              href="/dashboard/parishioners"
              icon={Users}
            />
            <MetricCard
              label="HỘ GIÁO"
              value={data?.metrics.total_households || 0}
              href="/dashboard/households"
              icon={Home}
            />
            <MetricCard
              label="GIÁO KHU"
              value={data?.metrics.total_zones || 0}
              href="/dashboard/zones"
              icon={Map}
            />
            <MetricCard
              label="HỘI ĐOÀN"
              value={data?.metrics.total_parish_groups || 0}
              href="/dashboard/parish-groups"
              icon={ShieldCheck}
            />
          </>
        )}
      </div>
    </div>
  );
}

