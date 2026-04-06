import { Metadata } from 'next';
import { serverFetch } from '@/lib/api-server';
import { GetMeResponse } from '@/lib/auth-api';
import { notFound } from 'next/navigation';
import { MarriageForm } from '../../new/components/MarriageForm';
import { MarriageListItem } from '@/types/sacrament';

export const metadata: Metadata = {
  title: 'Chi tiết Hôn phối | Sổ Giáo Dân',
  description: 'Chi tiết hồ sơ Hôn phối.',
};

export const runtime = 'edge';

export default async function MarriageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const [dataRes, meRes] = await Promise.all([
    serverFetch<MarriageListItem>(`/api/v1/sacraments/marriages/${id}`),
    serverFetch<GetMeResponse>('/api/v1/auth/me'),
  ]);

  if (!dataRes?.data) {
    notFound();
  }

  const marriage = dataRes.data;
  const role = meRes?.data?.user?.role;
  const canEdit = role === 'ADMIN' || role === 'EDITOR';

  const initialData = {
    husband_id: marriage.husband.id,
    wife_id: marriage.wife.id,
    marriage_date: marriage.marriage_date || '',
    place: (marriage as any).place || '',
    status: marriage.status || 'VALID',
    witness_1_name: marriage.witness_1_name || '',
    witness_2_name: marriage.witness_2_name || '',
    minister_id: marriage.minister?.id || '',
    book_no: marriage.book_no || '',
    page_no: marriage.page_no || '',
    registry_number: marriage.registry_number || '',
    note: '',
    is_mixed_religion: marriage.is_mixed_religion || false,
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-on-surface mb-1">
            {canEdit ? 'Chỉnh sửa Hôn phối' : 'Chi tiết Hôn phối'}
          </h1>
          <p className="text-on-surface-variant font-body text-sm">
            Tân Lang: <span className="font-bold">{marriage.husband.christian_name} {marriage.husband.full_name}</span> & Tân Nương: <span className="font-bold">{marriage.wife.christian_name} {marriage.wife.full_name}</span>
          </p>
        </div>

        {canEdit && marriage.status === 'DRAFT' && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-sm flex items-center justify-between">
            <div>
              <p className="font-bold text-amber-800 text-sm">Hồ sơ này đang ở dạng Bản nháp / Chuẩn bị cưới.</p>
              <p className="text-amber-700 text-xs mt-1">Đã có thể in tờ rao hôn phối cho cặp đôi này.</p>
            </div>
            <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-sm text-sm font-bold flex items-center gap-2 transition-colors">
              🖨️ In Tờ Rao
            </button>
          </div>
        )}

        <MarriageForm
          id={marriage.id}
          initialData={initialData}
          initialHusband={marriage.husband}
          initialWife={marriage.wife}
          readOnly={!canEdit}
        />
      </div>
    </div>
  );
}
