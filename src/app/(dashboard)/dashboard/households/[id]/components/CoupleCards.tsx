import { Household } from '@/types/household';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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

  // Logic xác định danh xưng dựa trên giới tính
  const headIsMale = head?.gender === 'MALE';
  const headRoleLabel = headIsMale ? 'Chồng (Chủ hộ)' : head?.gender === 'FEMALE' ? 'Vợ (Chủ hộ)' : 'Chủ hộ';
  const spouseRoleLabel = headIsMale ? 'Vợ' : head?.gender === 'FEMALE' ? 'Chồng' : 'Vợ/Chồng';
  
  const expectedSpouseGender = headIsMale ? 'FEMALE' : 'MALE';

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {/* Head Card */}
      <div className="relative bg-surface-container border border-outline p-4 md:p-6 rounded-lg overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 -mr-8 -mt-8 rotate-45" />
        <Link href={`/dashboard/parishioners/${head?.id}?returnTo=household`} className="flex gap-4 items-start relative hover:opacity-90 transition-opacity flex-1">
          <div className="w-16 h-16 md:w-24 md:h-24 flex-shrink-0 overflow-hidden rounded-sm border border-border-color bg-surface-container shadow-sm">
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
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary-container px-2 py-0.5 rounded-sm inline-block mb-1">
              {headRoleLabel}
            </span>
            <h3 className="text-lg md:text-xl font-display font-bold text-text-main leading-tight line-clamp-2">
              {head ? `${head.christian_name} ${head.full_name}` : 'Không xác định'}
            </h3>
            <div className="grid grid-cols-1 gap-y-1 mt-3 text-xs text-on-surface-variant">
              {head?.birth_date && (
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-sm">cake</span>
                  <span>Sinh: {formatDate(head.birth_date)}</span>
                </div>
              )}
              {head?.baptism_date && (
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-sm">water_drop</span>
                  <span>Rửa tội: {formatDate(head.baptism_date)}</span>
                </div>
              )}
              {head?.phone_number && (
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-sm">call</span>
                  <span>{head.phone_number}</span>
                </div>
              )}
            </div>
          </div>
        </Link>
        <Link href={`/dashboard/parishioners/${head?.id}?returnTo=household`} className="absolute top-4 right-4 text-muted/60">
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </Link>
      </div>

      {/* Spouse Card */}
      {spouse ? (
        <div className="relative bg-surface-container border border-outline p-4 md:p-6 rounded-lg overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/5 -mr-8 -mt-8 rotate-45" />
          <Link href={`/dashboard/parishioners/${spouse?.id}?returnTo=household`} className="flex gap-4 items-start relative hover:opacity-90 transition-opacity flex-1">
            <div className="w-16 h-16 md:w-24 md:h-24 flex-shrink-0 overflow-hidden rounded-sm border border-border-color bg-surface-container shadow-sm">
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
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-secondary-container px-2 py-0.5 rounded-sm inline-block mb-1">
                {spouseRoleLabel}
              </span>
              <h3 className="text-lg md:text-xl font-display font-bold text-text-main leading-tight line-clamp-2">
                {spouse.christian_name} {spouse.full_name}
              </h3>
              <div className="grid grid-cols-1 gap-y-1 mt-3 text-xs text-on-surface-variant">
                {spouse.birth_date && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-sm">cake</span>
                    <span>Sinh: {formatDate(spouse.birth_date)}</span>
                  </div>
                )}
                {spouse.baptism_date && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-sm">water_drop</span>
                    <span>Rửa tội: {formatDate(spouse.baptism_date)}</span>
                  </div>
                )}
                {spouse.marriage_date && (
                  <div className="flex items-center gap-1.5 font-medium text-orange-600">
                    <span className="material-symbols-outlined text-sm">favorite</span>
                    <span>Hôn phối: {formatDate(spouse.marriage_date)}</span>
                  </div>
                )}
                {spouse.phone_number && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-sm">call</span>
                    <span>{spouse.phone_number}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
          <Link href={`/dashboard/parishioners/${spouse?.id}?returnTo=household`} className="text-muted/60 self-start mt-1">
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </Link>
        </div>
      ) : (
        <Link 
          href={`/dashboard/households/${household.id}/add-member?relationship=SPOUSE&gender=${expectedSpouseGender}`}
          className={cn(
            "relative border border-dashed border-border-color p-4 md:p-6 rounded-lg overflow-hidden group",
            "flex flex-col items-center justify-center bg-surface hover:bg-primary/[0.02] hover:border-primary/40 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          )}
        >
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-muted group-hover:text-primary transition-colors text-2xl">person_add</span>
          </div>
          <p className="text-muted group-hover:text-primary font-bold text-sm tracking-wide transition-colors">THÊM THÔNG TIN {spouseRoleLabel.toUpperCase()}</p>
          <p className="text-[10px] text-muted/60 mt-1 uppercase tracking-tighter">Bấm để nhập mới thành viên</p>
        </Link>
      )}
    </section>
  );
}
