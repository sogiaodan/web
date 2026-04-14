'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ParishionerSearchCombobox, ParishionerLookup } from '@/components/ui/ParishionerSearchCombobox';
import { PriestDropdown } from '@/components/ui/PriestDropdown';
import { BookInfoFields } from '@/components/ui/BookInfoFields';
import { SacramentType } from '@/types/sacrament';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';

const sacramentSchema = z.object({
  parishioner_id: z.string().min(1, 'Vui lòng chọn người lãnh nhận'),
  date: z.string().min(1, 'Vui lòng chọn ngày lãnh nhận').refine((val) => {
    return new Date(val).getTime() <= new Date().getTime();
  }, 'Ngày lãnh nhận không được lớn hơn ngày hiện tại'),
  place: z.string().optional(),
  minister_id: z.string().optional(),
  godparent_name: z.string().optional(),
  book_no: z.string().optional(),
  page_no: z.string().optional(),
  registry_number: z.string().optional(),
  note: z.string().optional(),
});

type SacramentFormValues = z.infer<typeof sacramentSchema>;

interface SacramentFormProps {
  type: SacramentType;
  id?: string;
  initialData?: Partial<SacramentFormValues>;
  initialParishioner?: ParishionerLookup | null;
  readOnly?: boolean;
}

import { useCreateSacrament, useUpdateSacrament } from '../../queries/useSacramentMutations';

export function SacramentForm({ type, id, initialData, initialParishioner, readOnly = false }: SacramentFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  const createMutation = useCreateSacrament();
  const updateMutation = useUpdateSacrament(id || '');

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SacramentFormValues>({
    resolver: zodResolver(sacramentSchema),
    defaultValues: {
      parishioner_id: initialData?.parishioner_id || '',
      date: initialData?.date || '',
      place: initialData?.place || (user?.church_name 
        ? (user.church_name.toLowerCase().startsWith('giáo xứ') ? user.church_name : `Giáo xứ ${user.church_name}`) 
        : ''),
      minister_id: initialData?.minister_id || '',
      godparent_name: initialData?.godparent_name || '',
      book_no: initialData?.book_no || '',
      page_no: initialData?.page_no || '',
      registry_number: initialData?.registry_number || '',
      note: initialData?.note || '',
    },
  });

  const isEdit = !!id;

  const onSubmit = async (data: SacramentFormValues) => {
    if (readOnly) return;
    try {
      const payload = { ...data, type };
      
      if (isEdit) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }

      toast.success(isEdit ? 'Cập nhật bí tích thành công!' : 'Ghi nhận bí tích thành công!');
      router.push('/dashboard/sacraments');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Có lỗi xảy ra khi lưu bí tích.');
      console.error(error);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-surface rounded-sm border border-outline p-6">
        <div className="space-y-6">
          <Controller
            control={control}
            name="parishioner_id"
            render={({ field }) => (
              <ParishionerSearchCombobox
                value={field.value}
                onChange={(id) => field.onChange(id || '')}
                error={errors.parishioner_id?.message}
                disabled={readOnly}
                initialSelected={initialParishioner}
              />
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                Ngày lãnh nhận <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                max={new Date().toISOString().substring(0, 10)}
                disabled={readOnly}
                {...register('date')}
                className={`w-full bg-surface border rounded-sm px-3 py-3 text-sm font-body focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${
                  errors.date ? 'border-red-500 text-on-surface' : 'border-outline text-on-surface'
                } ${readOnly ? 'opacity-70 cursor-not-allowed bg-surface-container' : ''}`}
              />
              {errors.date && <p className="mt-1 text-[10px] text-red-500">{errors.date.message}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                Nơi lãnh nhận
              </label>
              <input
                type="text"
                disabled={readOnly}
                {...register('place')}
                placeholder="Ví dụ: Giáo xứ Kẻ Sặt..."
                className={`w-full bg-surface border border-outline rounded-sm px-3 py-3 text-sm font-body text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${readOnly ? 'opacity-70 cursor-not-allowed bg-surface-container' : ''}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Controller
              control={control}
              name="minister_id"
              render={({ field }) => (
                <PriestDropdown
                  value={field.value || null}
                  onChange={(id) => field.onChange(id || '')}
                  error={errors.minister_id?.message}
                  disabled={readOnly}
                />
              )}
            />

            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                Người đỡ đầu
              </label>
              <input
                type="text"
                disabled={readOnly}
                {...register('godparent_name')}
                placeholder="VD: Giuse Nguyễn Văn A"
                className={`w-full bg-surface border border-outline rounded-sm px-3 py-3 text-sm font-body text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${readOnly ? 'opacity-70 cursor-not-allowed bg-surface-container' : ''}`}
              />
            </div>
          </div>
        </div>

        <Controller
          control={control}
          name="book_no"
          render={({ field: bookNoField }) => (
            <Controller
              control={control}
              name="page_no"
              render={({ field: pageNoField }) => (
                <Controller
                  control={control}
                  name="registry_number"
                  render={({ field: registryNumberField }) => (
                    <BookInfoFields
                      bookNo={bookNoField.value || ''}
                      onBookNoChange={bookNoField.onChange}
                      pageNo={pageNoField.value || ''}
                      onPageNoChange={pageNoField.onChange}
                      registryNumber={registryNumberField.value || ''}
                      onRegistryNumberChange={registryNumberField.onChange}
                    />
                  )}
                />
              )}
            />
          )}
        />

        <div className="mt-6">
          <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
            Ghi chú
          </label>
          <textarea
            {...register('note')}
            disabled={readOnly}
            rows={3}
            placeholder="Ghi chú thêm về bí tích..."
            className={`w-full bg-surface border border-outline rounded-sm px-3 py-3 text-sm font-body text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none ${readOnly ? 'opacity-70 cursor-not-allowed bg-surface-container' : ''}`}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
        {!readOnly && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-sm font-bold text-sm hover:bg-primary/90 transition-colors shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'CẬP NHẬT BẢN GHI' : 'GHI NHẬN BẢN GHI'}
          </button>
        )}
        <button
          type="button"
          onClick={() => router.push('/dashboard/sacraments')}
          className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-primary hover:bg-surface-hover rounded-sm transition-colors border border-primary sm:border-transparent focus-visible:border-outline order-2 sm:order-1"
        >
          Hủy bỏ
        </button>
      </div>
    </form>
  );
}
