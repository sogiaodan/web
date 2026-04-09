'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { useParishionerDetailQuery } from '../../queries/useParishionerQuery';
import { ParishionerProfileHeader } from './ParishionerProfileHeader';
import { FamilyCards } from './FamilyCards';
import { SiblingsSection } from './SiblingsSection';
import { GenealogyTree } from './GenealogyTree';
import { SacramentalTimeline } from './SacramentalTimeline';

export function ParishionerDetailClient({ id, returnTo }: { id: string; returnTo?: string }) {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  const { data: parishioner, isLoading, error } = useParishionerDetailQuery(id);

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !parishioner) {
    return (
      <div className="bg-surface border border-outline rounded p-8 text-center text-on-surface-variant font-body">
        Không thể tải dữ liệu giáo dân.
      </div>
    );
  }

  return (
    <>
      <Link
        href={(returnTo === 'household' && parishioner.household)
          ? `/dashboard/households/${parishioner.household.id}`
          : '/dashboard/parishioners'
        }
        className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-primary transition-colors mb-6 group font-body"
      >
        <span className="material-symbols-outlined text-lg group-hover:-translate-x-0.5 transition-transform">
          arrow_back
        </span>
        {(returnTo === 'household' && parishioner.household)
          ? `Quay lại Hộ giáo ${parishioner.household.household_code || ''}`
          : 'Danh sách Giáo dân'
        }
      </Link>

      <ParishionerProfileHeader parishioner={parishioner} canEdit={canEdit} />

      <div className="mt-8 flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-[60%] space-y-8">
          <FamilyCards father={parishioner.father} mother={parishioner.mother} />
          {parishioner.siblings && parishioner.siblings.length > 0 && (
            <SiblingsSection siblings={parishioner.siblings} />
          )}
          <GenealogyTree
            genealogy={parishioner.genealogy}
            father={parishioner.father}
            mother={parishioner.mother}
            currentName={parishioner.full_name}
            christianName={parishioner.christian_name || ''}
          />
        </div>

        <div className="w-full lg:w-[40%]">
          <SacramentalTimeline
            sacraments={parishioner.sacraments}
            marriage={parishioner.marriage}
          />
        </div>
      </div>
    </>
  );
}
