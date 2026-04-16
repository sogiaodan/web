"use client";

import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  value: string | null;
  onChange: (value: string | null) => void;
}

export const PRESET_ICONS = [
  { path: '/images/group-icons/choir.png', label: 'Ca đoàn' },
  { path: '/images/group-icons/eucharist.png', label: 'Thánh Thể' },
  { path: '/images/group-icons/catechism.png', label: 'Giáo lý' },
  { path: '/images/group-icons/cross.png', label: 'Thập giá' },
  { path: '/images/group-icons/youth.png', label: 'Giới trẻ' },
  { path: '/images/group-icons/charity.png', label: 'Bác ái' },
  { path: '/images/group-icons/family.png', label: 'Gia đình' },
  { path: '/images/group-icons/praying-hands.png', label: 'Cầu nguyện' },
  { path: '/images/group-icons/pastoral.png', label: 'Mục vụ' },
  { path: '/images/group-icons/rosary.png', label: 'Mân Côi' },
  { path: '/images/group-icons/mary.png', label: 'Đức Mẹ' },
  { path: '/images/group-icons/church.png', label: 'Giáo xứ' },
];

export function IconGalleryPicker({ value, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
        Biểu tượng hội đoàn
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {/* Default / No icon option */}
        <button
          type="button"
          onClick={() => onChange(null)}
          className={cn(
            "flex flex-col items-center justify-center p-3 rounded-sm border-2 transition-all gap-2 h-24",
            value === null 
              ? "border-primary bg-primary/5 text-primary" 
              : "border-outline bg-surface text-on-surface-variant hover:border-primary/50"
          )}
        >
          <ShieldCheck className={cn("w-10 h-10", value === null ? "text-primary" : "text-on-surface-variant")} />
          <span className="text-[10px] font-medium uppercase tracking-wider text-center">Mặc định</span>
        </button>

        {/* Preset icons */}
        {PRESET_ICONS.map((icon) => {
          const isSelected = value === icon.path;
          return (
            <button
              key={icon.path}
              type="button"
              onClick={() => onChange(icon.path)}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-sm border-2 transition-all gap-2 h-24 relative overflow-hidden",
                isSelected 
                  ? "border-primary bg-primary/5" 
                  : "border-outline bg-surface hover:border-primary/50"
              )}
            >
              <div className="relative w-12 h-12 transition-opacity">
                <Image
                  src={icon.path}
                  alt={icon.label}
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <span className={cn(
                "text-[10px] font-medium uppercase tracking-wider text-center",
                isSelected ? "text-primary font-bold" : "text-on-surface-variant"
              )}>
                {icon.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
