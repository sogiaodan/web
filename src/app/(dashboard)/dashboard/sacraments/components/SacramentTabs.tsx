'use client';

import clsx from 'clsx';
import { SacramentType } from '@/types/sacrament';

interface SacramentTabsProps {
  activeTab: SacramentType;
  onTabChange: (type: SacramentType) => void;
}

const TABS: { type: SacramentType; label: string }[] = [
  { type: 'BAPTISM', label: 'Rửa tội' },
  { type: 'EUCHARIST', label: 'Rước lễ' },
  { type: 'CONFIRMATION', label: 'Thêm sức' },
  { type: 'MARRIAGE', label: 'Hôn phối' },
];

export function SacramentTabs({ activeTab, onTabChange }: SacramentTabsProps) {
  return (
    <div className="w-full overflow-x-auto border-b border-outline mb-6 scrollbar-hide">
      <div className="flex w-max min-w-full">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.type;
          return (
            <button
              key={tab.type}
              type="button"
              onClick={() => onTabChange(tab.type)}
              className={clsx(
                'whitespace-nowrap px-4 py-3 min-h-[48px] text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
                isActive
                  ? 'text-primary border-b-2 border-primary z-10'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-hover border-b-2 border-transparent'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
