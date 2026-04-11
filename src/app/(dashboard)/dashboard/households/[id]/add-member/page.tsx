import { Metadata } from 'next';
import HouseholdAddMemberClient from './HouseholdAddMemberClient';

export const metadata: Metadata = {
  title: 'Thêm Khai sinh | Sổ Giáo Dân',
};

export default async function AddMemberPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  return <HouseholdAddMemberClient id={id} />;
}
