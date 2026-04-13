"use client";

import { useParishGroupDetailQuery } from '../queries/useParishGroupQueries';
import { useAuth } from '@/components/providers/auth-provider';
import { GroupHeader } from './components/GroupHeader';
import { MembersTable } from './components/MembersTable';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface Props {
  id: string;
}

export default function GroupDetailClient({ id }: Props) {
  const { data: group, isLoading, error } = useParishGroupDetailQuery(id);
  const { user } = useAuth();
  const router = useRouter();

  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  if (isLoading) {
    return (
      <div className="space-y-6 md:space-y-8 animate-pulse">
        <div className="h-48 bg-surface-container rounded-2xl w-full" />
        <div className="h-96 bg-surface-container rounded-2xl w-full" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="bg-surface rounded-2xl border border-outline p-12 text-center">
        <p className="text-on-surface-variant mb-4">Không tìm thấy thông tin hội đoàn.</p>
        <button onClick={() => router.back()} className="text-primary hover:underline font-bold">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      <button 
        onClick={() => router.push('/dashboard/parish-groups')}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium text-sm w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại danh sách
      </button>

      <GroupHeader group={group} canEdit={canEdit} />
      
      <MembersTable group={group} canEdit={canEdit} />
    </div>
  );
}
