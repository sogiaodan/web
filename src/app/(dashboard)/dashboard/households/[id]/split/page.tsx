import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/api-server';
import { SplitWizard } from './components/SplitWizard';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Hôn phối & Tách hộ | Sổ Giáo Dân',
};

export default async function SplitHouseholdPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  // Fetch current household and all zones
  const [householdRes, zonesRes] = await Promise.all([
    serverFetch(`/api/v1/households/${id}`),
    serverFetch('/api/v1/zones')
  ]);

  const householdData = householdRes?.data;
  const zonesData = zonesRes?.data || [];

  if (!householdData) {
    notFound();
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      <header className="h-16 flex items-center justify-between px-8 border-b border-border-color bg-surface flex-shrink-0 sticky top-0 z-30">
        <h1 className="font-display font-bold text-2xl text-text-main">Hôn phối & Tách hộ</h1>
      </header>

      <div className="flex-1 overflow-y-auto w-full bg-background pb-32">
        <SplitWizard originHousehold={householdData} zones={zonesData} />
      </div>
    </div>
  );
}
