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
    <section className="space-y-4 pt-4 border-t border-outline-variant">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-muted text-2xl">person_remove</span>
        <h3 className="text-lg md:text-xl font-display font-bold text-muted">Thành viên đã tách hộ</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.map((member) => (
          <div 
            key={member.id} 
            className="group relative bg-surface border border-outline rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-primary/40 hover:shadow-md"
          >
            {/* Left side: Avatar + Info */}
            <div className="flex items-center gap-4">
              <div className={`relative w-12 h-12 rounded-full border flex items-center justify-center shrink-0 ${
                member.gender === 'MALE' 
                  ? 'bg-blue-50 border-blue-100 text-blue-600' 
                  : member.gender === 'FEMALE'
                  ? 'bg-rose-50 border-rose-100 text-rose-600'
                  : 'bg-[#F5F5F4] border-outline text-[#78716C]'
              }`}>
                <span className="material-symbols-outlined text-2xl">
                  {member.gender === 'MALE' ? 'male' : member.gender === 'FEMALE' ? 'female' : 'person'}
                </span>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-50 text-red-500 border border-red-100 flex items-center justify-center">
                   <span className="material-symbols-outlined text-[10px] font-bold">remove</span>
                </div>
              </div>
              
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                   <p className="font-display font-bold text-text-main text-base truncate">
                     {member.christian_name} {member.full_name}
                   </p>
                </div>
                <p className="text-xs text-muted font-body mt-0.5">
                  {member.relationship} <span className="mx-1">•</span> Tách hộ: {formatDate(member.split_date)}
                </p>
              </div>
            </div>

            {/* Right side: Badge + Link */}
            <div className="flex flex-col items-end justify-between gap-2 self-start sm:self-center">
               <span className="text-[10px] font-bold text-[#78716C] bg-[#F5F5F4] border border-[#D6D3D1] px-2 py-0.5 rounded tracking-wider uppercase">
                 Tách hộ
               </span>
               <Link
                 href={`/dashboard/households/${member.new_household_id}`}
                 className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline group/link"
               >
                 <span className="text-muted font-normal">Xem hộ mới:</span>
                 <span className="text-inherit">{member.new_household_code}</span>
                 <span className="material-symbols-outlined text-sm group-hover/link:translate-x-0.5 transition-transform">open_in_new</span>
               </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
