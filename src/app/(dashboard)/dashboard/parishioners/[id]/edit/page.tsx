import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { serverFetch } from '@/lib/api-server';
import { GetMeResponse } from '@/lib/auth-api';
import { ParishionerDetail } from '@/types/parishioner';
import { ParishionerForm } from '../../components/ParishionerForm';

export const metadata: Metadata = {
  title: 'Chỉnh sửa Giáo dân | Sổ Giáo Dân',
  description: 'Cập nhật thông tin hồ sơ giáo dân trong hệ thống Sổ Giáo Dân.',
};

export const runtime = 'edge';

export default async function EditParishionerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [parishionerRes, meRes] = await Promise.all([
    serverFetch<ParishionerDetail>(`/api/v1/parishioners/${id}`),
    serverFetch<GetMeResponse>('/api/v1/auth/me'),
  ]);

  const parishioner = parishionerRes?.data;
  const user = meRes?.data?.user;

  // 404 if not found
  if (!parishioner) notFound();

  // Role guard: only ADMIN and EDITOR can edit
  if (!user || (user.role !== 'ADMIN' && user.role !== 'EDITOR')) {
    redirect(`/dashboard/parishioners/${id}`);
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href={`/dashboard/parishioners/${id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-[#1C1917] hover:text-primary transition-colors mb-6 group font-body"
        >
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </span>
          Chi tiết: {parishioner.full_name}
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-[0.15em] font-body mb-1">
            Giáo dân &rsaquo; Chỉnh sửa
          </p>
          <h1 className="text-3xl md:text-[36px] font-display font-bold text-primary mb-1">
            Chỉnh sửa hồ sơ
          </h1>
          <p className="text-sm font-body text-[#78716C]">
            Cập nhật thông tin hồ sơ của{' '}
            <span className="font-semibold text-[#1C1917]">
              {[parishioner.christian_name, parishioner.full_name].filter(Boolean).join(' ')}
            </span>
          </p>
        </div>

        {/* Pre-populated Form */}
        <ParishionerForm initialData={parishioner} isEdit={true} />
      </div>
    </div>
  );
}
