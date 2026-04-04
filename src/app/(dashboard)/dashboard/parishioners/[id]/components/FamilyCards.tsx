import Link from 'next/link';
import { ParishionerSummaryRef } from '@/types/parishioner';

interface Props {
  father: ParishionerSummaryRef | null;
  mother: ParishionerSummaryRef | null;
}

function ParentCard({
  person,
  role,
  roleLabel,
}: {
  person: ParishionerSummaryRef | null;
  role: 'CHA' | 'MẸ';
  roleLabel: string;
}) {
  const icon = role === 'CHA' ? 'person' : 'person';

  if (!person) {
    return (
      <div className="flex-1 bg-surface border border-outline rounded p-5 flex items-center gap-4 opacity-60">
        <div className="w-10 h-10 rounded-full bg-[#F5F5F4] border border-outline flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[#78716C] text-lg">{icon}</span>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#78716C] font-body mb-0.5">
            {roleLabel}
          </p>
          <p className="text-sm font-body text-[#78716C] italic">Chưa có thông tin</p>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/dashboard/parishioners/${person.id}`}
      className="flex-1 bg-surface border border-outline rounded p-5 flex items-center gap-4 hover:border-primary/50 hover:shadow-sm transition-all group active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-primary text-lg">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#78716C] font-body mb-0.5">
          {roleLabel}
        </p>
        {person.christian_name && (
          <p className="text-xs text-primary font-display italic">{person.christian_name}</p>
        )}
        <p className="font-display font-bold text-[#1C1917] text-base leading-tight truncate">
          {person.full_name}
        </p>
      </div>
      <span className="material-symbols-outlined text-[#78716C] group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0">
        chevron_right
      </span>
    </Link>
  );
}

export function FamilyCards({ father, mother }: Props) {
  return (
    <section>
      <h2 className="font-display font-bold text-lg text-[#1C1917] mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-xl">family_restroom</span>
        Thân phụ &amp; Thân mẫu
      </h2>
      <div className="flex flex-col md:flex-row gap-4">
        <ParentCard person={father} role="CHA" roleLabel="CHA" />
        <ParentCard person={mother} role="MẸ" roleLabel="MẸ" />
      </div>
    </section>
  );
}
