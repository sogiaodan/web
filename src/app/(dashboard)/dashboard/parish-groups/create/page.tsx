import { Metadata } from 'next';
import CreateGroupClient from './CreateGroupClient';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Tạo Hội đoàn | Sổ Giáo Dân',
  description: 'Thêm một hội đoàn mới vào danh sách',
};

export default function CreateGroupPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <Suspense fallback={<div className="h-96 w-full animate-pulse bg-surface-container rounded-2xl max-w-3xl mx-auto" />}>
        <CreateGroupClient />
      </Suspense>
    </div>
  );
}
