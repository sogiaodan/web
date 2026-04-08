import { Metadata } from 'next';
import { serverFetch } from '@/lib/api-server';
import { CertificateListResponse, CertificateType } from '@/types/catechism';
import { CertificateListClient } from './components/CertificateListClient';
import { Suspense } from 'react';
import LoadingCatechism from './loading';

export const metadata: Metadata = {
  title: 'Chứng chỉ Giáo lý | Sổ Giáo Dân',
  description: 'Lưu trữ và quản lý hồ sơ hoàn thành các khóa học giáo lý chuyên biệt trong giáo xứ.',
};

export const runtime = 'edge';

async function CatechismContent({ searchParams }: { searchParams: any }) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const rawType = (params.type as string) || 'MARRIAGE_PREP';
  const type: CertificateType =
    rawType === 'RCIA' ? 'RCIA' : 'MARRIAGE_PREP';
  const search = (params.search as string) || '';
  const date_from = (params.date_from as string) || '';
  const date_to = (params.date_to as string) || '';

  const query = new URLSearchParams({
    type,
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(date_from && { date_from }),
    ...(date_to && { date_to }),
  });

  const dataRes = await serverFetch<CertificateListResponse>(`/api/v1/catechism-certificates?${query.toString()}`);
  const data = dataRes?.data;

  if (!data) {
    return (
      <div className="bg-surface border border-outline rounded-sm p-8 text-center text-on-surface-variant font-body mt-4">
        Không thể tải dữ liệu chứng chỉ. Vui lòng thử lại sau.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] md:text-4xl font-display font-bold mb-1">
            Chứng chỉ Giáo lý
          </h1>
          <p className="text-on-surface-variant font-body text-sm">
            Lưu trữ và quản lý hồ sơ hoàn thành các khóa học giáo lý chuyên biệt trong giáo xứ.
          </p>
        </div>
      </div>

      <CertificateListClient
        items={data.items || []}
        total={data.pagination?.total || 0}
        page={page}
        limit={limit}
        activeTab={type}
      />
    </>
  );
}

export default async function CatechismPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light text-on-surface">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<LoadingCatechism />}>
          <CatechismContent searchParams={params} />
        </Suspense>
      </div>
    </div>
  );
}
