import { Metadata } from 'next';
import { CertificateForm } from '../components/CertificateForm';

export const metadata: Metadata = {
  title: 'Chi tiết Chứng chỉ Giáo lý | Sổ Giáo Dân',
  description: 'Xem và chỉnh sửa thông tin chứng chỉ giáo lý.',
};

export default async function CertificateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-5xl mx-auto">
        <CertificateForm mode="edit" id={id} />
      </div>
    </div>
  );
}
