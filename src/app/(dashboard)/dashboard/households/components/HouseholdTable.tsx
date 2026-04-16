'use client';

import { Household } from '@/types/household';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useZones } from '@/components/providers/zones-provider';

import Image from 'next/image';

export function HouseholdTable({ households, total, page, limit }: { 
  households: Household[], 
  total: number, 
  page: number, 
  limit: number 
}) {
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
  
  const { zones } = useZones();

  const getZoneName = (item: Household) => {
    if (item.zone?.name) return item.zone.name;
    if (item.zone_name) return item.zone_name;
    if (item.zone_id && zones.length > 0) {
      const z = zones.find(z => z.id === item.zone_id);
      return z ? z.name : 'Không rõ';
    }
    return 'Không rõ';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ACTIVE') {
      return (
        <span className="bg-tertiary-container text-tertiary text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-tighter border border-tertiary/20">
          Đang cư trú
        </span>
      );
    }
    if (status === 'DISSOLVED') {
      return (
        <span className="bg-secondary-container text-secondary text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-tighter border border-secondary/20">
          Vắng mặt
        </span>
      );
    }
    return (
      <span className="bg-surface-container-highest text-on-surface-variant text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-tighter border border-outline-variant/50">
        Chuyển xứ
      </span>
    );
  }

  return (
    <>
      {/* DESKTOP VIEW */}
      <div className="hidden md:block bg-surface border border-border-color shadow-sm rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background-light border-b border-border-color">
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest w-16">STT</th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Mã Hộ</th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Tên Chủ Hộ</th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Ngày sinh</th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Thành viên</th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {households.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant font-medium">
                    Không tìm thấy hộ giáo nào.
                  </td>
                </tr>
              ) : households.map((item, index) => (
                <tr key={item.id} className="hover:bg-hover-bg transition-colors group">
                  <td className="px-6 py-5 text-sm text-on-surface-variant font-medium">
                    {(startIdx + index).toString().padStart(2, '0')}
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-primary">
                    {item.household_code}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      {item.head?.avatar_url ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border-color shrink-0">
                          <Image 
                            src={item.head.avatar_url} 
                            alt={item.head?.full_name || ''} 
                            fill
                            className="object-cover grayscale contrast-125" 
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center border border-border-color shrink-0">
                          <span className="font-display font-bold text-on-surface-variant">
                            {item.head?.full_name?.charAt(0) || 'H'}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-display font-bold text-on-surface line-clamp-1">
                          {item.head ? `${item.head.christian_name} ${item.head.full_name}` : 'Không xác định'}
                        </p>
                        {getStatusBadge(item.household_status)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-on-surface-variant font-body">
                    {item.head?.birth_date ? new Date(item.head.birth_date).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-sm">family_restroom</span>
                      <span className="text-sm font-bold">{item.member_count}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Link 
                      href={`/dashboard/households/${item.id}`}
                      className="text-primary text-sm font-bold h-12 inline-flex items-center hover:underline underline-offset-4 justify-end gap-1 ml-auto group-hover:translate-x-1 transition-transform"
                    >
                      <span>Chi tiết</span>
                      <span className="material-symbols-outlined text-lg">chevron_right</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE VIEW (CARD LIST) */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {households.length === 0 ? (
          <div className="bg-surface border border-outline rounded p-8 text-center text-on-surface-variant">
            Không tìm thấy hộ giáo nào.
          </div>
        ) : households.map((item) => (
          <div key={item.id} className="bg-surface border border-outline rounded p-5 relative corner-accent active:scale-[0.98] transition-transform">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold text-primary tracking-widest uppercase mb-1 block">{item.household_code}</span>
                <h3 className="text-lg font-display font-bold text-on-surface">
                  {item.head ? `${item.head.christian_name} ${item.head.full_name}` : 'Không xác định'}
                </h3>
              </div>
              <div className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">groups</span>
                {item.member_count} THÀNH VIÊN
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant text-sm">cake</span>
                <p className="text-sm text-on-surface-variant">Ngày sinh chủ hộ: <span className="text-on-surface font-medium">{item.head?.birth_date ? new Date(item.head.birth_date).toLocaleDateString('vi-VN') : '—'}</span></p>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant text-sm">account_tree</span>
                <p className="text-sm text-on-surface-variant">Giáo khu: <span className="text-on-surface font-medium">{getZoneName(item)}</span></p>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-outline-variant flex justify-between items-center">
              {getStatusBadge(item.household_status)}
              <div className="flex gap-3">
                <Link 
                  href={`/dashboard/households/${item.id}`}
                  className="text-xs font-bold text-primary flex items-center justify-center gap-1 h-12 px-4 border border-primary/20 bg-primary/5 rounded active:scale-95 transition-transform"
                >
                  CHI TIẾT <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination (Shared) */}
      {total > 0 && (
        <div className="px-4 py-4 md:px-6 md:bg-background-light md:border-x md:border-b md:border-border-color flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 md:mt-0 md:rounded-b">
          <p className="text-xs text-on-surface-variant font-body">
            Hiển thị <span className="font-bold">{startIdx} - {endIdx}</span> của <span className="font-bold">{total}</span>
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handlePage(page - 1)}
              disabled={page === 1}
              className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center rounded border border-border-color bg-surface hover:bg-hover-bg transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            
            <div className="flex items-center">
              <button className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center rounded bg-primary text-white text-xs font-bold">
                {page}
              </button>
              {page < totalPages && (
                <button onClick={() => handlePage(page + 1)} className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center text-xs font-medium hover:bg-hover-bg rounded">
                  {page + 1}
                </button>
              )}
              {page + 1 < totalPages && (
                <span className="px-2 text-xs text-on-surface-variant">...</span>
              )}
              {page + 1 < totalPages && (
                <button onClick={() => handlePage(totalPages)} className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center text-xs font-medium hover:bg-hover-bg rounded">
                  {totalPages}
                </button>
              )}
            </div>

            <button 
              onClick={() => handlePage(page + 1)}
              disabled={page >= totalPages}
              className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center rounded border border-border-color bg-surface hover:bg-hover-bg transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
