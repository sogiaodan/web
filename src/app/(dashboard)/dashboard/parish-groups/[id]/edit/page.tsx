import { Metadata } from 'next';
import EditGroupClient from './EditGroupClient';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Chỉnh sửa Hội đoàn | Sổ Giáo Dân',
  description: 'Cập nhật thông tin chi tiết hội đoàn',
};

export default function EditGroupPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-3xl mx-auto">
        <Suspense fallback={
          <div className="flex justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        }>
          <EditGroupClient id={params.id} />
        </Suspense>
      </div>
    </div>
  );
}
