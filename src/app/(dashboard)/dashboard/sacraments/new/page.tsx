import { Metadata } from 'next';
import { serverFetch } from '@/lib/api-server';
import { GetMeResponse } from '@/lib/auth-api';
import { redirect } from 'next/navigation';
import { NewSacramentClient } from './components/NewSacramentClient';

export const metadata: Metadata = {
  title: 'Ghi nhận Bí tích | Sổ Giáo Dân',
  description: 'Ghi nhận dữ liệu bí tích mới',
};

export const runtime = 'edge';

export default async function NewSacramentPage() {
  const meRes = await serverFetch<GetMeResponse>('/api/v1/auth/me');
  const role = meRes?.data?.user?.role;

  if (role === 'VIEWER') {
    redirect('/dashboard/sacraments');
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-on-surface mb-1">
            Ghi nhận Bí tích Mới
          </h1>
          <p className="text-on-surface-variant font-body text-sm">
            Điền thông tin để lưu trữ hồ sơ bí tích vào sổ giáo xứ.
          </p>
        </div>

        <NewSacramentClient />
      </div>
    </div>
  );
}
