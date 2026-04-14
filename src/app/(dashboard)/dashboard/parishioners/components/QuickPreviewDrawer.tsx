'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ParishionerPreview, ParishionerStatus, SacramentType } from '@/types/parishioner';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<ParishionerStatus, { label: string; dot: string; badgeBg: string; badgeText: string }> = {
  RESIDING: { label: 'Đang sinh hoạt', dot: 'bg-[#16a34a]', badgeBg: 'bg-[#F0FDF4]', badgeText: 'text-[#166534]' },
  ABSENT: { label: 'Vắng mặt', dot: 'bg-[#d97706]', badgeBg: 'bg-[#FFF7ED]', badgeText: 'text-[#B45309]' },
  MOVED: { label: 'Chuyển xứ', dot: 'bg-[#dc2626]', badgeBg: 'bg-[#FEF2F2]', badgeText: 'text-[#B91C1C]' },
  DECEASED: { label: 'Đã qua đời', dot: 'bg-[#78716C]', badgeBg: 'bg-[#F5F5F4]', badgeText: 'text-[#57534E]' },
};

const SACRAMENT_META: Record<SacramentType, { label: string; icon: string }> = {
  BAPTISM: { label: 'Rửa tội', icon: 'water_drop' },
  EUCHARIST: { label: 'Rước lễ lần đầu', icon: 'church' },
  CONFIRMATION: { label: 'Thêm sức', icon: 'local_fire_department' },
  ANOINTING_OF_SICK: { label: 'Xức dầu Bệnh nhân', icon: 'healing' },
  HOLY_ORDERS: { label: 'Truyền chức Thánh', icon: 'auto_stories' },
};

const SACRAMENT_DISPLAY_ORDER: SacramentType[] = ['BAPTISM', 'EUCHARIST', 'CONFIRMATION'];

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  } catch { return dateStr; }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  parishionerId: string | null;
  onClose: () => void;
  canEdit: boolean;
}

export function QuickPreviewDrawer({ parishionerId, onClose, canEdit }: Props) {
  const [preview, setPreview] = useState<ParishionerPreview | null>(null);
  const [error, setError] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const isOpen = !!parishionerId;

  // Sync state with props
  if (parishionerId !== activeId) {
    setActiveId(parishionerId);
    setLoadingId(parishionerId ? parishionerId : null);
    setError(false);
    if (!parishionerId) {
      setPreview(null);
    }
  }

  // Fetch preview data asynchronously
  useEffect(() => {
    if (!loadingId) return;

    let ignore = false;
    fetch(`/api/v1/parishioners/${loadingId}/preview`, { credentials: 'include' })
      .then((r) => {
        if (!r.ok) throw new Error('not found');
        return r.json() as Promise<{ data: ParishionerPreview }>;
      })
      .then((body) => {
        if (!ignore) {
          setPreview(body.data);
          setLoadingId(null);
        }
      })
      .catch(() => {
        if (!ignore) {
          setError(true);
          setLoadingId(null);
        }
      });
    return () => { ignore = true; };
  }, [loadingId]);

  const loading = !!loadingId;

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ESC key
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [onClose]);

  const statusMeta = preview ? (STATUS_META[preview.status] ?? STATUS_META.RESIDING) : null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#1C1917]/40 backdrop-blur-[2px]"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Chi tiết Hồ sơ"
        className={`fixed top-0 right-0 bottom-0 z-50 w-full md:w-[420px] bg-surface border-l border-[#E7E5E4] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* ── Drawer Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E5E4] shrink-0">
          <h2 className="font-display font-bold text-lg text-[#1C1917]">Chi tiết Hồ sơ</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded hover:bg-[#F5F5F4] text-[#78716C] hover:text-[#1C1917] transition-colors"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* ── Body ──────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <span className="material-symbols-outlined text-primary text-4xl animate-spin">
                progress_activity
              </span>
              <p className="text-sm text-[#78716C] font-body">Đang tải hồ sơ...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center h-48 gap-3 px-6 text-center">
              <span className="material-symbols-outlined text-[#78716C]/30 text-4xl">
                person_off
              </span>
              <p className="text-sm text-[#78716C] font-body">Không thể tải thông tin giáo dân.</p>
              <button
                onClick={() => {
                  if (parishionerId) {
                    setError(false);
                    setLoadingId(parishionerId);
                  }
                }}
                className="text-sm text-primary font-medium hover:underline"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Content */}
          {!loading && !error && preview && (
            <>
              {/* Profile Strip */}
              <div className="px-6 py-5 border-b border-[#E7E5E4]">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-lg bg-[#F5F5F4] border border-[#E7E5E4] flex items-center justify-center shrink-0">
                    <span className="font-display font-bold text-2xl text-[#78716C]">
                      {preview.full_name?.charAt(0) ?? '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {preview.christian_name && (
                      <p className="text-xs font-body font-bold text-primary uppercase tracking-[0.12em] mb-0.5">
                        {preview.christian_name}
                      </p>
                    )}
                    <p className="font-display font-bold text-xl text-[#1C1917] leading-tight truncate">
                      {preview.full_name}
                      {preview.nick_name && (
                        <span className="text-muted font-normal ml-2 text-base">({preview.nick_name})</span>
                      )}
                    </p>
                    {statusMeta && (
                      <span
                        className={`inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded text-xs font-body font-semibold border ${statusMeta.badgeBg} ${statusMeta.badgeText} border-current/20`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                        {statusMeta.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="px-6 py-5 border-b border-[#E7E5E4]">
                <h3 className="text-[10px] font-bold text-[#78716C] uppercase tracking-[0.15em] mb-4 font-body">
                  Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <div>
                    <p className="text-[9px] font-bold text-[#78716C] uppercase tracking-widest font-body mb-1">
                      Ngày sinh
                    </p>
                    <p className="text-sm font-body font-semibold text-[#1C1917]">
                      {formatDate(preview.birth_date) || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-[#78716C] uppercase tracking-widest font-body mb-1">
                      Giới tính
                    </p>
                    <p className="text-sm font-body font-semibold text-[#1C1917]">
                      {preview.gender === 'MALE' ? 'Nam' : 'Nữ'}
                    </p>
                  </div>
                </div>
                {preview.birth_place && (
                  <div className="mt-4">
                    <p className="text-[9px] font-bold text-[#78716C] uppercase tracking-widest font-body mb-1">
                      Nơi sinh
                    </p>
                    <p className="text-sm font-body text-[#1C1917] leading-relaxed">
                      {preview.birth_place}
                    </p>
                  </div>
                )}
                {preview.zone_name && (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#78716C] text-sm">location_on</span>
                    <p className="text-sm font-body text-[#1C1917]">{preview.zone_name}</p>
                  </div>
                )}
              </div>

              {/* Sacramental Timeline (preview: top 3 only) */}
              <div className="px-6 py-5">
                <h3 className="text-[10px] font-bold text-[#78716C] uppercase tracking-[0.15em] mb-4 font-body">
                  Tiến trình Bí tích
                </h3>
                <div className="space-y-0">
                  {SACRAMENT_DISPLAY_ORDER.map((type, i) => {
                    const s = (preview.sacraments || []).find((x) => x.type === type) ?? null;
                    const meta = SACRAMENT_META[type];
                    const received = !!s?.date;
                    const isLast = i === SACRAMENT_DISPLAY_ORDER.length - 1;
                    return (
                      <div key={type} className="flex gap-3">
                        {/* Dot + line */}
                        <div className="flex flex-col items-center shrink-0">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                              received
                                ? 'bg-primary border-2 border-primary'
                                : 'bg-[#FAFAF9] border-2 border-dashed border-[#D6D3D1]'
                            }`}
                          >
                            <span
                              className={`material-symbols-outlined text-xs ${received ? 'text-white' : 'text-[#A8A29E]'}`}
                            >
                              {meta.icon}
                            </span>
                          </div>
                          {!isLast && <div className="w-px flex-1 min-h-[12px] bg-[#E7E5E4] my-1" />}
                        </div>
                        {/* Content */}
                        <div className="pb-4 flex-1 min-w-0">
                          {received && s ? (
                            <>
                              <p className="text-xs font-bold text-primary font-body mb-0.5">
                                {formatDate(s.date)}
                              </p>
                              <p className="text-sm font-body font-semibold text-[#1C1917]">
                                {meta.label}
                              </p>
                              {s.place && (
                                <p className="text-xs text-[#78716C] font-body mt-0.5 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">location_on</span>
                                  {s.place}
                                </p>
                              )}
                              {s.minister_name && (
                                <p className="text-xs text-[#78716C] font-body mt-0.5 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">person</span>
                                  {s.minister_name}
                                </p>
                              )}
                              {s.godparent_name && (
                                <p className="text-xs text-[#78716C] font-body mt-0.5 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">favorite</span>
                                  Đỡ đầu: {s.godparent_name}
                                </p>
                              )}
                            </>
                          ) : (
                            <div className="pb-1">
                              <p className="text-sm font-body font-medium text-[#78716C]">{meta.label}</p>
                              <p className="text-xs text-[#78716C]/50 font-body italic">Chưa ghi nhận</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Link to full page */}
                <Link
                  href={`/dashboard/parishioners/${parishionerId}`}
                  onClick={onClose}
                  className="mt-2 flex items-center gap-1.5 text-xs font-body font-medium text-primary hover:underline underline-offset-2 transition-colors"
                >
                  Xem đầy đủ tiến trình bí tích
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* ── Sticky Footer ─────────────────────────────────────────────────── */}
        {!loading && !error && preview && (
          <div className="shrink-0 border-t border-[#E7E5E4] px-6 py-4 bg-surface">
            <div className="flex gap-3">
              {canEdit && (
                <Link
                  href={`/dashboard/parishioners/${parishionerId}/edit`}
                  id="preview-edit-btn"
                  onClick={onClose}
                  className="flex-1 h-12 flex items-center justify-center gap-2 border border-[#E7E5E4] text-[#1C1917] text-sm font-medium rounded hover:bg-[#F5F5F4] transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                  Chỉnh sửa
                </Link>
              )}
              <button
                id="preview-print-btn"
                onClick={() => window.print()}
                className={`h-12 flex items-center justify-center gap-2 bg-primary text-white text-sm font-bold rounded hover:opacity-90 transition-all active:scale-95 ${canEdit ? 'flex-1' : 'w-full'}`}
              >
                <span className="material-symbols-outlined text-lg">print</span>
                In chứng chỉ
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
