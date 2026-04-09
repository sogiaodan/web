import { Metadata } from 'next';
import { MarriageDetailClient } from '../../[id]/components/MarriageDetailClient';

export const metadata: Metadata = {
  title: 'Chi tiết Hôn phối | Sổ Giáo Dân',
  description: 'Chi tiết hồ sơ Hôn phối.',
};

export default async function MarriageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-3xl mx-auto">
        <MarriageDetailClient id={id} />
      </div>
    </div>
  );
}
