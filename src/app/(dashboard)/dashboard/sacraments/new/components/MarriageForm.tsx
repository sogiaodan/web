'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ParishionerSearchCombobox } from '@/components/ui/ParishionerSearchCombobox';
import { PriestDropdown } from '@/components/ui/PriestDropdown';
import { BookInfoFields } from '@/components/ui/BookInfoFields';
import { Loader2, Home } from 'lucide-react';

const marriageSchema = z.object({
  husband_id: z.string().min(1, 'Vui lòng chọn Chú rể'),
  wife_id: z.string().min(1, 'Vui lòng chọn Cô dâu'),
  marriage_date: z.string().min(1, 'Vui lòng chọn ngày cử hành'),
  place: z.string().optional(),
  status: z.enum(['VALID', 'ANNULLED']),
  witness_1_name: z.string().optional(),
  witness_2_name: z.string().optional(),
  minister_id: z.string().optional(),
  book_no: z.string().optional(),
  page_no: z.string().optional(),
  registry_number: z.string().optional(),
  note: z.string().optional(),
  is_mixed_religion: z.boolean(),
  create_household: z.boolean(),
  // Inline fields for mixed religion
  non_catholic_name: z.string().optional(),
  non_catholic_gender: z.enum(['MALE', 'FEMALE', '']).optional(),
});

type MarriageFormValues = z.infer<typeof marriageSchema>;

interface MarriageFormProps {
  id?: string;
  initialData?: Partial<MarriageFormValues>;
  initialHusband?: any;
  initialWife?: any;
  readOnly?: boolean;
}

export function MarriageForm({ id, initialData, initialHusband, initialWife, readOnly = false }: MarriageFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<MarriageFormValues>({
    resolver: zodResolver(marriageSchema),
    defaultValues: {
      husband_id: initialData?.husband_id || '',
      wife_id: initialData?.wife_id || '',
      marriage_date: initialData?.marriage_date || '',
      place: initialData?.place || '',
      status: initialData?.status || 'VALID',
      witness_1_name: initialData?.witness_1_name || '',
      witness_2_name: initialData?.witness_2_name || '',
      minister_id: initialData?.minister_id || '',
      book_no: initialData?.book_no || '',
      page_no: initialData?.page_no || '',
      registry_number: initialData?.registry_number || '',
      note: initialData?.note || '',
      is_mixed_religion: initialData?.is_mixed_religion || false,
      create_household: initialData?.create_household || false,
      non_catholic_name: initialData?.non_catholic_name || '',
      non_catholic_gender: initialData?.non_catholic_gender || '',
    },
  });

  const isEdit = !!id;
  const isMixedReligion = watch('is_mixed_religion');

  const onSubmit = async (data: MarriageFormValues) => {
    if (readOnly) return;
    setIsSubmitting(true);
    try {
      // In production, backend handles creating non-catholic parishioner 
      // if is_mixed_religion is true and fields are provided.
      // Or it expects household creation flag.
      const payload = { ...data, type: 'MARRIAGE' };
      const endpoint = isEdit ? `/api/v1/sacraments/marriages/${id}` : `/api/v1/sacraments/marriages`;
      const res = await fetch(endpoint, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(isEdit ? 'Lỗi khi cập nhật Hôn phối' : 'Lỗi khi lưu Hôn phối');
      }

      toast.success(isEdit ? 'Cập nhật Hôn phối thành công!' : 'Ghi nhận Hôn phối thành công!');
      router.push('/dashboard/sacraments?type=MARRIAGE');
    } catch (err) {
      toast.error('Có lỗi xảy ra khi lưu Hôn phối.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-surface rounded-sm border border-outline p-6 space-y-6">
        
        {/* Tân nương / Tân lang */}
        <div>
          <h3 className="font-display font-bold text-sm text-on-surface mb-4 pb-2 border-b border-outline uppercase">
            Thông tin Tân hôn
          </h3>
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer w-max">
              <input
                type="checkbox"
                disabled={readOnly}
                {...register('is_mixed_religion')}
                className="w-4 h-4 rounded border-outline text-primary focus:ring-primary disabled:opacity-50"
              />
              <span className="text-sm font-medium text-on-surface">
                Hôn phối khác đạo (chuẩn khác biệt Tôn giáo)
              </span>
            </label>
          </div>

          {!isMixedReligion ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                control={control}
                name="husband_id"
                render={({ field }) => (
                  <ParishionerSearchCombobox
                    label="Chú rể (Tân lang)"
                    value={field.value}
                    onChange={(id) => field.onChange(id || '')}
                    error={errors.husband_id?.message}
                    disabled={readOnly}
                    initialSelected={initialHusband}
                  />
                )}
              />
              <Controller
                control={control}
                name="wife_id"
                render={({ field }) => (
                  <ParishionerSearchCombobox
                    label="Cô dâu (Tân nương)"
                    value={field.value}
                    onChange={(id) => field.onChange(id || '')}
                    error={errors.wife_id?.message}
                    disabled={readOnly}
                    initialSelected={initialWife}
                  />
                )}
              />
            </div>
          ) : (
            <div className="p-5 border border-amber-200 bg-amber-50 rounded-sm space-y-4">
              <p className="text-sm text-amber-800 font-medium mb-2">
                Hôn phối Khác Đạo: Chọn một người công giáo và nhập tên người ngoại đạo (sẽ được tạo tự động với tư cách "Ngoại Giáo").
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                  control={control}
                  name="husband_id" // Maybe wife_id is selected, but user can choose which one. To simplify, we keep both inputs
                  render={({ field }) => (
                    <ParishionerSearchCombobox
                      label="Người Công giáo"
                      value={field.value}
                      onChange={(id) => {
                        field.onChange(id || '');
                        // If they select husband, we should clear wife_id and vice versa, but we keep it simple for now
                      }}
                    />
                  )}
                />
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                      Họ tên người Ngoại giáo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={readOnly}
                      {...register('non_catholic_name')}
                      placeholder="Nhập họ và tên..."
                      className={`w-full bg-surface border border-outline rounded-sm px-3 py-3 text-sm font-body text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${readOnly ? 'opacity-70 cursor-not-allowed bg-surface-container' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                      Vai trò (Chú rể / Cô dâu)
                    </label>
                    <select
                      disabled={readOnly}
                      {...register('non_catholic_gender')}
                      className={`w-full bg-surface border border-outline rounded-sm px-3 py-3 text-sm font-body text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${readOnly ? 'opacity-70 cursor-not-allowed bg-surface-container' : ''}`}
                    >
                      <option value="" disabled hidden>Chọn vai trò...</option>
                      <option value="MALE">Chú rể</option>
                      <option value="FEMALE">Cô dâu</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Thông tin Cử hành */}
        <div>
          <h3 className="font-display font-bold text-sm text-on-surface mb-4 pb-2 border-b border-outline uppercase">
            Thông tin Cử hành
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                Ngày Cử hành <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                disabled={readOnly}
                {...register('marriage_date')}
                className={`w-full bg-surface border rounded-sm px-3 py-3 text-sm font-body focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${
                  errors.marriage_date ? 'border-red-500 text-on-surface' : 'border-outline text-on-surface'
                } ${readOnly ? 'opacity-70 cursor-not-allowed bg-surface-container' : ''}`}
              />
              {errors.marriage_date && <p className="mt-1 text-[10px] text-red-500">{errors.marriage_date.message}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                Nơi Cử hành
              </label>
              <input
                type="text"
                disabled={readOnly}
                {...register('place')}
                placeholder="Ví dụ: Giáo xứ Kẻ Sặt..."
                className={`w-full bg-surface border border-outline rounded-sm px-3 py-3 text-sm font-body text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${readOnly ? 'opacity-70 cursor-not-allowed bg-surface-container' : ''}`}
              />
            </div>

            <Controller
              control={control}
              name="minister_id"
              render={({ field }) => (
                <PriestDropdown
                  label="Linh mục Chứng hôn"
                  value={field.value || null}
                  onChange={(id) => field.onChange(id || '')}
                  error={errors.minister_id?.message}
                  disabled={readOnly}
                />
              )}
            />

            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                Trạng thái Hôn phối
              </label>
              <select
                disabled={readOnly}
                {...register('status')}
                className={`w-full bg-surface border border-outline rounded-sm px-3 py-3 text-sm font-body text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${readOnly ? 'opacity-70 cursor-not-allowed bg-surface-container' : ''}`}
              >
                <option value="VALID">Thành sự (VALID)</option>
                <option value="ANNULLED">Tiêu hôn (ANNULLED)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Người làm chứng */}
        <div>
          <h3 className="font-display font-bold text-sm text-on-surface mb-4 pb-2 border-b border-outline uppercase">
            Người làm chứng
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                Người làm chứng 1
              </label>
              <input
                type="text"
                disabled={readOnly}
                {...register('witness_1_name')}
                placeholder="Họ và tên..."
                className={`w-full bg-surface border border-outline rounded-sm px-3 py-3 text-sm font-body text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${readOnly ? 'opacity-70 cursor-not-allowed bg-surface-container' : ''}`}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                Người làm chứng 2
              </label>
              <input
                type="text"
                disabled={readOnly}
                {...register('witness_2_name')}
                placeholder="Họ và tên..."
                className={`w-full bg-surface border border-outline rounded-sm px-3 py-3 text-sm font-body text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${readOnly ? 'opacity-70 cursor-not-allowed bg-surface-container' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* Sổ lưu trữ */}
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

        {/* Ghi chú */}
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

      {/* Household Creation Card */}
      <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div>
            <h4 className="font-display font-bold text-primary text-base mb-1">
              Tạo Sổ Gia đình mới
            </h4>
            <p className="text-sm font-body text-primary/80">
              Tự động khởi tạo sổ gia đình cho đôi tân hôn trong cơ sở dữ liệu giáo xứ.
            </p>
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer shrink-0 mt-2 sm:mt-0 font-bold text-primary">
          <input
            type="checkbox"
            disabled={readOnly}
            {...register('create_household')}
            className="w-6 h-6 rounded border-primary text-primary focus:ring-primary disabled:opacity-50"
          />
        </label>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
        {!readOnly && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-sm font-bold text-sm hover:bg-primary/90 transition-colors shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'CẬP NHẬT HÔN PHỐI' : 'Lưu Hôn Phối'}
          </button>
        )}
        <button
          type="button"
          onClick={() => router.push('/dashboard/sacraments?type=MARRIAGE')}
          className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-primary hover:bg-surface-hover rounded-sm transition-colors border border-primary sm:border-transparent focus-visible:border-outline order-2 sm:order-1"
        >
          Hủy bỏ
        </button>
      </div>
    </form>
  );
}
