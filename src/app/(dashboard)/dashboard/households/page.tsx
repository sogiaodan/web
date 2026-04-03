import { Metadata } from 'next';
import { Suspense } from 'react';
import { serverFetch } from '@/lib/api-server';
import { HouseholdFilterBar } from './components/HouseholdFilterBar';
import { HouseholdTable } from './components/HouseholdTable';
import { HouseholdSummaryCards } from './components/HouseholdSummaryCards';

export const metadata: Metadata = {
  title: 'Danh sách Hộ giáo | Sổ Giáo Dân',
};

export default async function HouseholdsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const zone_id = params.zone_id as string || '';
  const status = params.status as string || '';
  const search = params.search as string || '';

  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(zone_id && { zone_id }),
    ...(status && { status }),
    ...(search && { search }),
  });

  // Fetch data
  const [householdsRes, zonesRes] = await Promise.all([
    serverFetch(`/api/v1/households?${query.toString()}`),
    serverFetch('/api/v1/zones')
  ]);

  const householdData = householdsRes?.data;
  const zonesData = zonesRes?.data || [];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-background-light">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="text-4xl font-display font-bold text-primary mb-2">Danh sách Hộ giáo</h2>
            <p className="text-on-surface-variant font-body">Quản lý thông tin hộ gia đình trong giáo xứ</p>
          </div>
          <button className="bg-primary text-white px-6 py-3 rounded shadow-sm flex items-center gap-2 font-bold hover:opacity-90 transition-all active:scale-95">
            <span className="material-symbols-outlined text-lg">add_circle</span>
            <span>Tạo Hộ giáo mới</span>
          </button>
        </div>

        <HouseholdFilterBar zones={zonesData} />

        {householdData ? (
          <HouseholdTable 
            households={householdData.items || []} 
            total={householdData.pagination?.total || 0}
            page={page}
            limit={limit}
          />
        ) : (
          <div className="bg-surface border border-outline rounded p-8 text-center text-on-surface-variant">
            Không thể tải dữ liệu hộ giáo. Vui lòng thử lại sau.
          </div>
        )}

        {householdData?.stats && (
          <HouseholdSummaryCards stats={householdData.stats} />
        )}
      </div>
    </div>
  );
}
