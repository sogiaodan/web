import { Metadata } from 'next';
import { BatchSacramentClient } from './components/BatchSacramentClient';

export const metadata: Metadata = {
  title: 'Nhập hàng loạt Bí tích | Sổ Giáo Dân',
  description: 'Ghi nhận dữ liệu bí tích hàng loạt',
};

export default function BatchSacramentPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-surface-container">
      <BatchSacramentClient />
    </div>
  );
}
