'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { Household, ParishionerSummary } from '@/types/household';

interface Props {
  head?: ParishionerSummary;
  spouse?: ParishionerSummary;
  currentHouseholdId: string;
}

function useOriginHousehold(id?: string) {
  return useQuery<Household, Error>({
    queryKey: ['households', id],
    queryFn: () => apiFetch<Household>(`/api/v1/households/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

function OriginHouseholdCard({
  title,
  personId,
  originHouseholdId,
}: {
  title: string;
  personId?: string;
  originHouseholdId?: string;
}) {
  const { data, isLoading } = useOriginHousehold(originHouseholdId);

  // Don't render if person has no origin household, or if the origin IS their own current household
  if (!originHouseholdId) return null;

  return (
    <Link
      href={`/dashboard/households/${originHouseholdId}`}
      className="group flex flex-col gap-3 bg-surface border border-outline rounded-lg p-4 hover:border-primary/40 hover:bg-primary/[0.02] transition-all active:scale-[0.99]"
    >
      {/* Label */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
          {title}
        </span>
        <span className="material-symbols-outlined text-sm text-muted group-hover:text-primary transition-colors">
          open_in_new
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 animate-pulse">
          <div className="h-8 w-8 rounded-sm bg-surface-container" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-24 bg-surface-container rounded" />
            <div className="h-2.5 w-32 bg-surface-container rounded" />
          </div>
        </div>
      ) : data ? (
        <div className="flex items-center gap-3">
          {/* Household code badge */}
          <div className="w-10 h-10 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-base">home</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text-main font-display truncate">
              {data.household_code}
            </p>
            {data.head && (
              <p className="text-xs text-on-surface-variant font-body truncate">
                Chủ hộ: {[data.head.christian_name, data.head.full_name].filter(Boolean).join(' ')}
              </p>
            )}
            {data.address && (
              <p className="text-xs text-on-surface-variant/70 font-body truncate mt-0.5">
                {data.address}
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted italic font-body">Không tìm thấy thông tin hộ giáo</p>
      )}
    </Link>
  );
}

export function ParentHouseholdsSection({ head, spouse, currentHouseholdId }: Props) {
  // Only show if origin household differs from the current household
  const headOriginId = head?.origin_household_id !== currentHouseholdId
    ? head?.origin_household_id
    : undefined;
  const spouseOriginId = spouse?.origin_household_id !== currentHouseholdId
    ? spouse?.origin_household_id
    : undefined;

  // Only show section if at least one party has a distinct origin household
  if (!headOriginId && !spouseOriginId) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-xl">family_history</span>
        <h2 className="text-sm font-bold text-text-main uppercase tracking-widest font-display">
          Hộ Gốc Phụ Mẫu
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {headOriginId && (
          <OriginHouseholdCard
            title="Cha Mẹ Chủ Hộ"
            personId={head?.id}
            originHouseholdId={headOriginId}
          />
        )}
        {spouseOriginId && (
          <OriginHouseholdCard
            title="Cha Mẹ Vợ / Chồng"
            personId={spouse?.id}
            originHouseholdId={spouseOriginId}
          />
        )}
      </div>
    </section>
  );
}
