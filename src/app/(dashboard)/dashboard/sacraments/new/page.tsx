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
        <NewSacramentClient />
      </div>
    </div>
  );
}
