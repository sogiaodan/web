import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { serverFetch } from '@/lib/api-server';
import { GetMeResponse } from '@/lib/auth-api';
import { ZoneDetail } from '@/types/zone';
import { ZoneForm } from '../../components/ZoneForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Chỉnh sửa Giáo khu | Sổ Giáo Dân',
};

export const runtime = 'edge';

export default async function EditZonePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  const [zoneRes, meRes] = await Promise.all([
    serverFetch<ZoneDetail>(`/api/v1/zones/${id}`),
    serverFetch<GetMeResponse>('/api/v1/auth/me')
  ]);

  const zone = zoneRes?.data;
  if (!zone) {
    notFound();
  }

  const user = meRes?.data?.user;
  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  if (!canEdit) {
    redirect('/dashboard/zones');
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 text-sm font-body text-on-surface-variant flex items-center gap-1">
          <Link href="/dashboard/zones" className="hover:text-primary transition-colors">Giáo khu</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link href={`/dashboard/zones/${id}`} className="hover:text-primary transition-colors">Chi tiết Giáo khu</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="font-bold text-on-surface">Chỉnh sửa</span>
        </div>
        
        <ZoneForm initialData={zone} isEdit />
      </div>
    </div>
  );
}
