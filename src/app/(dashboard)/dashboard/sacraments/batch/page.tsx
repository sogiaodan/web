import { Metadata } from 'next';
import { serverFetch } from '@/lib/api-server';
import { GetMeResponse } from '@/lib/auth-api';
import { redirect } from 'next/navigation';
import { BatchSacramentClient } from './components/BatchSacramentClient';

export const metadata: Metadata = {
  title: 'Nhập hàng loạt Bí tích | Sổ Giáo Dân',
  description: 'Ghi nhận dữ liệu bí tích hàng loạt',
};

export const runtime = 'edge';

export default async function BatchSacramentPage() {
  const meRes = await serverFetch<GetMeResponse>('/api/v1/auth/me');
  const role = meRes?.data?.user?.role;

  if (role === 'VIEWER') {
    redirect('/dashboard/sacraments');
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-surface-container">
      <BatchSacramentClient />
    </div>
  );
}
