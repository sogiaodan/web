import { Metadata } from 'next';
import { serverFetch } from '@/lib/api-server';
import { ZoneSummaryWidgets } from './components/ZoneSummaryWidgets';
import { ZoneTable } from './components/ZoneTable';
import Link from 'next/link';
import { ZoneListResponse } from '@/types/zone';
import { GetMeResponse } from '@/lib/auth-api';

import { ZoneHeader } from './components/ZoneHeader';
import { EmptyZoneState } from './components/EmptyZoneState';

export const metadata: Metadata = {
  title: 'Danh sách Giáo khu | Sổ Giáo Dân',
};

export const runtime = 'edge';

import { Suspense } from 'react';
import LoadingZones from './loading';

async function ZoneContent() {
  const [zonesRes, meRes] = await Promise.all([
    serverFetch<ZoneListResponse>('/api/v1/zones'),
    serverFetch<GetMeResponse>('/api/v1/auth/me')
  ]);

  const zoneData = zonesRes?.data;
  const user = meRes?.data?.user;
  
  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const churchName = user?.church_name || 'Đa Minh';

  if (!zoneData) {
    return (
      <div className="bg-surface border border-outline rounded p-8 text-center text-on-surface-variant font-body mt-4">
        Không thể tải dữ liệu giáo khu. Vui lòng thử lại sau.
      </div>
    );
  }

  return (
    <>
      {zoneData.stats && (
        <ZoneSummaryWidgets 
          totalZones={zoneData.stats.total_zones} 
          totalMembers={zoneData.stats.total_zone_members} 
        />
      )}

      {zoneData.items && zoneData.items.length > 0 ? (
        <ZoneTable 
          zones={zoneData.items} 
          churchName={churchName}
        />
      ) : (
        <EmptyZoneState canEdit={canEdit} />
      )}
    </>
  );
}

export default async function ZonesPage() {
  // We keep ZoneHeader outside Suspense because it's mostly static UI
  // though it does have a 'canEdit' logic. For simplicity, we can wrap the whole thing.
  
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-7xl mx-auto text-on-surface">
        <ZoneHeader canEdit={true} />

        <Suspense fallback={<LoadingZones />}>
          <ZoneContent />
        </Suspense>
      </div>
    </div>
  );
}
