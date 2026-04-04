import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/api-server';
import { GetMeResponse } from '@/lib/auth-api';
import { ZoneDetail } from '@/types/zone';

import { ZoneDetailHeader } from './components/ZoneDetailHeader';
import { ZoneInfoCard } from './components/ZoneInfoCard';
import { ZoneStatCards } from './components/ZoneStatCards';
import { ZoneParishionerTable } from './components/ZoneParishionerTable';

export const metadata: Metadata = {
  title: 'Chi tiết Giáo khu | Sổ Giáo Dân',
};

export const runtime = 'edge';

export default async function ZoneDetailPage({ 
  params,
  searchParams,
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params;
  const sParams = await searchParams;
  const page = Number(sParams.page) || 1;
  const limit = Number(sParams.limit) || 10;
  
  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const [zoneRes, meRes] = await Promise.all([
    serverFetch<ZoneDetail>(`/api/v1/zones/${id}?${query.toString()}`),
    serverFetch<GetMeResponse>('/api/v1/auth/me')
  ]);

  const zone = zoneRes?.data;
  if (!zone) {
    notFound();
  }

  const user = meRes?.data?.user;
  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-7xl mx-auto">
        <ZoneDetailHeader id={zone.id} name={zone.name} canEdit={canEdit} />

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-3/5">
            <ZoneInfoCard head={zone.head} description={zone.description} />
          </div>
          <div className="w-full md:w-2/5">
            <ZoneStatCards 
              totalParishioners={zone.stats?.total_parishioners || 0} 
              totalHouseholds={zone.stats?.total_households || 0} 
            />
          </div>
        </div>

        <ZoneParishionerTable 
          zoneId={zone.id}
          items={zone.parishioners?.items || []}
          total={zone.parishioners?.pagination?.total || 0}
          page={page}
          limit={limit}
        />
      </div>
    </div>
  );
}
