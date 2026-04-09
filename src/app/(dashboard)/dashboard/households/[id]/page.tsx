import { Metadata } from 'next';
import HouseholdDetailClient from './HouseholdDetailClient';

export const metadata: Metadata = {
  title: 'Chi tiết Hộ giáo | Sổ Giáo Dân',
};

export default async function HouseholdDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  return <HouseholdDetailClient id={id} />;
}
