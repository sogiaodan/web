import { Metadata } from 'next';
import { CertificateForm } from '../components/CertificateForm';

export const metadata: Metadata = {
  title: 'Ghi nhận Chứng chỉ Giáo lý | Sổ Giáo Dân',
  description: 'Điền thông tin để lưu trữ hồ sơ chứng chỉ vào cơ sở dữ liệu của Giáo xứ.',
};

export default function NewCertificatePage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-5xl mx-auto">
        <CertificateForm mode="create" />
      </div>
    </div>
  );
}
