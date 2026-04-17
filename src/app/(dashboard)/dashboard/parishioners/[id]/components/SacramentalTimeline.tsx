import { SacramentEntry, MarriageInfo, SacramentType } from '@/types/parishioner';

// ─── Sacrament display metadata ───────────────────────────────────────────────

const SACRAMENT_META: Record<
  SacramentType,
  { label: string; icon: string; order: number }
> = {
  BAPTISM: { label: 'Rửa tội', icon: 'water_drop', order: 1 },
  EUCHARIST: { label: 'Rước lễ lần đầu', icon: 'church', order: 2 },
  CONFIRMATION: { label: 'Thêm sức', icon: 'local_fire_department', order: 3 },
  ANOINTING_OF_SICK: { label: 'Xức dầu Bệnh nhân', icon: 'healing', order: 4 },
  HOLY_ORDERS: { label: 'Truyền chức Thánh', icon: 'auto_stories', order: 5 },
};



function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
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

// ─── Single Timeline Entry ────────────────────────────────────────────────────

function TimelineEntry({
  sacrament,
  type,
  isLast,
}: {
  sacrament: SacramentEntry | null;
  type: SacramentType;
  isLast: boolean;
}) {
  // Always resolve meta from the canonical `type` prop (not sacrament.type)
  // so 'not received' entries still show the correct label and icon.
  const meta = SACRAMENT_META[type];
  const received = !!sacrament?.date;

  return (
    <div className="flex gap-4">
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            received
              ? 'bg-primary border-2 border-primary'
              : 'bg-[#FAFAF9] border-2 border-dashed border-[#D6D3D1]'
          }`}
        >
          <span
            className={`material-symbols-outlined text-sm ${
              received ? 'text-white' : 'text-[#A8A29E]'
            }`}
          >
            {meta?.icon ?? 'radio_button_unchecked'}
          </span>
        </div>
        {!isLast && <div className="w-px flex-1 min-h-[24px] bg-[#E7E5E4] mt-1" />}
      </div>

      {/* Content */}
      <div className={`pb-6 flex-1 min-w-0 ${isLast ? '' : ''}`}>
        {received && sacrament ? (
          <>
            {/* Date */}
            <p className="text-xs font-bold text-primary font-body tracking-wide mb-1">
              {formatDate(sacrament.date)}
            </p>
            {/* Sacrament name */}
            <p className="font-body font-semibold text-[#1C1917] text-base mb-2 leading-tight">
              {meta?.label || sacrament.type}
            </p>
            {/* Details */}
            <div className="space-y-1.5">
              {sacrament.place && (
                <div className="flex items-start gap-1.5 text-sm text-[#78716C]">
                  <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">
                    location_on
                  </span>
                  <span className="font-body">{sacrament.place}</span>
                </div>
              )}
              {sacrament.minister_name && (
                <div className="flex items-start gap-1.5 text-sm text-[#78716C]">
                  <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">
                    person
                  </span>
                  <span className="font-body">{sacrament.minister_name}</span>
                </div>
              )}
              {sacrament.godparent_name && (
                <div className="flex items-start gap-1.5 text-sm text-[#78716C]">
                  <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">
                    favorite
                  </span>
                  <span className="font-body">Người đỡ đầu: {sacrament.godparent_name}</span>
                </div>
              )}
            </div>


          </>
        ) : (
          /* Not received — muted dashed style per spec */
          <div className="pb-4">
            <p className="font-body font-medium text-base text-[#78716C]">
              {meta?.label || 'Bí tích'}
            </p>
            <p className="text-xs text-[#78716C]/50 font-body italic">Chưa ghi nhận</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Marriage Entry ───────────────────────────────────────────────────────────

function MarriageEntry({ marriage, isLast }: { marriage: MarriageInfo | null; isLast: boolean }) {
  const received = !!marriage;
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center shrink-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            received
              ? 'bg-primary border-2 border-primary'
              : 'bg-[#FAFAF9] border-2 border-dashed border-[#D6D3D1]'
          }`}
        >
          <span
            className={`material-symbols-outlined text-sm ${
              received ? 'text-white' : 'text-[#A8A29E]'
            }`}
          >
            favorite
          </span>
        </div>
        {!isLast && <div className="w-px flex-1 min-h-[24px] bg-[#E7E5E4] mt-1" />}
      </div>
      <div className="pb-6 flex-1 min-w-0">
        {received ? (
          <>
            <p className="text-xs font-bold text-primary font-body tracking-wide mb-1">
              {formatDate(marriage.marriage_date)}
            </p>
            <p className="font-body font-semibold text-[#1C1917] text-base mb-1 leading-tight">
              Hôn phối
            </p>
            <div className="flex items-start gap-1.5 text-sm text-[#78716C]">
              <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">person</span>
              <span className="font-body">
                {marriage.spouse.christian_name && `${marriage.spouse.christian_name} `}
                {marriage.spouse.full_name}
              </span>
            </div>
          </>
        ) : (
          <div className="pb-4">
            <p className="font-body font-medium text-base text-[#78716C]">Hôn phối</p>
            <p className="text-xs text-[#78716C]/50 font-body italic">Chưa ghi nhận</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  sacraments: SacramentEntry[];
  marriage: MarriageInfo | null;
}

export function SacramentalTimeline({ sacraments, marriage }: Props) {
  // Build map by type for O(1) lookup
  const sacramentMap = new Map<SacramentType, SacramentEntry>();
  for (const s of sacraments) {
    sacramentMap.set(s.type, s);
  }

  const items = [
    { type: 'BAPTISM', isMarriage: false },
    { type: 'EUCHARIST', isMarriage: false },
    { type: 'CONFIRMATION', isMarriage: false },
    { type: 'MARRIAGE', isMarriage: true },
    { type: 'ANOINTING_OF_SICK', isMarriage: false },
  ];

  if (sacramentMap.has('HOLY_ORDERS')) {
    items.push({ type: 'HOLY_ORDERS', isMarriage: false });
  }

  return (
    <section className="bg-surface border border-outline rounded p-6 lg:sticky lg:top-8">
      <h2 className="font-display font-bold text-lg text-[#1C1917] mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-xl">timeline</span>
        Tiến trình Bí tích
      </h2>

      <div className="space-y-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          if (item.isMarriage) {
            return <MarriageEntry key="MARRIAGE" marriage={marriage} isLast={isLast} />;
          }

          const sacrament = sacramentMap.get(item.type as SacramentType) || null;
          return (
            <TimelineEntry
              key={item.type}
              sacrament={sacrament}
              type={item.type as SacramentType}
              isLast={isLast}
            />
          );
        })}
      </div>
    </section>
  );
}
