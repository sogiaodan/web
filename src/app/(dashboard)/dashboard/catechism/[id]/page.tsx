import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/api-server';
import { GetMeResponse } from '@/lib/auth-api';
import { CertificateDetail } from '@/types/catechism';
import { CertificateForm } from '../components/CertificateForm';

export const metadata: Metadata = {
  title: 'Chi tiết Chứng chỉ Giáo lý | Sổ Giáo Dân',
  description: 'Xem và chỉnh sửa thông tin chứng chỉ giáo lý.',
};

export const runtime = 'edge';

export default async function CertificateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [certRes, meRes] = await Promise.all([
    serverFetch<CertificateDetail>(`/api/v1/catechism-certificates/${id}`),
    serverFetch<GetMeResponse>('/api/v1/auth/me'),
  ]);

  if (!certRes?.data) {
    notFound();
  }

  const cert = certRes.data;
  const user = meRes?.data?.user;
  const role = user?.role;
  const isViewer = role === 'VIEWER';
  const isAdmin = role === 'ADMIN';
  const parishName = user?.church_name || 'Giáo xứ Thánh Mẫu Hạ Hồi';

  const titleSuffix =
    cert.certificate_type === 'RCIA'
      ? 'Giáo lý Dự tòng (RCIA)'
      : 'Giáo lý Hôn nhân';

  const fullName = `${cert.parishioner.christian_name ? cert.parishioner.christian_name + ' ' : ''}${cert.parishioner.full_name}`;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm font-body text-on-surface-variant mb-6">
          <Link
            href="/dashboard/catechism"
            className="hover:text-primary transition-colors focus-visible:ring-1 focus-visible:ring-primary rounded outline-none"
          >
            Chứng chỉ
          </Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface font-medium truncate max-w-[200px]">{fullName}</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-[28px] md:text-4xl font-display font-bold text-on-surface mb-1">
            {isViewer ? 'Xem Chứng chỉ' : 'Chỉnh sửa Chứng chỉ'}
          </h1>
          <p className="text-on-surface-variant font-body text-sm">
            {titleSuffix} — {fullName}
          </p>
        </div>

        <CertificateForm
          mode="edit"
          initialData={cert}
          isViewer={isViewer}
          isAdmin={isAdmin}
          parishName={parishName}
        />
      </div>
    </div>
  );
}
