"use client";

import { useParishGroupDetailQuery } from '../queries/useParishGroupQueries';
import { useAuth } from '@/components/providers/auth-provider';
import { GroupHeader } from './components/GroupHeader';
import { MembersTable } from './components/MembersTable';
import { GroupInfoCard } from './components/GroupInfoCard';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import { LoadingSection } from '@/components/ui/LoadingSection';

interface Props {
  id: string;
}

export default function GroupDetailClient({ id }: Props) {
  const { data: group, isLoading, error } = useParishGroupDetailQuery(id);
  const { user } = useAuth();
  const router = useRouter();

  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  if (isLoading) {
    return <LoadingSection message="Đang tải thông tin hội đoàn..." className="py-20" />;
  }

  if (error || !group) {
    const isThrottle = (error as { status?: number })?.status === 429;
    return (
      <div className="bg-surface rounded-2xl border border-outline p-12 text-center shadow-sm animate-in fade-in zoom-in duration-300">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
          <X className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-on-surface mb-2">
          {isThrottle ? 'Hệ thống đang bận' : 'Không tìm thấy dữ liệu'}
        </h2>
        <p className="text-on-surface-variant mb-6 max-w-md mx-auto">
          {isThrottle 
            ? 'Bạn đang gửi quá nhiều yêu cầu cùng lúc. Vui lòng đợi một lát rồi thử lại.' 
            : (error instanceof Error ? error.message : 'Không tìm thấy thông tin hội đoàn này trong hệ thống.')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button 
            onClick={() => window.location.reload()} 
            className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-xl font-bold transition-all hover:shadow-lg active:scale-95"
          >
            Thử lại ngay
          </button>
          <button 
            onClick={() => router.push('/dashboard/parish-groups')} 
            className="w-full sm:w-auto px-6 py-2.5 bg-surface text-on-surface border border-outline rounded-xl font-bold hover:bg-surface-variant transition-all"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.push('/dashboard/parish-groups')}
          className="group flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium text-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Quay lại danh sách hội đoàn
        </button>
      </div>

      <GroupHeader group={group} canEdit={canEdit} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <MembersTable group={group} canEdit={canEdit} />
        </div>
        
        <div className="space-y-6">
          <GroupInfoCard group={group} />
        </div>
      </div>
    </div>
  );
}
