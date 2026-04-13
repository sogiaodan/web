"use client";

import { useParishGroupCategoriesQuery } from '../queries/useParishGroupQueries';
import { CreateEditGroupForm } from '../components/CreateEditGroupForm';

export default function CreateGroupClient() {
  const { data: categories, isLoading } = useParishGroupCategoriesQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-on-surface mb-2">
          Tạo hội đoàn mới
        </h1>
        <p className="text-on-surface-variant font-body text-sm">
          Thêm một hội đoàn mới vào danh sách quản lý của giáo xứ.
        </p>
      </div>

      <CreateEditGroupForm categories={categories || []} isEdit={false} />
    </div>
  );
}
