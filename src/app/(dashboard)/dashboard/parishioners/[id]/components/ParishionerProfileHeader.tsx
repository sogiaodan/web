import Link from 'next/link';
import { ParishionerDetail, ParishionerStatus } from '@/types/parishioner';
import { PrintCertificateButton } from './PrintCertificateButton';

// ─── Status label/color helpers ───────────────────────────────────────────────

const STATUS_META: Record<
  ParishionerStatus,
  { dot: string; label: string; badgeBg: string; badgeText: string }
> = {
  RESIDING: {
    dot: 'bg-[#16a34a]',
    label: 'Đang sinh hoạt',
    badgeBg: 'bg-[#F0FDF4]',
    badgeText: 'text-[#166534]',
  },
  ABSENT: {
    dot: 'bg-[#d97706]',
    label: 'Vắng mặt',
    badgeBg: 'bg-[#FFF7ED]',
    badgeText: 'text-[#B45309]',
  },
  TRANSFERRED: {
    dot: 'bg-[#dc2626]',
    label: 'Chuyển xứ',
    badgeBg: 'bg-[#FEF2F2]',
    badgeText: 'text-[#B91C1C]',
  },
  DECEASED: {
    dot: 'bg-[#78716C]',
    label: 'Đã qua đời',
    badgeBg: 'bg-[#F5F5F4]',
    badgeText: 'text-[#57534E]',
  },
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatMaritalStatus(status: string | null | undefined): string {
  if (!status) return '—';
  if (status === 'MARRIED') return 'Đã kết hôn';
  if (status === 'SINGLE') return 'Độc thân';
  return status;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  parishioner: ParishionerDetail;
  canEdit: boolean;
}

export function ParishionerProfileHeader({ parishioner, canEdit }: Props) {
  const statusMeta = STATUS_META[parishioner.status] ?? STATUS_META.RESIDING;
  // UUID display: strip hyphens, take first 8 chars uppercased
  const shortId = `SV-${parishioner.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

  const metadata = [
    {
      label: 'NGÀY SINH',
      value: formatDate(parishioner.birth_date),
      icon: 'cake',
    },
    {
      label: 'GIỚI TÍNH',
      value: parishioner.gender === 'MALE' ? 'Nam' : 'Nữ',
      icon: parishioner.gender === 'MALE' ? 'male' : 'female',
    },
    {
      label: 'TÌNH TRẠNG',
      value: formatMaritalStatus(parishioner.marital_status),
      icon: 'favorite',
    },
    {
      label: 'GIÁO KHU',
      value: parishioner.zone?.name ?? '—',
      icon: 'location_on',
    },
  ];

  return (
    <div className="bg-surface border border-outline rounded overflow-hidden">
      {/* ── Crimson accent strip at top ── */}
      <div className="h-1.5 w-full bg-primary" />

      <div className="p-6 md:p-8">
        {/* ── Top row: avatar + name block + action buttons ── */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className={`w-24 h-24 md:w-[120px] md:h-[120px] rounded-lg overflow-hidden border border-outline bg-[#F5F5F4] flex items-center justify-center ${
                parishioner.is_deceased ? 'grayscale' : ''
              }`}
            >
              <span className="font-display font-bold text-5xl text-[#78716C]">
                {parishioner.full_name?.charAt(0) ?? '?'}
              </span>
            </div>
            {/* Status badge — bottom-right of avatar */}
            {parishioner.is_deceased ? (
              <span className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-[#78716C] rounded-full border-2 border-white flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-sm">close</span>
              </span>
            ) : (
              <span className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-[#16a34a] rounded-full border-2 border-white flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-sm">check</span>
              </span>
            )}
          </div>

          {/* Name + identifiers */}
          <div className="flex-1 min-w-0">
            {/* Christian name label */}
            <p className="text-[11px] font-bold text-primary uppercase tracking-[0.15em] font-body mb-1">
              TÊN THÁNH: {parishioner.christian_name}
            </p>
            {/* Full name */}
            <h1 className="font-display font-bold text-3xl md:text-[36px] text-[#1C1917] leading-tight mb-3">
              {parishioner.full_name}
            </h1>
            {/* Pills row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* UUID Pill */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5F5F4] rounded text-xs font-body text-[#78716C] border border-[#E7E5E4]">
                <span className="material-symbols-outlined text-xs">tag</span>
                UUID: {shortId}
              </span>
              {/* Living status pill */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-body font-semibold border ${statusMeta.badgeBg} ${statusMeta.badgeText} border-current/20`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                {statusMeta.label}
              </span>
            </div>
          </div>

          {/* Action Buttons — top-right */}
          {canEdit && (
            <div className="flex flex-col sm:flex-row gap-2 shrink-0 self-start">
              <Link
                href={`/dashboard/parishioners/${parishioner.id}/edit`}
                id="edit-parishioner-header-btn"
                className="h-11 px-4 flex items-center gap-2 border border-outline text-on-surface text-sm font-medium rounded hover:bg-hover-bg transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-primary whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-lg">edit</span>
                Chỉnh sửa
              </Link>
              <PrintCertificateButton />
            </div>
          )}
        </div>

        {/* ── Metadata row: 2×2 grid on mobile, 4-col on md+ ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 mt-6 pt-6 border-t border-[#E7E5E4]">
          {metadata.map((m, i) => (
            <div
              key={m.label}
              className={`flex flex-col gap-1.5 md:px-4 ${i === 0 ? 'md:pl-0' : 'md:border-l md:border-[#E7E5E4]'} ${i === metadata.length - 1 ? 'md:pr-0' : ''}`}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#78716C] font-body">
                {m.label}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#78716C]">
                  {m.icon}
                </span>
                <p className="text-sm font-body font-semibold text-[#1C1917]">{m.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
