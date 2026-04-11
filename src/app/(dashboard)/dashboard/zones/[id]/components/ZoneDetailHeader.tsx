import Link from 'next/link';

interface ZoneDetailHeaderProps {
  id: string;
  name: string;
  canEdit: boolean;
}

export function ZoneDetailHeader({ id, name, canEdit }: ZoneDetailHeaderProps) {
  return (
    <div className="mb-8">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm font-body text-on-surface-variant flex items-center gap-1">
        <Link href="/dashboard/zones" className="hover:text-primary transition-colors">Giáo khu</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="font-bold text-on-surface">Chi tiết Giáo khu</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface mb-2">
            Chi tiết Giáo khu — Giáo khu {name}
          </h1>
          <p className="text-sm font-body text-on-surface-variant">
            Thông tin quản lý và danh sách giáo dân thuộc khu vực {name}.
          </p>
        </div>

        {canEdit && (
          <Link
            href={`/dashboard/zones/${id}/edit`}
            className="w-full md:w-auto bg-primary text-white font-bold text-sm px-6 py-3 rounded flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all outline-none"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Chỉnh sửa thông tin
          </Link>
        )}
      </div>
    </div>
  );
}
