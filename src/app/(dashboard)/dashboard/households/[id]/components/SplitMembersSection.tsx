import { SplitMemberSummary } from '@/types/household';
import Link from 'next/link';

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
  } catch (e) {
    return dateStr;
  }
}

export function SplitMembersSection({ members }: { members: SplitMemberSummary[] }) {
  if (!members || members.length === 0) return null;

  return (
    <section className="space-y-4 pt-8 md:pt-10">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-muted">account_tree</span>
        <h3 className="text-lg md:text-xl font-display font-bold text-muted">Đã tách hộ / Di cư</h3>
      </div>

      {/* ── DESKTOP GRID (md: 2 cols) ── */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.map((member) => (
          <div key={member.id} className="border border-border-color p-4 bg-surface rounded shadow-sm flex justify-between items-center group hover:border-primary/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-background-light flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined">person_remove</span>
              </div>
              <div>
                <div className="font-display font-bold text-text-main line-clamp-1">
                  {member.christian_name} {member.full_name}
                </div>
                <div className="text-xs text-muted">
                  {member.relationship} • Tách hộ: {formatDate(member.split_date)}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="bg-hover-bg text-muted text-[10px] font-bold px-2 py-0.5 border border-border-color uppercase rounded-sm">
                Tách hộ
              </span>
              <Link
                href={`/dashboard/households/${member.new_household_id}`}
                className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"
              >
                Xem hộ mới: {member.new_household_code}
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* ── MOBILE CARD LIST (hidden on md+) ── */}
      <div className="md:hidden bg-surface-container-low border border-outline divide-y divide-outline-variant rounded">
        {members.map((member, idx) => (
          <div key={member.id} className="flex items-center justify-between px-4 py-3 min-h-[64px] opacity-70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center font-display font-bold text-on-surface-variant text-sm shrink-0">
                {member.christian_name?.charAt(0) || String(idx + 1)}
              </div>
              <div>
                <p className="font-bold text-sm text-on-surface leading-tight">
                  {member.christian_name} {member.full_name}
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {member.relationship} • Đã lập gia đình
                  {member.split_date ? ` (${new Date(member.split_date).getFullYear()})` : ''}
                </p>
              </div>
            </div>
            <Link
              href={`/dashboard/households/${member.new_household_id}`}
              className="ml-2 shrink-0 w-12 h-12 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-sm">open_in_new</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
