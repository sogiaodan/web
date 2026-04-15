'use client';

import { Household } from '@/types/household';
import Link from 'next/link';
import { useZones } from '@/components/providers/zones-provider';
import { useState } from 'react';
import { HouseholdEditModal } from './HouseholdEditModal';
import { Edit2 } from 'lucide-react';

export function HouseholdDetailHeader({ household }: { household: Household }) {
  const { zones } = useZones();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const headName = household.head 
    ? `${household.head.christian_name} ${household.head.full_name}`
    : 'Không xác định';

  const zoneName = household.zone?.name || household.zone_name || zones.find(z => z.id === household.zone_id)?.name || 'Không rõ';

  return (
    <section className="flex flex-col gap-6 border-b border-border-color pb-6 md:pb-8">
      <div>
        {/* Household Code Badge */}
        <div className="flex flex-wrap items-center gap-4 text-primary mb-3">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">home_work</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Mã hộ: {household.household_code}
            </span>
          </div>
          <div className="w-[1px] h-3 bg-primary/20 hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">account_tree</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Giáo khu: {zoneName}
            </span>
          </div>
        </div>
        {/* Title — scales from text-2xl on mobile to text-4xl on desktop */}
        <h2 className="text-2xl md:text-4xl font-display font-bold text-text-main leading-tight">
          Gia đình Ông {headName}
        </h2>
        <div className="flex items-start gap-2 mt-2 text-muted">
          <span className="material-symbols-outlined text-base shrink-0 mt-0.5">location_on</span>
          <span className="text-sm">{household.address || 'Chưa cập nhật địa chỉ'}</span>
        </div>
      </div>

      {/* Action Buttons — full-width stacked on mobile, inline on desktop */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link 
          href={`/dashboard/households/${household.id}/add-member`}
          className="flex items-center justify-center gap-2 bg-primary text-white px-5 text-sm font-semibold
                     min-h-[48px] rounded-sm shadow-sm transition-all active:scale-95 hover:bg-primary/90
                     w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          Thêm thành viên
        </Link>
        {/* Temporarily hide split functionality as requested */}
        {/* <Link 
          href={`/dashboard/households/${household.id}/split`}
          className="flex items-center justify-center gap-2 bg-surface text-primary border border-primary/40
                     px-5 text-sm font-semibold min-h-[48px] rounded-sm transition-all hover:bg-primary/5
                     w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-lg">church</span>
          Thủ tục Hôn phối / Tách hộ
        </Link> */}
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-300
                     px-5 text-sm font-semibold min-h-[48px] rounded-sm transition-all hover:bg-slate-50
                     w-full sm:w-auto shadow-sm"
        >
          <Edit2 className="w-4 h-4" />
          Chỉnh sửa thông tin
        </button>
      </div>

      <HouseholdEditModal 
        household={household}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </section>
  );
}
