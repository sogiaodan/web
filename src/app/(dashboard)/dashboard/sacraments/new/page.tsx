import { Metadata } from 'next';
import { NewSacramentClient } from './components/NewSacramentClient';

export const metadata: Metadata = {
  title: 'Ghi nhận Bí tích | Sổ Giáo Dân',
  description: 'Ghi nhận dữ liệu bí tích mới',
};

export default function NewSacramentPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-on-surface mb-1">
            Ghi nhận Bí tích Mới
          </h1>
          <p className="text-on-surface-variant font-body text-sm">
            Điền thông tin để lưu trữ hồ sơ bí tích vào sổ giáo xứ.
          </p>
        </div>

        <NewSacramentClient />
      </div>
    </div>
  );
}
