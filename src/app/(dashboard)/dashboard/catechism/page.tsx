import { Metadata } from 'next';
import { serverFetch } from '@/lib/api-server';
import { GetMeResponse } from '@/lib/auth-api';
import { CertificateListResponse, CertificateType } from '@/types/catechism';
import { CertificateListClient } from './components/CertificateListClient';

export const metadata: Metadata = {
  title: 'Chứng chỉ Giáo lý | Sổ Giáo Dân',
  description: 'Lưu trữ và quản lý hồ sơ hoàn thành các khóa học giáo lý chuyên biệt trong giáo xứ.',
};

export const runtime = 'edge';

export default async function CatechismPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const rawType = (params.type as string) || 'RCIA';
  const type: CertificateType =
    rawType === 'MARRIAGE_PREP' ? 'MARRIAGE_PREP' : 'RCIA';
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

  const [dataRes, meRes] = await Promise.all([
    serverFetch<CertificateListResponse>(`/api/v1/catechism-certificates?${query.toString()}`),
    serverFetch<GetMeResponse>('/api/v1/auth/me'),
  ]);

  const data = dataRes?.data;
  const user = meRes?.data?.user;
  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light relative">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-[28px] md:text-4xl font-display font-bold text-on-surface mb-1">
            Chứng chỉ Giáo lý
          </h1>
          <p className="text-on-surface-variant font-body text-sm">
            Lưu trữ và quản lý hồ sơ hoàn thành các khóa học giáo lý chuyên biệt trong giáo xứ.
          </p>
          {/* Mobile CTA (below subtitle) */}
          {canEdit && (
            <div className="mt-4 md:hidden">
              <a
                href="/dashboard/catechism/new"
                className="inline-flex items-center gap-2 bg-primary text-white px-4 h-12 rounded-sm font-bold text-sm hover:bg-primary/90 transition-colors w-full justify-center min-h-[48px]"
              >
                + Ghi nhận Chứng chỉ
              </a>
            </div>
          )}
        </div>

        {data ? (
          <CertificateListClient
            canEdit={canEdit}
            isAdmin={isAdmin}
            items={data.items || []}
            total={data.pagination?.total || 0}
            page={page}
            limit={limit}
            activeTab={type}
          />
        ) : (
          <div className="bg-surface border border-outline rounded-sm p-8 text-center text-on-surface-variant font-body mt-4">
            Không thể tải dữ liệu chứng chỉ. Vui lòng thử lại sau.
          </div>
        )}
      </div>
    </div>
  );
}
