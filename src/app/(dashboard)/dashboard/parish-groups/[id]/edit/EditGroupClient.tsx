"use client";

import { useParishGroupCategoriesQuery, useParishGroupDetailQuery } from '../../queries/useParishGroupQueries';
import { CreateEditGroupForm } from '../../components/CreateEditGroupForm';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface Props {
  id: string;
}

export default function EditGroupClient({ id }: Props) {
  const router = useRouter();
  const { data: group, isLoading: isLoadingGroup, error } = useParishGroupDetailQuery(id);
  const { data: categories, isLoading: isLoadingCategories } = useParishGroupCategoriesQuery();

  if (isLoadingGroup || isLoadingCategories) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="bg-surface rounded-2xl border border-outline p-12 text-center">
        <p className="text-on-surface-variant mb-4">Không tìm thấy thông tin hội đoàn để sửa.</p>
        <button onClick={() => router.back()} className="text-primary hover:underline font-bold">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium text-sm w-fit mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>

        <h1 className="text-2xl md:text-3xl font-display font-bold text-on-surface mb-2">
          Sửa thông tin: {group.name}
        </h1>
        <p className="text-on-surface-variant font-body text-sm">
          Cập nhật thông tin chi tiết của hội đoàn.
        </p>
      </div>

      <CreateEditGroupForm 
        categories={categories || []} 
        isEdit={true} 
        initialData={group} 
      />
    </div>
  );
}
