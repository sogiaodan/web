'use client';

import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { MoreVertical, FileText } from 'lucide-react';
import { CertificateListItem, CertificateType } from '@/types/catechism';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { formatDate } from '@/lib/utils';

interface CertificateTableProps {
  items: CertificateListItem[];
  activeTab: CertificateType;
  page: number;
  limit: number;
  total: number;
  canEdit: boolean;
  isAdmin: boolean;
}

function CertificateTypeBadge({ type }: { type: CertificateType }) {
  const label = type === 'RCIA' ? 'Dự tòng (RCIA)' : 'Hôn nhân';
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
      {label}
    </span>
  );
}

function ActionMenu({
  id,
  canEdit,
  isAdmin,
  onDelete,
}: {
  id: string;
  canEdit: boolean;
  isAdmin: boolean;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="p-3 min-h-[48px] min-w-[48px] flex items-center justify-center rounded hover:bg-surface-hover text-on-surface-variant hover:text-on-surface transition-colors focus-visible:ring-2 focus-visible:ring-primary outline-none"
        aria-label="Thao tác"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-40 bg-surface border border-outline rounded-sm shadow-lg py-1">
          <Link
            href={`/dashboard/catechism/${id}`}
            className="flex items-center w-full px-4 py-2 text-sm text-on-surface hover:bg-surface-hover transition-colors"
            onClick={() => setOpen(false)}
          >
            Xem chi tiết
          </Link>
          {canEdit && (
            <Link
              href={`/dashboard/catechism/${id}`}
              className="flex items-center w-full px-4 py-2 text-sm text-on-surface hover:bg-surface-hover transition-colors"
              onClick={() => setOpen(false)}
            >
              Chỉnh sửa
            </Link>
          )}
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete(id);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Xóa
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function CertificateTable({
  items,
  activeTab,
  page,
  limit,
  total,
  canEdit,
  isAdmin,
}: CertificateTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalPages = Math.ceil(total / limit) || 1;
  const startIdx = (page - 1) * limit + 1;
  const endIdx = Math.min(startIdx + limit - 1, total);

  const handlePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDeleteRequest = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/catechism-certificates/${deletingId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // silently fail, let user retry
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-surface border border-outline rounded-sm mt-4">
        <FileText className="h-12 w-12 text-on-surface-variant mb-4 opacity-40" />
        <p className="font-display font-semibold text-on-surface text-base mb-1">
          Chưa có chứng chỉ nào được ghi nhận
        </p>
        <p className="text-sm text-on-surface-variant font-body text-center max-w-xs">
          {activeTab === 'RCIA'
            ? 'Chưa có chứng chỉ Giáo lý Dự tòng (RCIA) nào được lưu trữ.'
            : 'Chưa có chứng chỉ Giáo lý Hôn nhân nào được lưu trữ.'}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-[2px]"
            onClick={() => !isDeleting && setDeleteDialogOpen(false)}
            aria-hidden="true"
          />
          <div
            role="alertdialog"
            aria-modal="true"
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-surface border border-outline rounded-sm shadow-2xl p-6"
          >
            <h3 className="font-display font-bold text-lg text-on-surface mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-on-surface-variant font-body mb-6">
              Bạn có chắc muốn xóa chứng chỉ này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isDeleting}
                className="px-4 h-10 border border-outline text-on-surface-variant text-sm font-medium rounded-sm hover:bg-surface-hover transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 h-10 bg-red-600 text-white text-sm font-bold rounded-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && <span className="material-symbols-outlined animate-spin text-sm">autorenew</span>}
                Xóa
              </button>
            </div>
          </div>
        </>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto border border-outline rounded-sm bg-surface">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant font-body text-xs font-medium uppercase tracking-wider">
              <th className="px-4 py-3 border-b border-outline w-12 text-center">STT</th>
              <th className="px-4 py-3 border-b border-outline">Tên Thánh &amp; Họ Tên</th>
              <th className="px-4 py-3 border-b border-outline">Ngày Sinh</th>
              <th className="px-4 py-3 border-b border-outline">Loại Chứng Chỉ</th>
              <th className="px-4 py-3 border-b border-outline">Ngày Cấp</th>
              <th className="px-4 py-3 border-b border-outline">Nơi Cấp (Issued By)</th>
              <th className="px-4 py-3 border-b border-outline">Số Hiệu</th>
              <th className="px-4 py-3 border-b border-outline w-16 text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline">
            {items.map((item, index) => {
              const stt = (page - 1) * limit + index + 1;
              const fullName = `${item.parishioner.christian_name ? item.parishioner.christian_name + ' ' : ''}${item.parishioner.full_name}`;
              return (
                <tr key={item.id} className="hover:bg-surface-hover transition-colors group">
                  <td className="px-4 py-4 text-sm text-on-surface-variant text-center">{stt.toString().padStart(2, '0')}</td>
                  <td className="px-4 py-4 max-w-[200px]">
                    <Link
                      href={`/dashboard/catechism/${item.id}`}
                      className="block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                    >
                      <div
                        className="font-display font-bold text-sm text-primary hover:underline truncate"
                        title={fullName}
                      >
                        {fullName}
                      </div>
                    </Link>
                    {item.parishioner.parish_name && (
                      <div className="text-[11px] text-[#A8A29E] font-body mt-0.5 truncate">
                        {item.parishioner.parish_name}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-on-surface font-body">
                    {formatDate(item.parishioner.birth_date)}
                  </td>
                  <td className="px-4 py-4">
                    <CertificateTypeBadge type={item.certificate_type} />
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-primary font-body">
                    {formatDate(item.issue_date)}
                  </td>
                  <td className="px-4 py-4 text-sm text-on-surface font-body">
                    {item.issued_by || '—'}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-primary font-body">
                    {item.certificate_no || '—'}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <ActionMenu
                      id={item.id}
                      canEdit={canEdit}
                      isAdmin={isAdmin}
                      onDelete={handleDeleteRequest}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Desktop Pagination */}
      <div className="hidden md:flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 bg-surface-container border border-t-0 border-outline rounded-b-sm">
        <p className="text-xs text-on-surface-variant font-body">
          Hiển thị&nbsp;
          <span className="font-bold text-on-surface">{startIdx}–{endIdx}</span>
          &nbsp;trong tổng số&nbsp;
          <span className="font-bold text-on-surface">{total.toLocaleString('vi-VN')}</span>
          &nbsp;chứng chỉ
        </p>
        <PaginationControls page={page} totalPages={totalPages} onPageChange={handlePage} />
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3 pb-20">
        {items.map((item) => {
          const fullName = `${item.parishioner.christian_name ? item.parishioner.christian_name + ' ' : ''}${item.parishioner.full_name}`;
          return (
            <div
              key={item.id}
              className="bg-surface border border-outline rounded-sm p-4 relative"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 overflow-hidden">
                  <Link href={`/dashboard/catechism/${item.id}`}>
                    <h3 className="font-display font-bold text-base text-primary hover:underline truncate">
                      {fullName}
                    </h3>
                  </Link>
                  {item.parishioner.parish_name && (
                    <p className="text-xs text-[#A8A29E] font-body mt-0.5">{item.parishioner.parish_name}</p>
                  )}
                </div>
                <ActionMenu
                  id={item.id}
                  canEdit={canEdit}
                  isAdmin={isAdmin}
                  onDelete={handleDeleteRequest}
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-2">
                <CertificateTypeBadge type={item.certificate_type} />
                <span className="text-[11px] text-on-surface-variant font-body">·</span>
                <span className="text-sm font-semibold text-primary font-body">
                  {formatDate(item.issue_date)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-body border-t border-outline/50 pt-2 mt-2">
                <div>
                  <span className="text-on-surface-variant uppercase text-[10px] font-bold tracking-wider block mb-0.5">Nơi cấp</span>
                  <span className="text-on-surface">{item.issued_by || '—'}</span>
                </div>
                {item.certificate_no && (
                  <div>
                    <span className="text-on-surface-variant uppercase text-[10px] font-bold tracking-wider block mb-0.5">Số hiệu</span>
                    <span className="font-semibold text-primary">{item.certificate_no}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Mobile Pagination */}
        <div className="flex flex-col items-center gap-3 py-4">
          <p className="text-xs text-on-surface-variant font-body">
            Hiển thị {startIdx}–{endIdx} trong {total.toLocaleString('vi-VN')} chứng chỉ
          </p>
          <PaginationControls page={page} totalPages={totalPages} onPageChange={handlePage} />
        </div>
      </div>
    </>
  );
}
