import { Metadata } from 'next';
import Link from 'next/link';
import { ParishionerForm } from '../components/ParishionerForm';

export const metadata: Metadata = {
  title: 'Thêm Giáo dân mới | Sổ Giáo Dân',
  description: 'Tạo hồ sơ giáo dân mới trong hệ thống Sổ Giáo Dân.',
};

export default function CreateParishionerPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href="/dashboard/parishioners"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#1C1917] hover:text-primary transition-colors mb-6 group font-body"
        >
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </span>
          Danh sách Giáo dân
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-[0.15em] font-body mb-1">
            Giáo dân &rsaquo; Thêm mới
          </p>
          <h1 className="text-3xl md:text-[36px] font-display font-bold text-primary mb-1">
            Thêm Giáo dân mới
          </h1>
          <p className="text-sm font-body text-[#78716C]">
            Điền đầy đủ thông tin để tạo hồ sơ giáo dân mới trong hệ thống.
          </p>
        </div>

        {/* Form */}
        <ParishionerForm isEdit={false} />
      </div>
    </div>
  );
}
