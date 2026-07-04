'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { SacramentForm } from './SacramentForm';
import { MarriageForm } from './MarriageForm';

const SACRAMENT_LABELS = {
  BAPTISM: {
    title: 'Ghi nhận Bí tích Rửa tội',
    desc: 'Điền thông tin để lưu trữ hồ sơ bí tích rửa tội vào sổ giáo xứ.',
  },
  EUCHARIST: {
    title: 'Ghi nhận Bí tích Rước lễ',
    desc: 'Điền thông tin để lưu trữ hồ sơ bí tích rước lễ lần đầu vào sổ giáo xứ.',
  },
  CONFIRMATION: {
    title: 'Ghi nhận Bí tích Thêm sức',
    desc: 'Điền thông tin để lưu trữ hồ sơ bí tích thêm sức vào sổ giáo xứ.',
  },
  MARRIAGE: {
    title: 'Ghi nhận Bí tích Hôn phối',
    desc: 'Điền thông tin để lưu trữ hồ sơ bí tích hôn phối vào sổ giáo xứ.',
  },
} as const;

type SupportedSacramentType = keyof typeof SACRAMENT_LABELS;

export function NewSacramentClient() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  
  // Validate and fallback type
  const activeTab: SupportedSacramentType = 
    (typeParam === 'BAPTISM' || typeParam === 'EUCHARIST' || typeParam === 'CONFIRMATION' || typeParam === 'MARRIAGE')
      ? typeParam as SupportedSacramentType
      : 'BAPTISM';

  const info = SACRAMENT_LABELS[activeTab];

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm font-medium text-muted mb-6">
        <Link href="/dashboard/sacraments" className="hover:text-primary transition-colors">
          Sổ Bí tích
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-primary font-bold">{info.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-on-surface mb-1">
          {info.title}
        </h1>
        <p className="text-on-surface-variant font-body text-sm">
          {info.desc}
        </p>
      </div>

      <div className="mt-6">
        {activeTab === 'MARRIAGE' ? (
          <MarriageForm />
        ) : (
          <SacramentForm type={activeTab} />
        )}
      </div>
    </>
  );
}
