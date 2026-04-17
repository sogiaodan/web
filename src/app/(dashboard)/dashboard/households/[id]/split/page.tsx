import { Metadata } from 'next';
import { Suspense } from 'react';
import HouseholdSplitClient from './HouseholdSplitClient';

export const metadata: Metadata = {
  title: 'Tách hộ | Sổ Giáo Dân',
};

export default async function SplitHouseholdPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  return (
    <Suspense fallback={
      <div className="flex-1 flex justify-center items-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    }>
      <HouseholdSplitClient id={id} />
    </Suspense>
  );
}
