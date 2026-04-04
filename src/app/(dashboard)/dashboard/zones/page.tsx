import { Metadata } from 'next';
import { serverFetch } from '@/lib/api-server';
import { ZoneSummaryWidgets } from './components/ZoneSummaryWidgets';
import { ZoneTable } from './components/ZoneTable';
import Link from 'next/link';
import { ZoneListResponse } from '@/types/zone';
import { GetMeResponse } from '@/lib/auth-api';

export const metadata: Metadata = {
  title: 'Danh sách Giáo khu | Sổ Giáo Dân',
};

export const runtime = 'edge';

export default async function ZonesPage() {
  // Fetch data
  const [zonesRes, meRes] = await Promise.all([
    serverFetch<ZoneListResponse>('/api/v1/zones'),
    serverFetch<GetMeResponse>('/api/v1/auth/me')
  ]);

  const zoneData = zonesRes?.data;
  const user = meRes?.data?.user;
  
  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const churchName = user?.church_name || 'Đa Minh';

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="text-4xl font-display font-bold text-on-surface mb-2">Danh sách Giáo khu — Giáo xứ {churchName}</h2>
          </div>
        </div>

        {zoneData?.stats && (
          <ZoneSummaryWidgets 
            totalZones={zoneData.stats.total_zones} 
            totalMembers={zoneData.stats.total_zone_members} 
          />
        )}

        {canEdit && (
          <div className="flex justify-end mb-6">
            <Link 
              href="/dashboard/zones/create"
              className="bg-primary text-white w-full md:w-auto px-6 py-3 rounded shadow-sm flex items-center justify-center gap-2 font-bold hover:opacity-90 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>Thêm Giáo khu mới</span>
            </Link>
          </div>
        )}

        {zoneData ? (
          <ZoneTable 
            zones={zoneData.items || []} 
            churchName={churchName}
          />
        ) : (
          <div className="bg-surface border border-outline rounded p-8 text-center text-on-surface-variant">
            Không thể tải dữ liệu giáo khu. Vui lòng thử lại sau.
          </div>
        )}
      </div>
    </div>
  );
}
