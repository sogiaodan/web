import { Metadata } from 'next';
import { SacramentDetailClient } from './components/SacramentDetailClient';

export const metadata: Metadata = {
  title: 'Chi tiết Bí tích | Sổ Giáo Dân',
  description: 'Chi tiết hồ sơ bí tích đã lãnh nhận.',
};

export default async function SacramentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-3xl mx-auto">
        <SacramentDetailClient id={id} />
      </div>
    </div>
  );
}
