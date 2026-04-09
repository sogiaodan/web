import { Metadata } from 'next';
import HouseholdSplitClient from './HouseholdSplitClient';

export const metadata: Metadata = {
  title: 'Hôn phối & Tách hộ | Sổ Giáo Dân',
};

export default async function SplitHouseholdPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  return <HouseholdSplitClient id={id} />;
}
