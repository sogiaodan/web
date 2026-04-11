import { Metadata } from 'next';
import { CertificateListClient } from './components/CertificateListClient';
import { Suspense } from 'react';
import LoadingCatechism from './loading';

export const metadata: Metadata = {
  title: 'Chứng chỉ Giáo lý | Sổ Giáo Dân',
  description: 'Lưu trữ và quản lý hồ sơ hoàn thành các khóa học giáo lý chuyên biệt trong giáo xứ.',
};

export default function CatechismPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light text-on-surface">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[28px] md:text-4xl font-display font-bold mb-1">
              Chứng chỉ Giáo lý
            </h1>
            <p className="text-on-surface-variant font-body text-sm">
              Lưu trữ và quản lý hồ sơ hoàn thành các khóa học giáo lý chuyên biệt trong giáo xứ.
            </p>
          </div>
        </div>

        <Suspense fallback={<LoadingCatechism />}>
          <CertificateListClient />
        </Suspense>
      </div>
    </div>
  );
}
