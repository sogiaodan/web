'use client';

import { Household } from '@/types/household';
import Link from 'next/link';
import { useZones } from '@/components/providers/zones-provider';
import { useState, useRef, useEffect } from 'react';
import { HouseholdEditModal } from './HouseholdEditModal';
import { SplitHouseholdModal } from './SplitHouseholdModal';
import { Edit2, MoreVertical } from 'lucide-react';

export function HouseholdDetailHeader({ household }: { household: Household }) {
  const { zones } = useZones();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);
  
  const headName = household.head 
    ? `${household.head.christian_name} ${household.head.full_name}`
    : 'Không xác định';

  const zoneName = household.zone?.name || household.zone_name || zones.find(z => z.id === household.zone_id)?.name || 'Không rõ';
  const headPrefix = household.head?.gender === 'FEMALE' ? 'Bà' : 'Ông';

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
          Gia đình {headPrefix} {headName}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 mt-4 text-muted text-sm max-w-3xl">
          {household.address && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base shrink-0">location_on</span>
              <span>{household.address}</span>
            </div>
          )}
          {household.physical_book_no && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base shrink-0">book</span>
              <span>Số quyển / STT: <span className="font-medium text-foreground">{household.physical_book_no}</span></span>
            </div>
          )}
          {household.book_issue_date && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base shrink-0">calendar_today</span>
              <span>Ngày cấp sổ: <span className="font-medium text-foreground">{household.book_issue_date}</span></span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base shrink-0">info</span>
            <span>Trạng thái: <span className="font-medium text-foreground">
              {household.household_status === 'ACTIVE' ? 'Đang cư trú' : (household.household_status === 'MOVED_OUT' ? 'Đã chuyển xứ' : 'Giải thể')}
            </span></span>
          </div>
          {household.pastoral_notes && (
            <div className="flex items-start gap-2 md:col-span-2 pt-1">
               <span className="material-symbols-outlined text-base shrink-0 mt-[3px] text-primary/70">edit_note</span>
               <span className="italic text-foreground">Ghi chú: {household.pastoral_notes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-row items-center w-full relative gap-3">
        <Link 
          href={`/dashboard/households/${household.id}/add-member`}
          className="flex items-center justify-center gap-2 bg-primary text-white px-5 text-sm font-semibold
                     min-h-[48px] rounded-sm shadow-sm transition-all active:scale-95 hover:bg-primary/90
                     flex-1 sm:flex-none sm:w-auto"
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          Thêm thành viên
        </Link>
        
        <div className="relative shrink-0 ml-auto" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen((o) => !o)}
            className={`flex items-center justify-center p-2 min-h-[48px] min-w-[48px] rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isMenuOpen ? 'bg-hover-bg text-foreground' : 'text-muted hover:bg-hover-bg hover:text-foreground'}`}
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-background border border-outline rounded shadow-lg overflow-hidden z-20">
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 min-h-[48px] text-sm text-foreground hover:bg-hover-bg transition-colors text-left"
                onClick={() => { setIsMenuOpen(false); setIsEditModalOpen(true); }}
              >
                <Edit2 className="h-4 w-4 text-muted" />
                Chỉnh sửa thông tin
              </button>
              <button
                type="button"
                onClick={() => { setIsMenuOpen(false); setIsSplitModalOpen(true); }}
                className="w-full flex items-center gap-3 px-4 py-3 min-h-[48px] text-sm text-foreground hover:bg-hover-bg transition-colors text-left"
              >
                <span className="material-symbols-outlined text-[16px] text-muted shrink-0">church</span>
                Tách hộ
              </button>
            </div>
          )}
        </div>
      </div>

      <HouseholdEditModal 
        household={household}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      <SplitHouseholdModal
        household={household}
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
      />
    </section>
  );
}
