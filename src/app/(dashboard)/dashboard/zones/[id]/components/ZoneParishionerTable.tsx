'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ParishionerLookup } from '@/types/zone';
import { ZoneParishionerFilterBar } from './ZoneParishionerFilterBar';
import { toast } from 'sonner';

interface ZoneParishionerTableProps {
  zoneId: string;
  items: ParishionerLookup[];
  total: number;
  page: number;
  limit: number;
}

export function ZoneParishionerTable({ zoneId, items, total, page, limit }: ZoneParishionerTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isExporting, setIsExporting] = useState(false);

  const totalPages = Math.ceil(total / limit) || 1;
  const startIdx = (page - 1) * limit + 1;
  const endIdx = Math.min(startIdx + limit - 1, total);

  const handlePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');
      params.delete('limit');
      
      const response = await fetch(`/api/v1/zones/${zoneId}/parishioners/export?${params.toString()}`);
      
      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Gửi yêu cầu quá nhanh. Vui lòng thử lại sau 1 phút.');
        } else {
          toast.error('Xuất dữ liệu thất bại. Vui lòng thử lại.');
        }
        return;
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `giaokhu_${zoneId.slice(0, 8)}_export_${new Date().getTime()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Đã xuất danh sách giáo dân.');
    } catch (error) {
      toast.error('Lỗi hệ thống khi xuất dữ liệu.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-surface border border-outline rounded-sm mt-8 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-outline flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="font-display font-bold text-xl text-on-surface">
          Danh sách Giáo dân thuộc khu
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button 
            onClick={handleExportCSV}
            disabled={isExporting || items.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 border border-outline px-4 py-2 rounded text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
               <span className="material-symbols-outlined text-[18px] animate-spin text-primary">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">download</span>
            )}
            <span>{isExporting ? 'Đang xuất...' : 'Xuất File'}</span>
          </button>
        </div>
      </div>

      <div className="px-6 py-2">
        <ZoneParishionerFilterBar />
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container border-b border-outline">
              <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest w-16">STT</th>
              <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Tên Thánh</th>
              <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Họ và Tên</th>
              <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Hộ Giáo</th>
              <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Ngày Sinh</th>
              <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant font-medium">
                  Chưa có giáo dân nào thuộc giáo khu này.
                </td>
              </tr>
            ) : items.map((item, index) => (
              <tr key={item.id} className="hover:bg-surface-container transition-colors group">
                <td className="px-6 py-4 text-sm text-on-surface-variant">
                  {(startIdx + index).toString().padStart(2, '0')}
                </td>
                <td className="px-6 py-4 font-display italic text-primary text-base">
                  {item.christian_name || '—'}
                </td>
                <td className="px-6 py-4 font-body font-bold text-on-surface text-base">
                  {item.full_name}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-body text-on-surface">{item.household_name || '—'}</p>
                  {item.household_code && (
                    <p className="text-xs font-body text-on-surface-variant">(Mã: {item.household_code})</p>
                  )}
                </td>
                <td className="px-6 py-4 text-sm font-body text-on-surface">
                  {item.birth_date || '—'}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/dashboard/parishioners/${item.id}`}
                    className="text-primary hover:text-primary/70 transition-colors inline-flex p-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE LIST */}
      <div className="md:hidden grid grid-cols-1 gap-4 p-4">
        {items.length === 0 ? (
          <div className="bg-surface border border-outline rounded p-8 text-center text-on-surface-variant">
            Chưa có giáo dân nào thuộc giáo khu này.
          </div>
        ) : items.map((item) => (
          <Link 
            key={item.id} 
            href={`/dashboard/parishioners/${item.id}`}
            className="bg-surface border border-outline rounded-sm p-4 flex gap-4 items-center focus:bg-surface-container active:bg-surface-container transition-colors"
          >
            {/* Avatar / Icon */}
            <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">account_circle</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col">
                <span className="font-display font-bold text-on-surface text-[15px] truncate block w-full leading-tight mb-1">
                  {item.christian_name} {item.full_name}
                </span>
                <span className="text-xs font-body text-on-surface-variant line-clamp-2 leading-snug">
                  Hộ gia đình: {item.household_name || '—'}{item.household_code && ` - Số ${item.household_code}`}
                </span>
              </div>
            </div>

            {/* Chevron */}
            <div className="shrink-0 text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </div>
          </Link>
        ))}
        {total > 0 && (
          <button className="w-full mt-2 py-3 bg-surface border border-primary text-primary font-bold text-sm rounded hover:bg-primary/5 transition-colors">
            Xem tất cả giáo dân
          </button>
        )}
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="p-4 md:p-6 border-t border-outline flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-on-surface-variant font-body">
            Hiển thị <span className="font-bold">{startIdx} - {endIdx}</span> trên <span className="font-bold">{total}</span> giáo dân
          </p>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => handlePage(page - 1)}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-sm border border-outline bg-surface hover:bg-surface-container transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            
            <div className="flex items-center gap-1.5">
              <button className="w-8 h-8 flex items-center justify-center rounded-sm bg-primary text-white text-sm font-bold shadow-[inset_0_-2px_0_rgba(0,0,0,0.1)]">
                {page}
              </button>
              {page < totalPages && (
                <button onClick={() => handlePage(page + 1)} className="w-8 h-8 flex items-center justify-center text-sm font-bold text-on-surface-variant hover:bg-surface-container rounded-sm border border-transparent">
                  {page + 1}
                </button>
              )}
              {page + 1 < totalPages && (
                <span className="px-1 text-sm text-on-surface-variant">...</span>
              )}
              {page + 1 < totalPages && (
                <button onClick={() => handlePage(totalPages)} className="w-8 h-8 flex items-center justify-center text-sm font-bold text-on-surface-variant hover:bg-surface-container rounded-sm border border-transparent">
                  {totalPages}
                </button>
              )}
            </div>

            <button 
              onClick={() => handlePage(page + 1)}
              disabled={page >= totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-sm border border-outline bg-surface hover:bg-surface-container transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
