import { HouseholdStats } from '@/types/household';

export function HouseholdSummaryCards({ stats }: { stats: HouseholdStats }) {
  if (!stats) return null;

  return (
    <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
      <div className="bg-surface border border-border-color p-5 md:p-6 rounded shadow-sm flex items-center gap-4 group">
        <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary rounded-lg transition-transform group-hover:rotate-6 shrink-0">
          <span className="material-symbols-outlined">home</span>
        </div>
        <div>
          <p className="text-xl md:text-2xl font-display font-bold">{stats.total_households?.toLocaleString() || 0}</p>
          <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mt-0.5">Tổng số hộ giáo</p>
        </div>
      </div>
      
      <div className="bg-surface border border-border-color p-5 md:p-6 rounded shadow-sm flex items-center gap-4 group">
        <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary rounded-lg transition-transform group-hover:rotate-6 shrink-0">
          <span className="material-symbols-outlined">group</span>
        </div>
        <div>
          <p className="text-xl md:text-2xl font-display font-bold">{stats.total_members?.toLocaleString() || 0}</p>
          <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mt-0.5">Tổng số nhân khẩu</p>
        </div>
      </div>
      
      <div className="bg-surface border border-border-color p-5 md:p-6 rounded shadow-sm flex items-center gap-4 group">
        <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary rounded-lg transition-transform group-hover:rotate-6 shrink-0">
          <span className="material-symbols-outlined">corporate_fare</span>
        </div>
        <div>
          <p className="text-xl md:text-2xl font-display font-bold">{stats.total_zones?.toLocaleString() || 0}</p>
          <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mt-0.5">Số lượng Giáo khu</p>
        </div>
      </div>
    </div>
  );
}
