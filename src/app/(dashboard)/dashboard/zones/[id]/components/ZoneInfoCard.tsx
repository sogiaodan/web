import { ParishionerLookup } from '@/types/zone';

interface ZoneInfoCardProps {
  head?: ParishionerLookup;
  description?: string;
}

export function ZoneInfoCard({ head, description }: ZoneInfoCardProps) {
  // We don't have is_deceased explicitly in ParishionerLookup based on my definition,
  // but if the name is styled muted (or logic later requires), we could add it.
  // For now, I'll rely on the existing props.
  const hasHead = !!head;

  return (
    <div className="bg-surface border border-outline p-6 rounded shadow-sm w-full relative">
      {/* Header */}
      <h3 className="text-primary font-bold text-base flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-[18px]">info</span>
        Thông tin Ban hành giáo
      </h3>

      <div className="bg-surface-container border border-outline rounded-sm p-4 flex gap-4 items-center">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {head?.avatar_url ? (
            <img 
              src={head.avatar_url} 
              alt="Avatar" 
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border border-outline grayscale contrast-125"
            />
          ) : (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary flex items-center justify-center shadow-inner">
              {hasHead ? (
                <span className="text-white font-display text-2xl md:text-3xl font-bold">
                  {head.full_name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <span className="material-symbols-outlined text-white text-2xl md:text-3xl opacity-50">
                  person_off
                </span>
              )}
            </div>
          )}
        </div>

        {/* Info Fields */}
        <div className="flex-1">
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-tight mb-1">
            Trưởng Giáo Khu
          </p>
          {hasHead ? (
            <p className="text-base font-bold font-display text-on-surface mb-0.5">
              {head.christian_name} {head.full_name}
            </p>
          ) : (
            <p className="text-base font-medium font-body text-on-surface-variant italic mb-0.5">
              Chưa có trưởng giáo khu
            </p>
          )}

          <p className="text-sm font-body text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">call</span>
            {head?.phone_number || '—'}
          </p>
        </div>
      </div>

      <div className="mt-4 px-2">
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
          Địa giới phụ trách
        </p>
        {description ? (
          <p className="text-sm font-body text-on-surface-variant italic leading-relaxed">
            {description}
          </p>
        ) : (
          <p className="text-sm font-body text-on-surface-variant italic">
            Chưa có mô tả địa giới.
          </p>
        )}
      </div>
    </div>
  );
}
