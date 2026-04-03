import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/api-server';
import { HouseholdDetailHeader } from './components/HouseholdDetailHeader';
import { CoupleCards } from './components/CoupleCards';
import { MembersTable } from './components/MembersTable';
import { SplitMembersSection } from './components/SplitMembersSection';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Chi tiết Hộ giáo | Sổ Giáo Dân',
};

export const runtime = 'edge';

export default async function HouseholdDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  // Ensure ID is valid
  if (!id) {
    notFound();
  }

  let householdData = null;
  try {
    const res = await serverFetch(`/api/v1/households/${id}`);
    householdData = res?.data;
  } catch (error) {
    console.error(`Error fetching household ${id}:`, error);
  }

  if (!householdData) {
    notFound();
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Top Header */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-border-color bg-surface flex-shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/households" className="text-muted text-sm font-medium hover:text-primary transition-colors">
            Hộ giáo
          </Link>
          <span className="material-symbols-outlined text-sm text-muted/60">chevron_right</span>
          <h1 className="font-display font-bold text-lg text-primary">Chi tiết Hộ giáo {householdData.household_code}</h1>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-8 bg-background-light">
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
          <HouseholdDetailHeader household={householdData} />
          
          <CoupleCards household={householdData} />
          
          <MembersTable members={householdData.current_members || []} />
          
          <SplitMembersSection members={householdData.split_members || []} />
        </div>
      </div>
    </div>
  );
}
