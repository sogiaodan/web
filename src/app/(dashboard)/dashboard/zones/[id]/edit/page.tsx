import { Metadata } from 'next';
import ZoneEditClient from './ZoneEditClient';

export const metadata: Metadata = {
  title: 'Chỉnh sửa Giáo khu | Sổ Giáo Dân',
};

export default async function EditZonePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  return <ZoneEditClient id={id} />;
}
