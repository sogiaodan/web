import { Users, ShieldCheck, Tags } from 'lucide-react';

interface Props {
  totalGroups: number;
  totalMembers: number;
  totalCategories: number;
}

export function ParishGroupSummaryCards({ totalGroups, totalMembers, totalCategories }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      <div className="bg-surface p-6 rounded-2xl border border-outline flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
        <div>
          <p className="text-on-surface-variant font-body text-sm font-medium uppercase tracking-wider mb-1">
            Tổng hội đoàn
          </p>
          <p className="text-4xl font-display font-bold text-on-surface">
            {totalGroups}
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <ShieldCheck className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-surface p-6 rounded-2xl border border-outline flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
        <div>
          <p className="text-on-surface-variant font-body text-sm font-medium uppercase tracking-wider mb-1">
            Tổng thành viên
          </p>
          <p className="text-4xl font-display font-bold text-on-surface">
            {totalMembers}
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Users className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-surface p-6 rounded-2xl border border-outline flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
        <div>
          <p className="text-on-surface-variant font-body text-sm font-medium uppercase tracking-wider mb-1">
            Phân loại
          </p>
          <p className="text-4xl font-display font-bold text-on-surface">
            {totalCategories}
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Tags className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
