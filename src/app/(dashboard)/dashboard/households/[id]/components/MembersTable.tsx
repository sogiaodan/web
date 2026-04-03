import { ParishionerSummary } from '@/types/household';

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
  } catch (e) {
    return dateStr;
  }
}

function calcAge(dateStr?: string): string {
  if (!dateStr) return '';
  const age = new Date().getFullYear() - new Date(dateStr).getFullYear();
  return ` • ${age} tuổi`;
}

export function MembersTable({ members }: { members: ParishionerSummary[] }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <span className="bg-success-bg text-success text-[10px] font-bold px-2 py-0.5 border border-success/20 uppercase rounded-sm">Hiện diện</span>;
      case 'ABSENT':
        return <span className="bg-secondary-container text-secondary text-[10px] font-bold px-2 py-0.5 border border-secondary/20 uppercase rounded-sm">Vắng mặt</span>;
      case 'DECEASED':
        return <span className="bg-surface-container-highest text-on-surface-variant text-[10px] font-bold px-2 py-0.5 border border-outline-variant/60 uppercase rounded-sm">Đã qua đời</span>;
      default:
        return <span className="bg-surface-container-highest text-on-surface-variant text-[10px] font-bold px-2 py-0.5 border border-outline-variant/60 uppercase rounded-sm">Khác</span>;
    }
  };

  return (
    <section className="space-y-4 pt-8 md:pt-10">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">group</span>
        <h3 className="text-lg md:text-xl font-display font-bold text-text-main">Thành viên hiện tại</h3>
      </div>

      {/* ── DESKTOP TABLE (hidden on mobile) ── */}
      <div className="hidden md:block overflow-hidden border border-border-color rounded bg-surface shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background-light border-b border-border-color">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Thánh hiệu & Họ tên</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Quan hệ</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Ngày sinh</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted">Trạng thái</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color">
            {(!members || members.length === 0) ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted font-medium italic">
                  Chưa có thành viên nào.
                </td>
              </tr>
            ) : members.map((member) => (
              <tr key={member.id} className="hover:bg-hover-bg transition-colors">
                <td className="px-6 py-4">
                  <div className="font-display font-bold text-text-main">
                    {member.christian_name} {member.full_name}
                  </div>
                  <div className="text-xs text-muted">ID: {member.parishioner_code}</div>
                </td>
                <td className="px-6 py-4 text-sm text-text-main">{member.relationship}</td>
                <td className="px-6 py-4 text-sm text-text-main">{formatDate(member.birth_date)}</td>
                <td className="px-6 py-4">
                  {getStatusBadge(member.status ?? '')}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-primary text-sm font-bold hover:underline">Chi tiết</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MOBILE CARD LIST (hidden on md+) ── */}
      <div className="md:hidden bg-surface-container-low border border-outline divide-y divide-outline-variant rounded">
        {(!members || members.length === 0) ? (
          <p className="text-center text-muted italic py-8 text-sm">Chưa có thành viên nào.</p>
        ) : members.map((member, idx) => (
          <div
            key={member.id}
            className="flex items-center justify-between px-4 py-3 min-h-[64px] active:bg-surface-container transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* Initials avatar */}
              <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center font-display font-bold text-on-surface-variant text-sm shrink-0">
                {member.christian_name?.charAt(0) || member.full_name?.charAt(0) || String(idx + 1)}
              </div>
              <div>
                <p className="font-bold text-sm text-on-surface leading-tight">
                  {member.christian_name} {member.full_name}
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {member.relationship}{calcAge(member.birth_date ?? '')}
                </p>
                <div className="mt-1">{getStatusBadge(member.status ?? '')}</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-sm ml-2 shrink-0">
              chevron_right
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
