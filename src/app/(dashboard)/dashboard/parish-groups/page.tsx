import { Suspense } from 'react';
import { Metadata } from 'next';
import { ParishGroupListClient } from './components/ParishGroupListClient';
import LoadingParishGroups from './loading';

export const metadata: Metadata = {
  title: 'Danh sách Hội đoàn | Sổ Giáo Dân',
  description: 'Quản lý thông tin và thành viên các hội đoàn trong giáo xứ.',
};

export default function ParishGroupsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<LoadingParishGroups />}>
          <ParishGroupListClient />
        </Suspense>
      </div>
    </div>
  );
}
