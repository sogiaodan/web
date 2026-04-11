import { Metadata } from 'next';
import ZoneDetailClient from './ZoneDetailClient';

export const metadata: Metadata = {
  title: 'Chi tiết Giáo khu | Sổ Giáo Dân',
};

export default async function ZoneDetailPage({ 
  params,
}: { 
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  
  return <ZoneDetailClient id={id} />;
}
