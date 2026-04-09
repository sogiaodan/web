'use client';

import { useState } from 'react';
import { MarriageForm } from '../../new/components/MarriageForm';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { useSacramentDetailQuery } from '../../queries/useSacramentQuery';

export function MarriageDetailClient({ id }: { id: string }) {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  const { data: marriage, isLoading, error } = useSacramentDetailQuery(id, true);

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !marriage) {
    return (
      <div className="bg-surface border border-outline rounded p-8 text-center text-on-surface-variant font-body">
        Không thể tải dữ liệu hôn phối.
      </div>
    );
  }

  const initialData = {
    husband_id: marriage.husband?.id || '',
    wife_id: marriage.wife?.id || '',
    marriage_date: marriage.marriage_date || '',
    place: marriage.place || '',
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
    <>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-on-surface mb-1">
          {canEdit ? 'Chỉnh sửa Hôn phối' : 'Chi tiết Hôn phối'}
        </h1>
        <p className="text-on-surface-variant font-body text-sm">
          Tân Lang: <span className="font-bold">{marriage.husband?.christian_name} {marriage.husband?.full_name}</span> & Tân Nương: <span className="font-bold">{marriage.wife?.christian_name} {marriage.wife?.full_name}</span>
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
    </>
  );
}
