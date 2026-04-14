"use client";

import { ParishGroup } from '@/types/parish-group';
import { useRouter } from 'next/navigation';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';

interface Props {
  items: ParishGroup[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  onPageChange: (page: number) => void;
}

export function ParishGroupTable({ items, pagination, onPageChange }: Props) {
  const router = useRouter();

  return (
    <div className="w-full">
      {/* Mobile Card List View (< 1024px) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4 mb-6">
        {items.map((group) => (
          <div
            key={group.id}
            onClick={() => router.push(`/dashboard/parish-groups/${group.id}`)}
            className="bg-surface rounded-2xl border border-outline p-4 cursor-pointer hover:shadow-md transition-all flex flex-col gap-3 min-h-[48px]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-variant flex items-center justify-center rounded-xl flex-shrink-0 relative overflow-hidden">
                {group.icon_url ? (
                  <Image src={group.icon_url} alt={group.name} layout="fill" objectFit="contain" className="p-2" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-on-surface-variant" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-on-surface text-lg line-clamp-1">{group.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {group.category.name}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                      group.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {group.is_active ? 'Hoạt động' : 'Ngưng hoạt động'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm mt-1">
              <div>
                <p className="text-on-surface-variant text-[11px] uppercase tracking-wider font-bold">Trưởng nhóm</p>
                <p className="font-medium text-on-surface truncate">
                  {group.leader ? `${group.leader.christian_name || ''} ${group.leader.full_name}`.trim() : <span className="text-on-surface-variant italic">Chưa có</span>}
                </p>
              </div>
              <div>
                <p className="text-on-surface-variant text-[11px] uppercase tracking-wider font-bold">Thành viên</p>
                <p className="font-medium text-on-surface">{group.member_count} người</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (>= 1024px) */}
      <div className="hidden lg:block bg-surface border border-outline rounded-2xl overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-variant/50 border-b border-outline">
                <th className="py-4 px-6 text-xs font-bold text-on-surface-variant uppercase tracking-widest whitespace-nowrap">Hội đoàn</th>
                <th className="py-4 px-6 text-xs font-bold text-on-surface-variant uppercase tracking-widest whitespace-nowrap">Phân loại</th>
                <th className="py-4 px-6 text-xs font-bold text-on-surface-variant uppercase tracking-widest whitespace-nowrap">Trưởng nhóm</th>
                <th className="py-4 px-6 text-xs font-bold text-on-surface-variant uppercase tracking-widest whitespace-nowrap">Số lượng</th>
                <th className="py-4 px-6 text-xs font-bold text-on-surface-variant uppercase tracking-widest whitespace-nowrap">Ngày lập</th>
                <th className="py-4 px-6 text-xs font-bold text-on-surface-variant uppercase tracking-widest whitespace-nowrap text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline">
              {items.map((group) => (
                <tr
                  key={group.id}
                  onClick={() => router.push(`/dashboard/parish-groups/${group.id}`)}
                  className="hover:bg-surface-variant/30 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface-variant/50 flex flex-shrink-0 items-center justify-center rounded-lg relative overflow-hidden">
                        {group.icon_url ? (
                          <Image src={group.icon_url} alt={group.name} layout="fill" objectFit="contain" className="p-1.5" />
                        ) : (
                          <ShieldCheck className="w-5 h-5 text-on-surface-variant" />
                        )}
                      </div>
                      <span className="font-bold text-on-surface">{group.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[11px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary whitespace-nowrap">
                      {group.category.name}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-medium text-on-surface">
                    {group.leader ? `${group.leader.christian_name || ''} ${group.leader.full_name}`.trim() : <span className="text-on-surface-variant italic">Chưa có</span>}
                  </td>
                  <td className="py-4 px-6 font-medium text-on-surface">
                    {group.member_count}
                  </td>
                  <td className="py-4 px-6 text-on-surface-variant">
                    {group.established_date ? formatDate(group.established_date) : '-'}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span
                      className={`text-[11px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full whitespace-nowrap inline-flex ${
                        group.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {group.is_active ? 'Hoạt động' : 'Ngưng'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && pagination.total_pages > 1 && (
        <PaginationControls
          page={pagination.page}
          totalPages={pagination.total_pages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
