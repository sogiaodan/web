import { Suspense } from 'react';
import { Metadata } from 'next';
import { SacramentListClient } from './components/SacramentListClient';
import LoadingSacraments from './loading';

export const metadata: Metadata = {
  title: 'Sổ Bí tích | Sổ Giáo Dân',
  description: 'Quản lý và tra cứu hồ sơ các bí tích đã lãnh nhận.',
};

export default function SacramentsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light text-on-surface">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-1">
              Sổ Bí tích
            </h1>
            <p className="text-on-surface-variant font-body text-sm">
              Quản lý và tra cứu hồ sơ các bí tích đã lãnh nhận.
            </p>
          </div>
        </div>

        <Suspense fallback={<LoadingSacraments />}>
          <SacramentListClient />
        </Suspense>
      </div>
    </div>
  );
}
