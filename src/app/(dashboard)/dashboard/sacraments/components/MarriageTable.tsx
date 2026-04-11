'use client';

import Link from 'next/link';
import { MarriageListItem } from '@/types/sacrament';
import { ClipboardList } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { formatDate } from '@/lib/utils';

interface MarriageTableProps {
  items: MarriageListItem[];
  page: number;
  limit: number;
  total: number;
}

export function MarriageTable({ items, page, limit, total }: MarriageTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const totalPages = Math.ceil(total / limit) || 1;
  const startIdx = (page - 1) * limit + 1;
  const endIdx = Math.min(startIdx + limit - 1, total);

  const handlePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-surface border border-outline rounded-sm mt-4">
        <ClipboardList className="h-12 w-12 text-on-surface-variant mb-4 opacity-50" />
        <p className="text-on-surface-variant font-body">Chưa có bản ghi hôn phối nào.</p>
      </div>
    );
  }

  const getBookFormat = (item: MarriageListItem) => {
    const parts = [item.book_no, item.page_no, item.registry_number].filter(Boolean);
    return parts.length > 0 ? parts.join(' - ') : '-';
  };

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto border border-outline rounded-sm bg-surface">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant font-body text-xs font-medium uppercase tracking-wider">
              <th className="px-4 py-3 border-b border-outline w-12 text-center">STT</th>
              <th className="px-4 py-3 border-b border-outline">Chú rể</th>
              <th className="px-4 py-3 border-b border-outline">Cô dâu</th>
              <th className="px-4 py-3 border-b border-outline">Ngày Hôn phối</th>
              <th className="px-4 py-3 border-b border-outline">Người làm chứng</th>
              <th className="px-4 py-3 border-b border-outline">Linh mục Chứng hôn</th>
              <th className="px-4 py-3 border-b border-outline">Số Sổ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline">
            {items.map((item, index) => {
              const stt = (page - 1) * limit + index + 1;
              return (
                <tr key={item.id} className="hover:bg-surface-hover transition-colors group">
                  <td className="px-4 py-4 text-sm text-on-surface-variant text-center">{stt}</td>
                  <td className="px-4 py-4">
                    <Link href={`/dashboard/sacraments/marriages/${item.id}`} className="block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                      <div className="font-display font-bold text-base text-on-surface group-hover:text-primary transition-colors">
                        {item.husband.christian_name} {item.husband.full_name}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/dashboard/sacraments/marriages/${item.id}`} className="block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                      <div className="font-display font-bold text-base text-on-surface group-hover:text-primary transition-colors">
                        {item.wife.christian_name} {item.wife.full_name}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-primary font-body">
                    {item.marriage_date ? formatDate(item.marriage_date) : <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-sm text-xs border border-amber-200">Đang rao</span>}
                  </td>
                  <td className="px-4 py-4 text-sm text-on-surface font-body">
                    <div className="flex flex-col gap-1">
                      <span>{item.witness_1_name || '-'}</span>
                      <span>{item.witness_2_name || '-'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-on-surface font-body">
                    {item.minister ? `Lm. ${item.minister.christian_name ? item.minister.christian_name + ' ' : ''}${item.minister.full_name}` : '-'}
                  </td>
                  <td className="px-4 py-4 text-sm text-on-surface-variant font-mono">
                    {getBookFormat(item)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Desktop Pagination */}
      <div className="hidden md:flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 bg-surface-container border border-t-0 border-outline rounded-b-sm">
        <p className="text-xs text-on-surface-variant font-body">
          Hiển thị&nbsp;
          <span className="font-bold text-on-surface">
            {startIdx}–{endIdx}
          </span>
          &nbsp;trong&nbsp;
          <span className="font-bold text-on-surface">{total.toLocaleString('vi-VN')}</span>
          &nbsp;hồ sơ
        </p>
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPageChange={handlePage}
        />
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-3 pb-20">
        {items.map((item) => (
          <div key={item.id} className="bg-surface border border-outline rounded-md p-4 shadow-sm relative overflow-hidden">
            {/* Type Badge */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                MARRIAGE • BÍ TÍCH HÔN PHỐI
              </span>
              
              {/* Decorative Icon Background */}
              <div className="absolute top-0 right-0 w-12 h-14 bg-[#FAF6F6] rounded-bl-3xl flex pt-2 pr-2 justify-end -z-0">
                 <svg className="w-5 h-5 text-primary/30 fill-current" viewBox="0 0 20 20">
                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                 </svg>
              </div>
            </div>

            <Link href={`/dashboard/sacraments/marriages/${item.id}`} className="block relative z-10 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded mb-4">
              <h3 className="font-display font-bold text-lg text-on-surface">
                 {item.husband.christian_name} {item.husband.full_name} &amp; {item.wife.christian_name} {item.wife.full_name}
              </h3>
            </Link>
            
            <div className="grid grid-cols-2 gap-4 mb-4 relative z-10 border-t border-outline/50 pt-3">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider block mb-1">Date</span>
                <span className="text-sm font-medium text-on-surface font-body">
                  {item.marriage_date ? formatDate(item.marriage_date) : <span className="text-amber-600">Đang rao</span>}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider block mb-1">Minister</span>
                <span className="text-sm font-medium text-on-surface font-body">
                  {item.minister ? `Lm. ${item.minister.full_name}` : '-'}
                </span>
              </div>
            </div>
            
            <div className="relative z-10">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider block mb-1">Witnesses</span>
              <div className="flex gap-2">
                <span className="text-sm font-medium text-on-surface font-body">{item.witness_1_name || '-'} &amp; {item.witness_2_name || '-'}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Mobile Pagination */}
        <div className="flex flex-col items-center gap-3 py-4">
          <p className="text-xs text-on-surface-variant font-body">
            Hiển thị {startIdx}–{endIdx} trong {total.toLocaleString('vi-VN')} hồ sơ
          </p>
          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPageChange={handlePage}
          />
        </div>
      </div>
    </>
  );
}
