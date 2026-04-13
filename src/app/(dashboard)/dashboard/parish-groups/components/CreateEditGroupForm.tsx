"use client";

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ParishGroupDetail, ParishGroupCategory } from '@/types/parish-group';
import { useCreateParishGroup, useUpdateParishGroup } from '../queries/useParishGroupMutations';
import { FieldLabel, getInputCls, SectionHeader } from '@/components/dashboard/shared/FormPrimitives';
import { CategoryCombobox } from './CategoryCombobox';
import { IconGalleryPicker } from './IconGalleryPicker';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

const formSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên hội đoàn'),
  description: z.string().optional().nullable(),
  category_id: z.string().min(1, 'Vui lòng chọn phân loại'),
  established_date: z.string().optional().nullable(),
  icon_url: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  initialData?: ParishGroupDetail;
  categories: ParishGroupCategory[];
  isEdit?: boolean;
}

export function CreateEditGroupForm({ initialData, categories, isEdit }: Props) {
  const router = useRouter();
  const createMutation = useCreateParishGroup();
  const updateMutation = useUpdateParishGroup(initialData?.id || '');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      category_id: initialData?.category.id || '',
      established_date: initialData?.established_date || '',
      icon_url: initialData?.icon_url || null,
      is_active: initialData ? initialData.is_active : true,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(data);
        toast.success('Cập nhật hội đoàn thành công');
        router.push(`/dashboard/parish-groups/${initialData?.id}`);
      } else {
        const res = await createMutation.mutateAsync(data);
        toast.success('Tạo hội đoàn thành công');
        router.push(`/dashboard/parish-groups/${res.id}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra khi lưu hội đoàn');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-surface rounded-2xl border border-outline p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Thông tin cơ bản" subtitle="Các thông tin chính của hội đoàn" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 col-span-1 md:col-span-2">
          <FieldLabel required>Tên hội đoàn</FieldLabel>
          <input
            {...register('name')}
            className={getInputCls(!!errors.name)}
            placeholder="VD: Ca đoàn Thiên Thần"
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
        </div>

        <div className="space-y-2 col-span-1 md:col-span-2">
          <FieldLabel>Mô tả / Sứ mạng</FieldLabel>
          <textarea
            {...register('description')}
            className={getInputCls(!!errors.description)}
            rows={3}
            placeholder="Viết vài dòng mô tả về hội đoàn..."
          />
          {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
        </div>

        <div className="space-y-2">
          <FieldLabel required>Phân loại</FieldLabel>
          <Controller
            control={control}
            name="category_id"
            render={({ field }) => (
              <CategoryCombobox
                categories={categories}
                value={field.value}
                onChange={field.onChange}
                error={errors.category_id?.message}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel>Ngày thành lập</FieldLabel>
          <input
            type="date"
            {...register('established_date')}
            className={getInputCls(!!errors.established_date)}
          />
        </div>

        {isEdit && (
          <div className="space-y-2 flex items-center gap-4 mt-6">
            <input
              type="checkbox"
              id="is_active"
              {...register('is_active')}
              className="w-5 h-5 rounded border-outline text-primary focus:ring-primary"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-on-surface">
              Hội đoàn đang hoạt động
            </label>
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-outline">
        <Controller
          control={control}
          name="icon_url"
          render={({ field }) => (
            <IconGalleryPicker value={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-outline">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 h-12 rounded-full font-bold border border-outline hover:bg-surface-variant transition-colors w-full sm:w-auto"
        >
          Hủy bỏ
        </button>
        <PrimaryButton type="submit" isLoading={isSubmitting} className="w-full sm:w-auto min-w-[120px]">
          {isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
        </PrimaryButton>
      </div>
    </form>
  );
}
