'use client';

import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ParishionerListItem, ParishionerStatus } from '@/types/parishioner';

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<
  ParishionerStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  RESIDING: {
    label: 'ĐANG CƯ TRÚ',
    bg: 'bg-[#F0FDF4]',
    text: 'text-[#166534]',
    border: 'border-[#166534]/20',
  },
  ABSENT: {
    label: 'VẮNG MẶT',
    bg: 'bg-[#FFF7ED]',
    text: 'text-[#B45309]',
    border: 'border-[#B45309]/20',
  },
  MOVED: {
    label: 'CHUYỂN XỨ',
    bg: 'bg-[#FEF2F2]',
    text: 'text-[#B91C1C]',
    border: 'border-[#B91C1C]/20',
  },
  DECEASED: {
    label: 'ĐÃ QUA ĐỜI',
    bg: 'bg-[#F5F5F4]',
    text: 'text-[#57534E]',
    border: 'border-[#57534E]/20',
  },
};

function StatusBadge({ status }: { status: ParishionerStatus }) {
  const s = STATUS_MAP[status] || STATUS_MAP.RESIDING;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider border ${s.bg} ${s.text} ${s.border}`}
    >
      {s.label}
    </span>
  );
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  items: ParishionerListItem[];
  total: number;
  page: number;
  limit: number;
  canEdit?: boolean;
  onPreview?: (id: string) => void;
}

export function ParishionerTable({ items, total, page, limit, canEdit = false, onPreview }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const totalPages = Math.ceil(total / limit) || 1;
  const startIdx = (page - 1) * limit + 1;
  const endIdx = Math.min(startIdx + limit - 1, total);

  const handlePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // ── Empty State ──────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="bg-surface border border-outline rounded p-12 text-center mt-4">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 block mb-3">
          person_search
        </span>
        <p className="font-display font-bold text-on-surface text-lg mb-1">
          Không tìm thấy giáo dân nào
        </p>
        <p className="text-sm text-on-surface-variant font-body">
          Không có giáo dân nào phù hợp với bộ lọc hiện tại. Thử thay đổi tiêu chí tìm kiếm.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ── DESKTOP TABLE ─────────────────────────────────────────────────────── */}
      <div className="hidden md:block bg-surface border border-outline rounded overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F5F4] border-b border-outline">
                <th className="px-5 py-4 text-[11px] font-bold text-[#78716C] uppercase tracking-widest w-14">
                  STT
                </th>
                <th className="px-5 py-4 text-[11px] font-bold text-[#78716C] uppercase tracking-widest">
                  Tên Thánh
                </th>
                <th className="px-5 py-4 text-[11px] font-bold text-[#78716C] uppercase tracking-widest">
                  Họ và Tên
                </th>
                <th className="px-5 py-4 text-[11px] font-bold text-[#78716C] uppercase tracking-widest">
                  Ngày sinh
                </th>
                <th className="px-5 py-4 text-[11px] font-bold text-[#78716C] uppercase tracking-widest">
                  Giới tính
                </th>
                <th className="px-5 py-4 text-[11px] font-bold text-[#78716C] uppercase tracking-widest">
                  Giáo khu
                </th>
                <th className="px-5 py-4 text-[11px] font-bold text-[#78716C] uppercase tracking-widest">
                  Trạng thái
                </th>
                <th className="px-5 py-4 text-[11px] font-bold text-[#78716C] uppercase tracking-widest text-right">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/50">
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  className={`hover:bg-[#F5F5F4] transition-colors group ${
                    item.status === 'DECEASED' ? 'opacity-70' : ''
                  }`}
                >
                  <td className="px-5 py-4 text-sm text-[#78716C] font-medium">
                    {(startIdx + index).toString().padStart(2, '0')}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-primary font-display italic text-base">
                      {item.christian_name}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/dashboard/parishioners/${item.id}`}
                      className="font-body font-semibold text-[#1C1917] hover:text-primary hover:underline underline-offset-2 transition-colors text-base"
                    >
                      {item.full_name}
                      {item.nick_name && (
                        <span className="text-muted font-normal ml-2 text-sm italic">({item.nick_name})</span>
                      )}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-sm text-on-surface-variant font-body">
                    {formatDate(item.birth_date)}
                  </td>
                  <td className="px-5 py-4 text-sm text-on-surface-variant font-body">
                    {item.gender === 'MALE' ? 'Nam' : 'Nữ'}
                  </td>
                  <td className="px-5 py-4 text-sm text-on-surface-variant font-body">
                    {item.zone_name || '—'}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-1 justify-end">
                      {/* Eye: opens Quick Preview Drawer */}
                      <button
                        id={`preview-parishioner-${item.id}`}
                        title="Xem nhanh"
                        onClick={() => onPreview?.(item.id)}
                        className="w-9 h-9 flex items-center justify-center rounded hover:bg-primary/10 text-[#78716C] hover:text-primary transition-all focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <span className="material-symbols-outlined text-lg">visibility</span>
                      </button>
                      {/* Navigate to full detail */}
                      <Link
                        href={`/dashboard/parishioners/${item.id}`}
                        id={`view-parishioner-${item.id}`}
                        title="Xem chi tiết"
                        className="w-9 h-9 flex items-center justify-center rounded hover:bg-primary/10 text-[#78716C] hover:text-primary transition-all focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <span className="material-symbols-outlined text-lg">open_in_new</span>
                      </Link>
                      {canEdit && (
                        <Link
                          href={`/dashboard/parishioners/${item.id}/edit`}
                          id={`edit-parishioner-${item.id}`}
                          title="Chỉnh sửa"
                          className="w-9 h-9 flex items-center justify-center rounded hover:bg-primary/10 text-[#78716C] hover:text-primary transition-all focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Desktop Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 bg-[#F5F5F4] border-t border-outline">
          <p className="text-xs text-[#78716C] font-body">
            Hiển thị&nbsp;
            <span className="font-bold text-on-surface">
              {startIdx}–{endIdx}
            </span>
            &nbsp;trên tổng số&nbsp;
            <span className="font-bold text-on-surface">{total.toLocaleString('vi-VN')}</span>
            &nbsp;giáo dân
          </p>
          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPageChange={handlePage}
          />
        </div>
      </div>

      {/* ── MOBILE CARDS ──────────────────────────────────────────────────────── */}
      <div className="md:hidden grid grid-cols-1 gap-3 mt-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`bg-surface border border-outline rounded p-4 transition-all active:scale-[0.99] ${
              item.status === 'DECEASED' ? 'opacity-70' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <span className="text-primary font-display italic text-sm">
                  {item.christian_name}
                </span>
                <h3 className="font-display font-bold text-[#1C1917] text-base leading-tight mt-0.5">
                  {item.full_name}
                  {item.nick_name && (
                    <span className="text-muted font-normal ml-1.5 text-xs italic">({item.nick_name})</span>
                  )}
                </h3>
              </div>
              <StatusBadge status={item.status} />
            </div>
            <div className="text-xs text-on-surface-variant font-body space-y-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">cake</span>
                <span>{formatDate(item.birth_date)}</span>
                <span className="text-outline">·</span>
                <span>{item.gender === 'MALE' ? 'Nam' : 'Nữ'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">location_on</span>
                <span>{item.zone_name || 'Chưa có giáo khu'}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t border-outline/50">
              {/* Mobile: eye card opens quick preview */}
              <button
                onClick={() => onPreview?.(item.id)}
                className="flex-1 h-12 flex items-center justify-center gap-1 text-xs font-bold text-primary border border-primary/30 bg-primary/5 rounded hover:bg-primary/10 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">visibility</span>
                XEM NHANH
              </button>
              <Link
                href={`/dashboard/parishioners/${item.id}`}
                className="flex-1 h-12 flex items-center justify-center gap-1 text-xs font-bold text-[#78716C] border border-[#E7E5E4] rounded hover:bg-[#F5F5F4] transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                CHI TIẾT
              </Link>
            </div>
          </div>
        ))}

        {/* Mobile Pagination */}
        <div className="flex flex-col items-center gap-3 py-4">
          <p className="text-xs text-[#78716C] font-body">
            Hiển thị {startIdx}–{endIdx} / {total.toLocaleString('vi-VN')} giáo dân
          </p>
          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPageChange={handlePage}
          />
        </div>
      </div>
    </>
  );
}

// ─── Pagination Controls ──────────────────────────────────────────────────────

function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const btnBase =
    'w-9 h-9 flex items-center justify-center rounded border text-xs font-medium transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-30 disabled:pointer-events-none';

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={`${btnBase} border-outline bg-surface hover:bg-hover-bg`}
      >
        <span className="material-symbols-outlined text-lg">chevron_left</span>
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="w-9 flex justify-center text-xs text-on-surface-variant">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`${btnBase} ${
              p === page
                ? 'border-primary bg-primary text-white'
                : 'border-outline bg-surface hover:bg-hover-bg text-on-surface'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={`${btnBase} border-outline bg-surface hover:bg-hover-bg`}
      >
        <span className="material-symbols-outlined text-lg">chevron_right</span>
      </button>
    </div>
  );
}
