'use client';

import { useState } from 'react';
import { Household } from '@/types/household';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function StatusSyncAlert({ household }: { household: Household }) {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const headStatus = household.head?.marital_status;
  const spouseStatus = household.spouse?.marital_status;

  // Chỉ hiển thị nếu có cả 2 người và trạng thái khác nhau
  const hasConflict = household.head && household.spouse && headStatus !== spouseStatus;

  const maritalStatusMap: Record<string, string> = {
    'SINGLE': 'Độc Thân',
    'MARRIED': 'Đã Kết Hôn',
    'MIXED_RELIGION': 'Đã Kết Hôn (Khác Đạo)',
    'SEPARATED': 'Ly Thân',
    'IRREGULAR': 'Kết Hôn (Mắc Ngăn Trở)',
    'WIDOWED': 'Góa',
    'DIVORCED': 'Ly Dị'
  };

  if (!hasConflict) return null;

  const maritalStatusOptions = [
    { value: 'MARRIED', label: 'Đã Kết Hôn' },
    { value: 'MIXED_RELIGION', label: 'Đã Kết Hôn (Khác Đạo)' },
    { value: 'SEPARATED', label: 'Ly Thân' },
    { value: 'IRREGULAR', label: 'Kết Hôn (Mắc Ngăn Trở)' },
  ];

  const handleSync = async (status: string) => {
    setIsSyncing(true);
    try {
      const response = await fetch(`/api/v1/households/${household.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marital_status: status }),
      });

      if (response.ok) {
        setShowOptions(false);
        router.refresh(); // Tải lại dữ liệu Server Side
      }
    } catch (error) {
      console.error('Failed to sync status:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className={cn(
        "relative overflow-hidden rounded-sm border border-primary/20 bg-surface shadow-sm",
        "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary"
      )}>
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary">warning</span>
            </div>
            <div>
              <h4 className="font-display font-bold text-primary flex items-center gap-2">
                Dữ liệu tình trạng hôn phối không đồng nhất
              </h4>
              <p className="text-sm text-text-main/70 mt-1">
                Chủ hộ đang để <span className="font-bold text-primary italic">"{maritalStatusMap[headStatus!] || 'Chưa rõ'}"</span> nhưng 
                Phối ngẫu lại để <span className="font-bold text-primary italic">"{maritalStatusMap[spouseStatus!] || 'Chưa rõ'}"</span>. 
                Hãy đồng nhất dữ liệu cho Sổ gia đình này.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 text-sm font-bold rounded-sm hover:bg-primary/90 transition-all active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-lg">sync</span>
            ĐỒNG BỘ HÓA NGAY
          </button>
        </div>

        {/* Sync Options Grid */}
        {showOptions && (
          <div className="px-5 pb-5 pt-2 border-t border-border-color bg-primary/[0.02] animate-in zoom-in-95 duration-200">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">Chọn tình trạng chung cho cặp đôi:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {maritalStatusOptions.map((opt) => (
                <button
                  key={opt.value}
                  disabled={isSyncing}
                  onClick={() => handleSync(opt.value)}
                  className="flex flex-col items-center justify-center gap-1 p-3 border border-border-color rounded-sm bg-surface hover:border-primary/40 hover:bg-primary/5 transition-all group disabled:opacity-50"
                >
                  <span className="text-sm font-semibold group-hover:text-primary">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
