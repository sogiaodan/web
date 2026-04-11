import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { ParishionerSummaryRef } from '@/types/parishioner';

interface Props {
  siblings: ParishionerSummaryRef[];
}

export function SiblingsSection({ siblings }: Props) {
  if (!siblings || siblings.length === 0) return null;

  return (
    <section>
      <h2 className="font-display font-bold text-lg text-[#1C1917] mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-xl">group</span>
        Anh chị em ({siblings.length})
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {siblings.map((sibling) => (
          <Link
            key={sibling.id}
            href={`/dashboard/parishioners/${sibling.id}`}
            className="bg-surface border border-outline rounded p-4 flex items-center gap-3 hover:border-primary/50 transition-all group active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="w-9 h-9 rounded-full bg-[#F5F5F4] border border-outline flex items-center justify-center shrink-0">
              <span className="font-display font-bold text-sm text-[#78716C]">
                {sibling.full_name?.charAt(0) || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              {sibling.christian_name && (
                <p className="text-xs text-primary font-display italic leading-none mb-0.5">
                  {sibling.christian_name}
                </p>
              )}
              <p className="font-body font-semibold text-sm text-[#1C1917] truncate">
                {sibling.full_name}
              </p>
              {sibling.birth_date && (
                <p className="text-xs text-[#78716C] font-body">
                  {sibling.gender === 'MALE' ? 'Nam' : sibling.gender === 'FEMALE' ? 'Nữ' : ''}
                  {sibling.gender && sibling.birth_date && ' · '}
                  {formatDate(sibling.birth_date)}
                </p>
              )}
            </div>
            <span className="material-symbols-outlined text-[#78716C] text-sm group-hover:text-primary transition-colors shrink-0">
              chevron_right
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
