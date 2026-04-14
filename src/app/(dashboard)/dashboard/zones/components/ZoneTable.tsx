'use client';

import { useState } from 'react';
import { Zone } from '@/types/zone';
import Link from 'next/link';

export function ZoneTable({ zones, churchName }: { zones: Zone[], churchName: string }) {
  const [search, setSearch] = useState('');

  const filteredZones = zones.filter(zone => 
    zone.name.toLowerCase().includes(search.toLowerCase()) || 
    (zone.head?.full_name && zone.head.full_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      {/* Tool bar - Show only if more than 10 zones */}
      {zones.length > 10 && (
        <div className="flex justify-end mb-4">
          <div className="bg-surface border border-outline rounded p-2 flex items-center gap-2 w-full md:w-80 shadow-sm">
            <span className="material-symbols-outlined text-on-surface-variant text-lg shrink-0 pl-1">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm giáo khu..."
              className="flex-1 bg-transparent border-none p-1 text-sm text-on-surface focus:ring-0 placeholder:text-on-surface-variant/50 outline-none"
            />
          </div>
        </div>
      )}

      {/* DESKTOP VIEW */}
      <div className="hidden md:block bg-surface border border-outline shadow-sm rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container border-b border-outline">
                <th className="px-6 py-4 text-xs font-medium text-on-surface-variant uppercase tracking-widest w-16">STT</th>
                <th className="px-6 py-4 text-xs font-medium text-on-surface-variant uppercase tracking-widest">Tên Giáo khu</th>
                <th className="px-6 py-4 text-xs font-medium text-on-surface-variant uppercase tracking-widest">Trưởng Giáo Khu</th>
                <th className="px-6 py-4 text-xs font-medium text-on-surface-variant uppercase tracking-widest text-center">Số lượng Giáo dân</th>
                <th className="px-6 py-4 text-xs font-medium text-on-surface-variant uppercase tracking-widest text-center">Số Hộ Gia đình</th>
                <th className="px-6 py-4 text-xs font-medium text-on-surface-variant uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline">
              {filteredZones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant font-medium">
                    Không tìm thấy giáo khu nào phù hợp.
                  </td>
                </tr>
              ) : filteredZones.map((item, index) => (
                <tr key={item.id} className="hover:bg-surface-container transition-colors group">
                  <td className="px-6 py-5 text-sm text-on-surface-variant">
                    {(index + 1).toString().padStart(2, '0')}
                  </td>
                  <td className="px-6 py-5">
                    <p className="font-display font-bold text-on-surface line-clamp-1 text-base">
                      {item.name}
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-body text-on-surface line-clamp-1">
                      {item.head ? `${item.head.christian_name} ${item.head.full_name}` : '—'}
                    </p>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-sm font-body text-on-surface">{item.total_parishioners || 0}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-sm font-body text-on-surface">{item.total_households || 0}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Link 
                      href={`/dashboard/zones/${item.id}`}
                      className="text-primary text-sm font-medium hover:underline underline-offset-4"
                    >
                      Chi tiết
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
        {filteredZones.length === 0 ? (
          <div className="bg-surface border border-outline rounded p-8 text-center text-on-surface-variant">
            Không tìm thấy giáo khu nào phù hợp.
          </div>
        ) : filteredZones.map((item) => (
          <div key={item.id} className="bg-surface border border-outline rounded-sm flex flex-col relative w-full overflow-hidden">
            <Link 
              href={`/dashboard/zones/${item.id}`}
              className="p-5 flex flex-col gap-4 min-h-[48px] hover:bg-surface-container transition-colors focus:bg-surface-container focus:outline-none"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-[18px] font-bold text-primary font-body">
                  {item.name}
                </h3>
                <span className="material-symbols-outlined text-on-surface-variant text-[20px] shrink-0 mt-0.5">
                  more_vert
                </span>
              </div>
              
              <div className="flex gap-3">
                <div className="mt-0.5 shrink-0">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">badge</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-tight mb-0.5">Trưởng khu</p>
                  <p className="text-sm font-body text-on-surface font-medium">
                    {item.head ? `${item.head.christian_name} ${item.head.full_name}` : '—'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-outline pt-4">
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-tight mb-0.5">Giáo dân</p>
                  <p className="font-body text-on-surface">
                    <span className="text-lg font-bold mr-1">{item.total_parishioners || 0}</span>
                    <span className="text-xs text-on-surface-variant">người</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-tight mb-0.5">Hộ gia đình</p>
                  <p className="font-body text-on-surface">
                    <span className="text-lg font-bold mr-1">{item.total_households || 0}</span>
                    <span className="text-xs text-on-surface-variant">hộ</span>
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Footer Text */}
      <div className="mt-8 text-center">
        <p className="text-sm font-body italic text-on-surface-variant">
          Hiện thị toàn bộ {zones.length} giáo khu trực thuộc Giáo xứ {churchName}.
        </p>
      </div>
    </div>
  );
}
