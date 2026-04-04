import { Metadata } from 'next';
import { serverFetch } from '@/lib/api-server';
import { GetMeResponse } from '@/lib/auth-api';
import { ParishionerListResponse } from '@/types/parishioner';
import { ZoneListResponse } from '@/types/zone';
import { ParishionerListClient } from './components/ParishionerListClient';
import { ParishionerSummaryCards } from './components/ParishionerSummaryCards';

export const metadata: Metadata = {
  title: 'Danh sách Giáo dân | Sổ Giáo Dân',
  description: 'Quản lý và tra cứu thông tin chi tiết của các tín hữu trong giáo xứ.',
};

export const runtime = 'edge';

export default async function ParishionersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const search = (params.search as string) || '';
  const zone_id = (params.zone_id as string) || '';
  const gender = (params.gender as string) || '';
  const status = (params.status as string) || '';
  const marital_status = (params.marital_status as string) || '';
  const age_min = (params.age_min as string) || '';
  const age_max = (params.age_max as string) || '';
  const christian_name = (params.christian_name as string) || '';

  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(zone_id && { zone_id }),
    ...(gender && { gender }),
    ...(status && { status }),
    ...(marital_status && { marital_status }),
    ...(age_min && { age_min }),
    ...(age_max && { age_max }),
    ...(christian_name && { christian_name }),
  });

  const [parishionersRes, zonesRes, meRes] = await Promise.all([
    serverFetch<ParishionerListResponse>(`/api/v1/parishioners?${query.toString()}`),
    serverFetch<ZoneListResponse>('/api/v1/zones'),
    serverFetch<GetMeResponse>('/api/v1/auth/me'),
  ]);

  const parishionerData = parishionersRes?.data;
  const zones = zonesRes?.data?.items || [];
  const user = meRes?.data?.user;
  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">

          <h1 className="text-3xl md:text-4xl font-display font-bold text-on-surface mb-1">
            Danh sách Giáo dân
          </h1>
          <p className="text-on-surface-variant font-body text-sm">
            Quản lý và tra cứu thông tin chi tiết của các tín hữu trong giáo xứ.
          </p>
        </div>

        {/* List client: FilterBar + AdvancedFilterDrawer + Table + QuickPreviewDrawer wired together */}
        {parishionerData ? (
          <ParishionerListClient
            zones={zones}
            canEdit={canEdit}
            items={parishionerData.items || []}
            total={parishionerData.pagination?.total || 0}
            page={page}
            limit={limit}
          />
        ) : (
          <div className="bg-surface border border-outline rounded p-8 text-center text-on-surface-variant font-body mt-4">
            Không thể tải dữ liệu giáo dân. Vui lòng thử lại sau.
          </div>
        )}

        {/* Summary Cards */}
        {parishionerData?.stats && (
          <ParishionerSummaryCards stats={parishionerData.stats} />
        )}
      </div>
    </div>
  );
}
