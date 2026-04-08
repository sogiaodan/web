'use client';

import clsx from 'clsx';
import { CertificateType } from '@/types/catechism';

interface CertificateTypeTabsProps {
  activeTab: CertificateType;
  onTabChange: (type: CertificateType) => void;
}

const TABS: { type: CertificateType; label: string }[] = [
  { type: 'MARRIAGE_PREP', label: 'Giáo lý Hôn nhân' },
  { type: 'RCIA', label: 'Giáo lý Dự tòng (RCIA)' },
];

export function CertificateTypeTabs({ activeTab, onTabChange }: CertificateTypeTabsProps) {
  return (
    // Overflow indicator: relative wrapper + right-fade gradient shown on mobile
    <div className="relative mb-6">
      <div className="w-full overflow-x-auto border-b border-outline scrollbar-hide">
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
      {/* Right-edge fade overlay — shows scroll hint on mobile, hidden on desktop once all tabs visible */}
      <div
        className="absolute top-0 right-0 bottom-0 w-8 pointer-events-none md:hidden"
        style={{
          background: 'linear-gradient(to right, transparent, var(--color-background, #FDFBF7))',
        }}
        aria-hidden="true"
      />
    </div>
  );
}
