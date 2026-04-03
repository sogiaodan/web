import { Household } from '@/types/household';
import Link from 'next/link';

export function HouseholdDetailHeader({ household }: { household: Household }) {
  const headName = household.head 
    ? `${household.head.christian_name} ${household.head.full_name}`
    : 'Không xác định';

  return (
    <section className="flex flex-col gap-6 border-b border-border-color pb-6 md:pb-8">
      <div>
        {/* Household Code Badge */}
        <div className="flex items-center gap-2 text-primary mb-3">
          <span className="material-symbols-outlined text-sm">home_work</span>
          <span className="text-xs font-bold uppercase tracking-widest">
            Mã hộ: {household.household_code}
          </span>
        </div>
        {/* Title — scales from text-2xl on mobile to text-4xl on desktop */}
        <h2 className="text-2xl md:text-4xl font-display font-bold text-text-main leading-tight">
          Gia đình Ông {headName}
        </h2>
        <div className="flex items-start gap-2 mt-2 text-muted">
          <span className="material-symbols-outlined text-base shrink-0 mt-0.5">location_on</span>
          <span className="text-sm">{household.address || 'Chưa cập nhật địa chỉ'}</span>
        </div>
      </div>

      {/* Action Buttons — full-width stacked on mobile, inline on desktop */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link 
          href={`/dashboard/households/${household.id}/add-member`}
          className="flex items-center justify-center gap-2 bg-primary text-white px-5 text-sm font-semibold
                     min-h-[48px] rounded-sm shadow-sm transition-all active:scale-95 hover:bg-primary/90
                     w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-lg">child_care</span>
          Thêm khai sinh
        </Link>
        <Link 
          href={`/dashboard/households/${household.id}/split`}
          className="flex items-center justify-center gap-2 bg-surface text-primary border border-primary/40
                     px-5 text-sm font-semibold min-h-[48px] rounded-sm transition-all hover:bg-primary/5
                     w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-lg">church</span>
          Thủ tục Hôn phối / Tách hộ
        </Link>
      </div>
    </section>
  );
}
