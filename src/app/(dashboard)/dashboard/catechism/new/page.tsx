import { Metadata } from 'next';
import Link from 'next/link';
import { serverFetch } from '@/lib/api-server';
import { GetMeResponse } from '@/lib/auth-api';
import { redirect } from 'next/navigation';
import { CertificateForm } from '../components/CertificateForm';

export const metadata: Metadata = {
  title: 'Ghi nhận Chứng chỉ Giáo lý | Sổ Giáo Dân',
  description: 'Điền thông tin để lưu trữ hồ sơ chứng chỉ vào cơ sở dữ liệu của Giáo xứ.',
};

export const runtime = 'edge';

export default async function NewCertificatePage() {
  const meRes = await serverFetch<GetMeResponse>('/api/v1/auth/me');
  const user = meRes?.data?.user;
  const role = user?.role;

  if (role === 'VIEWER') {
    redirect('/dashboard/catechism');
  }

  const parishName = user?.church_name || 'Giáo xứ Thánh Mẫu Hạ Hồi';
  const isAdmin = role === 'ADMIN';

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
          <span className="text-on-surface font-medium">Ghi nhận chứng chỉ</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-[28px] md:text-4xl font-display font-bold text-on-surface mb-1">
            Ghi nhận Chứng chỉ Giáo lý
          </h1>
          <p className="text-on-surface-variant font-body text-sm">
            Vui lòng điền đầy đủ thông tin để lưu trữ hồ sơ chứng chỉ vào cơ sở dữ liệu của Giáo xứ.
          </p>
        </div>

        <CertificateForm
          mode="create"
          isViewer={false}
          isAdmin={isAdmin}
          parishName={parishName}
        />
      </div>
    </div>
  );
}
