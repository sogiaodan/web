import { ParishionerSummary } from '@/types/household';
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

function calcAge(dateStr?: string): string {
  if (!dateStr) return '';
  const age = new Date().getFullYear() - new Date(dateStr).getFullYear();
  return ` • ${age} tuổi`;
}

export function MembersTable({ members }: { members: ParishionerSummary[] }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESIDING':
        return <span className="bg-success-bg text-success text-[10px] font-bold px-2 py-0.5 border border-success/20 uppercase rounded-sm">Hiện diện</span>;
      case 'ABSENT':
        return <span className="bg-secondary-container text-secondary text-[10px] font-bold px-2 py-0.5 border border-secondary/20 uppercase rounded-sm">Vắng mặt</span>;
      case 'MOVED':
        return <span className="bg-surface-container-highest text-on-surface-variant text-[10px] font-bold px-2 py-0.5 border border-outline-variant/60 uppercase rounded-sm">Chuyển xứ</span>;
      case 'DECEASED':
        return <span className="bg-surface-container-highest text-on-surface-variant text-[10px] font-bold px-2 py-0.5 border border-outline-variant/60 uppercase rounded-sm font-body italic opacity-70">Đã qua đời</span>;
      default:
        return <span className="bg-success-bg text-success text-[10px] font-bold px-2 py-0.5 border border-success/20 uppercase rounded-sm">Hiện diện</span>;
    }
  };

  const formatRelationship = (member: ParishionerSummary) => {
    const rel = member.relationship_to_head || member.relationship;
    const isMale = member.gender === 'MALE';

    switch (rel) {
      case 'HEAD': return 'Chủ hộ';
      case 'SPOUSE': return isMale ? 'Chồng' : 'Vợ';
      case 'CHILD': return 'Con';
      case 'GRANDCHILD': return 'Cháu';
      case 'PARENT': return isMale ? 'Cha' : 'Mẹ';
      default: return rel || 'Thành viên';
    }
  };

  return (
    <section className="space-y-4 pt-8 md:pt-10">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
        <h3 className="text-lg md:text-xl font-display font-bold text-text-main uppercase tracking-tight">Thành viên hiện tại</h3>
      </div>

      {/* ── DESKTOP TABLE ── */}
      <div className="hidden md:block overflow-hidden border border-border-color rounded-sm bg-surface shadow-sm relative corner-accent-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background-light border-b border-border-color">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted">Thánh hiệu & Họ tên</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted">Quan hệ</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted">Ngày sinh</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted">Trạng thái</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color">
            {(!members || members.length === 0) ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted font-medium italic">
                  Chưa có thành viên nào trong danh sách hiện tại.
                </td>
              </tr>
            ) : members.map((member) => (
              <tr key={member.id} className="hover:bg-primary/[0.01] transition-colors group">
                <td className="px-6 py-5">
                  <div className="font-display font-bold text-text-main group-hover:text-primary transition-colors">
                    {member.christian_name} {member.full_name}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm font-semibold text-text-main bg-surface-container px-2 py-0.5 rounded-sm border border-border-color/30">
                    {formatRelationship(member)}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm text-text-main font-medium">{formatDate(member.birth_date)}</td>
                <td className="px-6 py-5">
                  {getStatusBadge(member.status ?? 'RESIDING')}
                </td>
                <td className="px-6 py-5 text-right">
                  <Link 
                    href={`/dashboard/parishioners/${member.id}?returnTo=household`}
                    className="text-primary text-xs font-bold hover:underline underline-offset-4 uppercase tracking-tighter"
                  >
                    Chi tiết <span className="material-symbols-outlined text-[14px] align-middle">arrow_forward</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MOBILE CARD LIST ── */}
      <div className="md:hidden space-y-3">
        {(!members || members.length === 0) ? (
          <div className="bg-surface border border-outline rounded p-8 text-center text-muted italic text-sm">Chưa có thành viên nào.</div>
        ) : members.map((member, idx) => (
          <Link
            key={member.id}
            href={`/dashboard/parishioners/${member.id}?returnTo=household`}
            className="block bg-surface border border-border-color rounded-sm p-4 relative active:scale-[0.98] transition-transform shadow-sm overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-sm bg-surface-container flex items-center justify-center font-display font-bold text-primary text-lg shrink-0 border border-border-color/50">
                {member.full_name?.charAt(0) || String(idx + 1)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-bold text-text-main leading-tight line-clamp-1">
                    {member.christian_name} {member.full_name}
                  </p>
                  <span className="material-symbols-outlined text-muted text-sm shrink-0">chevron_right</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                  <span className="text-[10px] font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">
                    {formatRelationship(member)}
                  </span>
                  <span className="text-[10px] font-medium text-muted">
                    {formatDate(member.birth_date)}{calcAge(member.birth_date ?? '')}
                  </span>
                </div>
                <div className="mt-2">{getStatusBadge(member.status ?? 'RESIDING')}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
