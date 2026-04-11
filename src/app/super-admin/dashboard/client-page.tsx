'use client';

import MetricCard from '@/components/dashboard/MetricCard';
import { Church, ShieldCheck, Activity, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useSystemAdminStatsQuery } from '@/lib/queries/useSystemAdminQueries';

function MetricCardSkeleton() {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-sm border border-outline bg-surface p-6 shadow-sm min-h-32 min-w-48 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2 w-full">
          <div className="h-3 w-24 bg-outline/60 rounded" />
          <div className="h-10 w-16 bg-outline/40 rounded mt-1" />
        </div>
        <div className="h-6 w-6 bg-outline/40 rounded" />
      </div>
    </div>
  );
}

export default function SystemAdminDashboardPage() {
  const { data: stats, isLoading } = useSystemAdminStatsQuery();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Tổng Quan Hệ Thống</h1>
          <p className="text-muted mt-1 italic font-medium">Báo cáo trạng thái vận hành các thực thể giáo xứ toàn cầu.</p>
        </div>
        
        <Link
          href="/super-admin/dashboard/churches"
          className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-0.5 active:translate-y-0 group min-h-[48px] w-full sm:w-auto"
        >
          <PlusCircle className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
          ONBOARD GIÁO XỨ MỚI
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              label="TỔNG GIÁO XỨ"
              value={stats?.total_churches ?? 0}
              href="/super-admin/dashboard/churches"
              icon={Church}
            />
            <MetricCard
              label="TRẠNG THÁI CENTRAL"
              value={stats?.system_status ?? 'OFF'}
              href="#"
              icon={ShieldCheck}
            />
            <MetricCard
              label="YÊU CẦU CHỜ"
              value={stats?.pending_contact_requests ?? 0}
              href="#"
              icon={Activity}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-outline p-8 rounded-sm shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none">
            <ShieldCheck className="h-48 w-48" />
          </div>
          
          <h2 className="font-serif text-xl font-bold text-primary mb-6 flex items-center gap-2">
            Thông Báo Hệ Thống
          </h2>
          
          <div className="space-y-6">
            <div className="flex gap-4 p-4 bg-vellum/50 border-l-4 border-primary/20 rounded-r">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                    <p className="text-sm font-bold text-foreground leading-none mb-1">Cấu hình Global JWT hoàn tất</p>
                    <p className="text-xs text-muted">Hệ thống đã chuyển sang sử dụng SUPER_ADMIN_JWT_SECRET độc lập.</p>
                </div>
            </div>
            {stats && (
              <div className="flex gap-4 p-4 bg-vellum/50 border-l-4 border-green-400/40 rounded-r">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-foreground leading-none mb-1">
                    {stats.active_churches} / {stats.total_churches} giáo xứ đang hoạt động
                  </p>
                  <p className="text-xs text-muted">
                    {stats.total_users} tài khoản quản lý trên toàn hệ thống.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-outline p-8 rounded-sm shadow-sm">
            <h2 className="font-serif text-xl font-bold text-primary mb-6">
                Hướng Dẫn Onboarding
            </h2>
            <ul className="space-y-4">
                <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
                    <p className="text-sm text-foreground">Truy cập vào mục <strong>Quản trị Giáo xứ</strong>.</p>
                </li>
                <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">2</span>
                    <p className="text-sm text-foreground">Điền thông tin giáo xứ và <strong>Schema Name</strong> (duy nhất).</p>
                </li>
                <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">3</span>
                    <p className="text-sm text-foreground">Hệ thống sẽ tự động khởi tạo cơ sở dữ liệu và tài khoản Admin giáo xứ.</p>
                </li>
            </ul>
        </div>
      </div>
    </div>
  );
}
