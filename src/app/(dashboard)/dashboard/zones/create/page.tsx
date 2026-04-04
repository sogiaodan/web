import { Metadata } from 'next';
import { ZoneForm } from '../components/ZoneForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Thêm Giáo khu mới | Sổ Giáo Dân',
};

export default function CreateZonePage() {
  return (
    <div className="flex-1 overflow-y-auto w-full p-4 md:p-8 bg-background-light">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 text-sm font-body text-on-surface-variant flex items-center gap-1">
          <Link href="/dashboard/zones" className="hover:text-primary transition-colors">Giáo khu</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="font-bold text-on-surface">Thêm giáo khu mới</span>
        </div>
        <ZoneForm />
      </div>
    </div>
  );
}
