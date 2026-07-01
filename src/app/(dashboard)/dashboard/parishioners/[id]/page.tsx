import { Metadata } from 'next';
import { ParishionerDetailClient } from './components/ParishionerDetailClient';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Chi tiết Giáo dân | Sổ Giáo Dân',
  description: 'Xem thông tin chi tiết, gia phả và tiến trình bí tích của giáo dân.',
};

export default async function ParishionerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }>
          <ParishionerDetailClient id={id} searchParams={resolvedSearchParams} />
        </Suspense>
      </div>
    </div>
  );
}
