import { Metadata } from 'next';
import { serverFetch } from '@/lib/api-server';
import { GetMeResponse } from '@/lib/auth-api';
import { notFound } from 'next/navigation';
import { SacramentDetailClient } from './components/SacramentDetailClient';
import { SacramentListItem, SacramentType } from '@/types/sacrament';

export const metadata: Metadata = {
  title: 'Chi tiết Bí tích | Sổ Giáo Dân',
  description: 'Chi tiết hồ sơ bí tích đã lãnh nhận.',
};

export const runtime = 'edge';

export default async function SacramentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const [dataRes, meRes] = await Promise.all([
    serverFetch<SacramentListItem>(`/api/v1/sacraments/${id}`),
    serverFetch<GetMeResponse>('/api/v1/auth/me'),
  ]);

  if (!dataRes?.data) {
    notFound();
  }

  const sacrament = dataRes.data;
  const role = meRes?.data?.user?.role;
  const canEdit = role === 'ADMIN' || role === 'EDITOR';

  const initialData = {
    parishioner_id: sacrament.parishioner.id,
    date: sacrament.date || '',
    place: '', // Place not stored in basic ListItem type, assume it's in full detail response
    minister_id: sacrament.minister?.id || '',
    godparent_name: sacrament.godparent_name || '',
    book_no: sacrament.book_no || '',
    page_no: sacrament.page_no || '',
    registry_number: sacrament.registry_number || '',
    note: '',
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-on-surface mb-1">
            {canEdit ? 'Chỉnh sửa Bí tích' : 'Chi tiết Bí tích'}
          </h1>
          <p className="text-on-surface-variant font-body text-sm">
            Hồ sơ Bí tích của: <span className="font-bold">{sacrament.parishioner.christian_name} {sacrament.parishioner.full_name}</span>
          </p>
        </div>

        <SacramentDetailClient
          sacrament={sacrament}
          canEdit={canEdit}
        />
      </div>
    </div>
  );
}
