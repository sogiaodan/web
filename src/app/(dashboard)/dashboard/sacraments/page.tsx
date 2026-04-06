import { Metadata } from 'next';
import { serverFetch } from '@/lib/api-server';
import { GetMeResponse } from '@/lib/auth-api';
import { SacramentListResponse, MarriageListResponse, SacramentType } from '@/types/sacrament';
import { SacramentListClient } from './components/SacramentListClient';

export const metadata: Metadata = {
  title: 'Sổ Bí tích | Sổ Giáo Dân',
  description: 'Quản lý và tra cứu hồ sơ các bí tích đã lãnh nhận.',
};

export const runtime = 'edge';

export default async function SacramentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const rawType = (params.type as string) || 'BAPTISM';
  const type = ['BAPTISM', 'EUCHARIST', 'CONFIRMATION', 'MARRIAGE'].includes(rawType)
    ? (rawType as SacramentType)
    : 'BAPTISM';
  const search = (params.search as string) || '';
  const date_from = (params.date_from as string) || '';
  const date_to = (params.date_to as string) || '';

  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(date_from && { date_from }),
    ...(date_to && { date_to }),
  });

  if (type !== 'MARRIAGE') {
    query.set('type', type);
  }

  const endpoint = type === 'MARRIAGE'
    ? `/api/v1/sacraments/marriages?${query.toString()}`
    : `/api/v1/sacraments?${query.toString()}`;

  const [dataRes, meRes] = await Promise.all([
    serverFetch<SacramentListResponse | MarriageListResponse>(endpoint),
    serverFetch<GetMeResponse>('/api/v1/auth/me'),
  ]);

  const data = dataRes?.data;
  const user = meRes?.data?.user;
  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-on-surface mb-1">
            Sổ Bí tích
          </h1>
          <p className="text-on-surface-variant font-body text-sm">
            Quản lý và tra cứu hồ sơ các bí tích đã lãnh nhận.
          </p>
        </div>

        {/* List Client */}
        {data ? (
          <SacramentListClient
            canEdit={canEdit}
            items={data.items || []}
            total={data.pagination?.total || 0}
            page={page}
            limit={limit}
            activeTab={type}
          />
        ) : (
          <div className="bg-surface border border-outline rounded p-8 text-center text-on-surface-variant font-body mt-4">
            Không thể tải dữ liệu bí tích. Vui lòng thử lại sau.
          </div>
        )}
      </div>
    </div>
  );
}
