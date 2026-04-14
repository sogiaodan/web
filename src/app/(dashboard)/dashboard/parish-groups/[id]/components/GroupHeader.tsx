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
    <div className="bg-surface rounded-2xl border border-outline relative overflow-hidden shadow-sm">
      {/* Decorative Top Banner */}
      <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent w-full absolute top-0 left-0" />
      
      <div className="p-6 md:p-8 pt-12 md:pt-16 relative z-10 flex flex-col md:flex-row gap-6 md:items-start justify-between">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-24 h-24 bg-surface rounded-2xl border-4 border-surface shadow-md flex-shrink-0 flex items-center justify-center relative overflow-hidden">
            {group.icon_url ? (
              <Image src={group.icon_url} alt={group.name} layout="fill" objectFit="contain" className="p-3" />
            ) : (
              <ShieldCheck className="w-12 h-12 text-primary" />
            )}
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-display font-bold text-on-surface">
                  {group.name}
                </h1>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {group.category.name}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                    group.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {group.is_active ? 'Hoạt động' : 'Ngưng hoạt động'}
                </span>
              </div>
              {group.description && (
                <p className="text-on-surface-variant font-body text-sm max-w-2xl">
                  {group.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant pt-2">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4" />
                <span>
                  Thành lập: {group.established_date ? formatDate(group.established_date) : <span className="italic">Chưa cập nhật</span>}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{group.members.length} thành viên</span>
              </div>
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
            <button
              onClick={() => router.push(`/dashboard/parish-groups/${group.id}/edit`)}
              className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-surface hover:bg-surface-variant text-on-surface border border-outline px-4 py-2.5 rounded-xl font-bold transition-colors min-h-[48px]"
            >
              <Edit className="w-4 h-4" />
              Sửa thông tin
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-surface hover:bg-red-50 text-red-600 border border-outline hover:border-red-200 px-4 py-2.5 rounded-xl font-bold transition-colors min-h-[48px]"
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
