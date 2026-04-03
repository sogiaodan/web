import { Household } from '@/types/household';

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
  } catch (e) {
    return dateStr;
  }
}

export function CoupleCards({ household }: { household: Household }) {
  const head = household.head;
  const spouse = household.spouse;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {/* Head Card — horizontal flex layout matching mobile Stitch design */}
      <div className="relative bg-surface-container border border-outline p-4 md:p-6 rounded-lg overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 -mr-8 -mt-8 rotate-45" />
        <div className="flex gap-4 items-start relative">
          {/* Avatar: 64px on mobile, 96px on desktop */}
          <div className="w-16 h-16 md:w-24 md:h-24 flex-shrink-0 overflow-hidden rounded-sm border border-border-color bg-surface-container">
            {head?.avatar_url ? (
              <img 
                src={head.avatar_url} 
                alt="Profile of Household Head" 
                className="w-full h-full object-cover grayscale contrast-125" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-display font-bold text-2xl md:text-3xl text-on-surface-variant">
                  {head?.full_name?.charAt(0) || 'H'}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary-container px-2 py-0.5 rounded-sm inline-block">Chủ hộ</span>
            <h3 className="text-lg md:text-xl font-display font-bold text-text-main leading-tight mt-1 line-clamp-2">
              {head ? `${head.christian_name} ${head.full_name}` : 'Không xác định'}
            </h3>
            <div className="grid grid-cols-2 gap-y-1 mt-2 text-xs text-on-surface-variant">
              {head?.birth_date && <span>Sinh: {formatDate(head.birth_date)}</span>}
              {head?.baptism_date && <span>Rửa tội: {formatDate(head.baptism_date)}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Spouse Card */}
      {spouse ? (
        <div className="relative bg-surface-container border border-outline p-4 md:p-6 rounded-lg overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/5 -mr-8 -mt-8 rotate-45" />
          <div className="flex gap-4 items-start relative">
            <div className="w-16 h-16 md:w-24 md:h-24 flex-shrink-0 overflow-hidden rounded-sm border border-border-color bg-surface-container">
              {spouse.avatar_url ? (
                <img 
                  src={spouse.avatar_url} 
                  alt="Profile of Spouse" 
                  className="w-full h-full object-cover grayscale contrast-125" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-display font-bold text-2xl md:text-3xl text-on-surface-variant">
                    {spouse.full_name?.charAt(0) || 'V'}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-secondary-container px-2 py-0.5 rounded-sm inline-block">Vợ/Chồng</span>
              <h3 className="text-lg md:text-xl font-display font-bold text-text-main leading-tight mt-1 line-clamp-2">
                {spouse.christian_name} {spouse.full_name}
              </h3>
              <div className="grid grid-cols-2 gap-y-1 mt-2 text-xs text-on-surface-variant">
                {spouse.birth_date && <span>Sinh: {formatDate(spouse.birth_date)}</span>}
                {spouse.marriage_date && <span>Rửa tội: {formatDate(spouse.marriage_date)}</span>}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-outline p-6 flex items-center justify-center rounded-lg opacity-60">
          <p className="text-muted font-medium italic">Chưa có thông tin Vợ/Chồng</p>
        </div>
      )}
    </section>
  );
}
