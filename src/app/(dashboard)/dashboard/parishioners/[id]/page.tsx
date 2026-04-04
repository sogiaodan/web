import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { serverFetch } from '@/lib/api-server';
import { GetMeResponse } from '@/lib/auth-api';
import { ParishionerDetail } from '@/types/parishioner';
import { ParishionerProfileHeader } from './components/ParishionerProfileHeader';
import { FamilyCards } from './components/FamilyCards';
import { SiblingsSection } from './components/SiblingsSection';
import { GenealogyTree } from './components/GenealogyTree';
import { SacramentalTimeline } from './components/SacramentalTimeline';

export const metadata: Metadata = {
  title: 'Chi tiết Giáo dân | Sổ Giáo Dân',
  description: 'Xem thông tin chi tiết, gia phả và tiến trình bí tích của giáo dân.',
};

export const runtime = 'edge';

export default async function ParishionerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [parishionerRes, meRes] = await Promise.all([
    serverFetch<ParishionerDetail>(`/api/v1/parishioners/${id}`),
    serverFetch<GetMeResponse>('/api/v1/auth/me'),
  ]);

  const parishioner = parishionerRes?.data;
  if (!parishioner) {
    notFound();
  }

  const user = meRes?.data?.user;
  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link
          href="/dashboard/parishioners"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#1C1917] hover:text-primary transition-colors mb-6 group font-body"
        >
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </span>
          Chi tiết Giáo dân
        </Link>

        {/* Profile Header */}
        <ParishionerProfileHeader parishioner={parishioner} canEdit={canEdit} />

        {/* Main Content: 2-column layout */}
        <div className="mt-8 flex flex-col lg:flex-row gap-8">
          {/* Left Column: Family + Genealogy */}
          <div className="w-full lg:w-[60%] space-y-8">
            <FamilyCards father={parishioner.father} mother={parishioner.mother} />
            {parishioner.siblings && parishioner.siblings.length > 0 && (
              <SiblingsSection siblings={parishioner.siblings} />
            )}
            <GenealogyTree
              genealogy={parishioner.genealogy}
              father={parishioner.father}
              currentName={parishioner.full_name}
              christianName={parishioner.christian_name}
            />
          </div>

          {/* Right Column: Sacramental Timeline */}
          <div className="w-full lg:w-[40%]">
            <SacramentalTimeline
              sacraments={parishioner.sacraments}
              marriage={parishioner.marriage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
