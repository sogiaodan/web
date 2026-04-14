import { ShieldCheck, Users, Tags } from 'lucide-react';

interface Props {
  totalGroups: number;
  totalMembers: number;
}

export function ParishGroupSummaryCards({ totalGroups, totalMembers }: Props) {
  return (
    <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
      <div className="bg-surface border border-border-color p-5 md:p-6 rounded shadow-sm flex items-center gap-4 group">
        <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary rounded-lg transition-transform group-hover:rotate-6 shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xl md:text-2xl font-display font-bold">{totalGroups.toLocaleString() || 0}</p>
          <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mt-0.5">Tổng số hội đoàn</p>
        </div>
      </div>
      
      <div className="bg-surface border border-border-color p-5 md:p-6 rounded shadow-sm flex items-center gap-4 group">
        <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary rounded-lg transition-transform group-hover:rotate-6 shrink-0">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xl md:text-2xl font-display font-bold">{totalMembers.toLocaleString() || 0}</p>
          <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mt-0.5">Tổng số thành viên</p>
        </div>
      </div>
    </div>
  );
}
