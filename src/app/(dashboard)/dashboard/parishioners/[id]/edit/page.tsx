import { Metadata } from 'next';
import { EditParishionerClient } from './components/EditParishionerClient';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Chỉnh sửa Giáo dân | Sổ Giáo Dân',
  description: 'Cập nhật thông tin hồ sơ giáo dân trong hệ thống Sổ Giáo Dân.',
};

export default async function EditParishionerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-4xl mx-auto">
        <Suspense fallback={
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }>
          <EditParishionerClient id={id} />
        </Suspense>
      </div>
    </div>
  );
}
