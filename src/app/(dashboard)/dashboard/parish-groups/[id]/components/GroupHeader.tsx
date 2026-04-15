"use client";

import { ParishGroupDetail } from '@/types/parish-group';
import { ShieldCheck, Edit, Trash2, CalendarDays, Users } from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useDeleteParishGroup } from '../../queries/useParishGroupMutations';
import { toast } from 'sonner';

interface Props {
  group: ParishGroupDetail;
  canEdit: boolean;
}

export function GroupHeader({ group, canEdit }: Props) {
  const router = useRouter();
  const deleteMutation = useDeleteParishGroup();

  const handleDelete = async () => {
    if (confirm('Bạn có chắc chắn muốn xóa hội đoàn này? Thao tác này có thể không phục hồi được.')) {
      try {
        await deleteMutation.mutateAsync(group.id);
        toast.success('Đã xóa hội đoàn');
        router.push('/dashboard/parish-groups');
      } catch (err: unknown) {
        toast.error((err as Error).message || 'Lỗi khi xóa hội đoàn');
      }
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-outline relative overflow-hidden shadow-sm group/header">
      {/* Decorative Top Banner with subtle pattern overlay */}
      <div className="h-28 bg-gradient-to-r from-primary/10 via-primary/5 to-surface w-full absolute top-0 left-0 border-b border-outline/30" />
      
      <div className="p-6 md:p-8 pt-14 md:pt-20 relative z-10 flex flex-col md:flex-row gap-6 md:items-start justify-between">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-24 h-24 bg-surface rounded-3xl border-4 border-surface shadow-xl flex-shrink-0 flex items-center justify-center relative overflow-hidden transition-transform hover:scale-105 duration-300">
            {group.icon_url ? (
              <Image src={group.icon_url} alt={group.name} fill sizes="120px" className="object-contain p-2" priority />
            ) : (
              <ShieldCheck className="w-12 h-12 text-primary/40" />
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-4xl font-display font-black text-on-surface tracking-tight">
                  {group.name}
                </h1>
                <div className="flex items-center gap-2">
                  {group.category && (
                    <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-primary text-white shadow-sm shadow-primary/20">
                      {group.category}
                    </span>
                  )}
                  <span
                    className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${
                      group.is_active
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}
                  >
                    {group.is_active ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                  </span>
                </div>
              </div>
              {group.description && (
                <p className="text-on-surface-variant/80 font-body text-base max-w-3xl leading-relaxed italic">
                  &quot;{group.description}&quot;
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-on-surface-variant pt-2 border-t border-outline/50">
              <div className="flex items-center gap-2 bg-surface-variant/30 px-3 py-1.5 rounded-lg border border-outline/30">
                <CalendarDays className="w-4 h-4 text-primary" />
                <span className="font-medium">
                  {group.established_date ? `Thành lập: ${formatDate(group.established_date)}` : <span className="italic opacity-60">Chưa rõ ngày thành lập</span>}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-surface-variant/30 px-3 py-1.5 rounded-lg border border-outline/30">
                <Users className="w-4 h-4 text-secondary" />
                <span className="font-medium text-on-surface">{group.members.length} thành viên đã tham gia</span>
              </div>
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto mt-6 md:mt-0 p-1 bg-surface-variant/10 rounded-2xl border border-outline/20">
            <button
              onClick={() => router.push(`/dashboard/parish-groups/${group.id}/edit`)}
              className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-surface hover:bg-primary hover:text-white text-on-surface border border-outline px-6 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95 min-h-[48px]"
            >
              <Edit className="w-4 h-4" />
              Sửa thông tin
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-surface hover:bg-red-50 text-red-600 border border-outline hover:border-red-200 px-6 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95 min-h-[48px]"
            >
              <Trash2 className="w-4 h-4" />
              Xóa hội đoàn
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
