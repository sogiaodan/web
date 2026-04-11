interface ZoneStatCardsProps {
  totalParishioners: number;
  totalHouseholds: number;
}

export function ZoneStatCards({ totalParishioners, totalHouseholds }: ZoneStatCardsProps) {
  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="bg-surface border border-outline p-6 md:p-8 rounded-sm shadow-sm w-full flex items-center justify-between group">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant block mb-1">
            Tổng số Giáo dân
          </span>
          <span className="font-display font-bold text-4xl md:text-5xl text-on-surface leading-none">
            <span className="material-symbols-outlined text-primary text-[28px] mr-2 align-middle md:hidden">person</span>
            {totalParishioners || 0}
          </span>
        </div>
        <div className="hidden md:flex w-14 h-14 bg-primary/10 items-center justify-center rounded">
          <span className="material-symbols-outlined text-[28px] text-primary">group</span>
        </div>
      </div>

      <div className="bg-surface border border-outline p-6 md:p-8 rounded-sm shadow-sm w-full flex items-center justify-between group">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant block mb-1">
            Tổng số Hộ giáo
          </span>
          <span className="font-display font-bold text-4xl md:text-5xl text-on-surface leading-none">
            <span className="material-symbols-outlined text-primary text-[28px] mr-2 align-middle md:hidden">home</span>
            {totalHouseholds || 0}
          </span>
        </div>
        <div className="hidden md:flex w-14 h-14 bg-primary/10 items-center justify-center rounded">
          <span className="material-symbols-outlined text-[28px] text-primary">home_work</span>
        </div>
      </div>
    </div>
  );
}
