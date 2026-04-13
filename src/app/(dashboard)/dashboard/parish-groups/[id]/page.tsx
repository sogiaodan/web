import { Metadata } from 'next';
import GroupDetailClient from './GroupDetailClient';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Chi tiết Hội đoàn | Sổ Giáo Dân',
  description: 'Tra cứu thông tin chi tiết và thành viên hội đoàn',
};

export default function GroupDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-5xl mx-auto">
        <Suspense fallback={
          <div className="space-y-6 md:space-y-8 animate-pulse">
            <div className="h-48 bg-surface-container rounded-2xl w-full" />
            <div className="h-96 bg-surface-container rounded-2xl w-full" />
          </div>
        }>
          <GroupDetailClient id={params.id} />
        </Suspense>
      </div>
    </div>
  );
}
