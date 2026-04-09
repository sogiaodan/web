'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { ParishionerForm } from '../../../components/ParishionerForm';
import { useParishionerDetailQuery } from '../../../queries/useParishionerQuery';

export function EditParishionerClient({ id }: { id: string }) {
  const { data: parishioner, isLoading, error } = useParishionerDetailQuery(id);

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !parishioner) {
    return (
      <div className="bg-surface border border-outline rounded p-8 text-center text-on-surface-variant font-body">
        Không thể tải dữ liệu giáo dân.
      </div>
    );
  }

  return (
    <>
      <Link
        href={`/dashboard/parishioners/${id}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-[#1C1917] hover:text-primary transition-colors mb-6 group font-body"
      >
        <span className="material-symbols-outlined text-lg group-hover:-translate-x-0.5 transition-transform">
          arrow_back
        </span>
        Chi tiết: {parishioner.full_name}
      </Link>

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

      <ParishionerForm initialData={parishioner} isEdit={true} />
    </>
  );
}
