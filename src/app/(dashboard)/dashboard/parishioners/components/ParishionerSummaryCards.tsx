'use client';

import { ParishionerListStats } from '@/types/parishioner';

interface Props {
  stats: ParishionerListStats;
}

export function ParishionerSummaryCards({ stats }: Props) {
  const {
    total_parishioners,
    male_count,
    female_count,
    residence_rate,
    new_this_month,
  } = stats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      {/* Card 1: Total Parishioners */}
      <div className="bg-surface border border-outline rounded p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-bl-full" />
        <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-widest mb-3 font-body">
          Tổng số Giáo dân
        </p>
        <p className="font-display font-bold text-[40px] text-[#1C1917] leading-none mb-2">
          {total_parishioners.toLocaleString('vi-VN')}
        </p>
        {new_this_month > 0 && (
          <p className="text-xs text-primary font-body font-medium">
            ~+{new_this_month} tháng này
          </p>
        )}
      </div>

      {/* Card 2: Male / Female */}
      <div className="bg-surface border border-outline rounded p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-bl-full" />
        <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-widest mb-3 font-body">
          Nam / Nữ
        </p>
        <p className="font-display font-bold text-[40px] text-[#1C1917] leading-none mb-2">
          {male_count.toLocaleString('vi-VN')}
          <span className="text-[#78716C] mx-1">/</span>
          {female_count.toLocaleString('vi-VN')}
        </p>
        {/* Mini gender bar */}
        <div className="flex items-center gap-2 mt-2">
          {total_parishioners > 0 && (
            <div className="flex-1 h-1.5 bg-[#F5F5F4] rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{
                  width: `${Math.round((male_count / total_parishioners) * 100)}%`,
                }}
              />
            </div>
          )}
          <span className="text-xs text-[#78716C] font-body shrink-0">
            {total_parishioners > 0
              ? `${Math.round((male_count / total_parishioners) * 100)}% Nam`
              : '—'}
          </span>
        </div>
      </div>

      {/* Card 3: Residence Rate */}
      <div className="bg-surface border border-outline rounded p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-bl-full" />
        <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-widest mb-3 font-body">
          Tỷ lệ Cư trú
        </p>
        <p className="font-display font-bold text-[40px] text-[#1C1917] leading-none mb-3">
          {residence_rate.toFixed(1)}
          <span className="text-2xl text-[#78716C]">%</span>
        </p>
        {/* Progress bar */}
        <div className="w-full h-2 bg-[#F5F5F4] rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${Math.min(residence_rate, 100)}%` }}
          />
        </div>
        <p className="text-xs text-[#78716C] font-body mt-1">đang cư trú trong giáo xứ</p>
      </div>
    </div>
  );
}
