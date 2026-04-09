import { Suspense } from 'react';
import { Metadata } from 'next';
import { ParishionerListClient } from './components/ParishionerListClient';
import LoadingParishioners from './loading';

export const metadata: Metadata = {
  title: 'Danh sách Giáo dân | Sổ Giáo Dân',
  description: 'Quản lý và tra cứu thông tin chi tiết của các tín hữu trong giáo xứ.',
};

export default function ParishionersPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-on-surface mb-1">
            Danh sách Giáo dân
          </h1>
          <p className="text-on-surface-variant font-body text-sm">
            Quản lý và tra cứu thông tin chi tiết của các tín hữu trong giáo xứ.
          </p>
        </div>

        {/* Suspense wrapper for instant transition */}
        <Suspense fallback={<LoadingParishioners />}>
          <ParishionerListClient />
        </Suspense>
      </div>
    </div>
  );
}
