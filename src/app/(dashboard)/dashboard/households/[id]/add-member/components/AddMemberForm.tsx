'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Household } from '@/types/household';

// Status enum from backend
const MemberStatus = z.enum(['RESIDING', 'ABSENT', 'DECEASED', 'MOVED']);
const Gender = z.enum(['MALE', 'FEMALE']);
const Relationship = z.enum(['SPOUSE', 'CHILD', 'GRANDCHILD', 'PARENT']);

const newbornSchema = z.object({
  christian_name: z.string().optional(),
  full_name: z.string().min(1, 'Họ và tên là bắt buộc'),
  nick_name: z.string().optional(),
  gender: Gender,
  birth_date: z.string().min(1, 'Ngày sinh là bắt buộc'),
  status: MemberStatus,
  relationship_to_head: Relationship,
  condition_detail: z.string().optional(),
});

type NewbornFormValues = z.infer<typeof newbornSchema>;

import { useAddMemberToHousehold } from '../../../queries/useHouseholdMutations';

// ... (in the component)
export function AddMemberForm({ household }: { household: Household }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addMemberMutation = useAddMemberToHousehold(household.id);

  // Lấy các giá trị từ URL nếu có
  const paramRel = searchParams.get('relationship');
  const paramGender = searchParams.get('gender');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<NewbornFormValues>({
    resolver: zodResolver(newbornSchema),
    defaultValues: {
      status: 'RESIDING',
      gender: (paramGender as z.infer<typeof Gender>) || 'MALE',
      relationship_to_head: (paramRel as z.infer<typeof Relationship>) || 'CHILD'
    }
  });

  // Hỗ trợ cập nhật khi params thay đổi
  useEffect(() => {
    if (paramRel) setValue('relationship_to_head', paramRel as z.infer<typeof Relationship>);
    if (paramGender) setValue('gender', paramGender as z.infer<typeof Gender>);
  }, [paramRel, paramGender, setValue]);

  const onSubmit = async (data: NewbornFormValues) => {
    try {
      await addMemberMutation.mutateAsync(data);

      toast.success('Thêm thành viên mới thành công!');
      router.push(`/dashboard/households/${household.id}`);
      
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Đã có lỗi xảy ra');
    }
  };

  const isSubmitting = addMemberMutation.isPending;

  return (
    <>
      <div className="bg-surface border border-border-color p-10 rounded-sm corner-accent-lg shadow-sm relative overflow-hidden">
        <div className="mb-8 md:mb-10 text-center">
          <h2 className="text-xl md:text-3xl font-display font-bold text-text-main mb-3">Thêm thành viên (Giáo dân mới)</h2>
          <div className="inline-flex items-center justify-center gap-2 text-muted bg-surface-container px-4 py-2 rounded-full border border-border-color/50">
            <span className="material-symbols-outlined text-lg text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>family_history</span>
            <span className="text-sm font-medium">Hộ giáo: Gia đình Ông {household.head?.christian_name} {household.head?.full_name}</span>
          </div>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          {/* Identity Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted">Tên Thánh</label>
              <select 
                {...register('christian_name')}
                className="w-full bg-background-light border border-border-color p-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all rounded-sm"
              >
                <option value="">Chọn tên Thánh</option>
                <option value="Maria">Maria</option>
                <option value="Giuse">Giuse</option>
                <option value="Phêrô">Phêrô</option>
                <option value="Phaolô">Phaolô</option>
                <option value="Anna">Anna</option>
                <option value="Têrêsa">Têrêsa</option>
                <option value="Gioan Baotixita">Gioan Baotixita</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted">Họ và Tên</label>
              <input 
                {...register('full_name')}
                className="w-full bg-background-light border border-border-color p-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all rounded-sm" 
                placeholder="Nhập đầy đủ họ tên" 
                type="text"
              />
              {errors.full_name && <p className="text-red-500 text-xs">{errors.full_name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted">Bí danh (Alias)</label>
              <input 
                {...register('nick_name')}
                className="w-full bg-background-light border border-border-color p-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all rounded-sm" 
                placeholder="Tên thường gọi" 
                type="text"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted">Giới tính</label>
              <div className="flex gap-8 pt-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    {...register('gender')}
                    className="text-primary focus:ring-primary border-border-color w-4 h-4" 
                    value="MALE"
                    type="radio"
                  />
                  <span className="text-sm text-text-main group-hover:text-primary transition-colors font-medium">Nam</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    {...register('gender')}
                    className="text-primary focus:ring-primary border-border-color w-4 h-4" 
                    value="FEMALE"
                    type="radio"
                  />
                  <span className="text-sm text-text-main group-hover:text-primary transition-colors font-medium">Nữ</span>
                </label>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted">Ngày sinh</label>
              <input 
                {...register('birth_date')}
                className="w-full bg-background-light border border-border-color p-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all rounded-sm" 
                type="date"
              />
              {errors.birth_date && <p className="text-red-500 text-xs">{errors.birth_date.message}</p>}
            </div>
          </div>

          {/* Relationship & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted">Quan hệ với Chủ hộ</label>
              <select 
                {...register('relationship_to_head')}
                className="w-full bg-background-light border border-border-color p-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all rounded-sm"
              >
                <option value="CHILD">Con cái</option>
                <option value="SPOUSE">Vợ/Chồng</option>
                <option value="PARENT">Cha mẹ</option>
                <option value="GRANDCHILD">Cháu</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted">Trạng thái cư trú</label>
              <select 
                {...register('status')}
                className="w-full bg-background-light border border-border-color p-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all rounded-sm"
              >
                <option value="RESIDING">Đang cư trú</option>
                <option value="ABSENT">Vắng mặt</option>
                <option value="MOVED">Chuyển xứ</option>
                <option value="DECEASED">Đã qua đời</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted">Ghi chú (Tình trạng chi tiết)</label>
            <input 
              {...register('condition_detail')}
              className="w-full bg-background-light border border-border-color p-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all rounded-sm" 
              placeholder="Ghi chú về tình trạng hiện tại" 
              type="text"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-6 md:pt-8 border-t border-border-color">
            <button 
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center min-h-[48px] px-6 py-2.5 border border-primary text-primary text-sm font-bold hover:bg-primary/5 transition-all rounded-sm disabled:opacity-50"
            >
              Hủy
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 min-h-[48px] px-8 py-2.5 bg-primary text-white text-sm font-bold hover:bg-primary/90 shadow-sm transition-all transform active:scale-95 rounded-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu hồ sơ'}
            </button>
          </div>
        </form>

        {/* Decorative Footnote */}
        <div className="mt-8 md:mt-12 pt-4 md:pt-6 border-t border-border-color/40 flex flex-col md:flex-row justify-between items-start md:items-center text-[11px] text-muted font-body gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xs text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
            Dữ liệu được lưu trữ bảo mật tại văn phòng Giáo xứ.
          </div>
          <div className="italic">Mã hồ sơ sẽ được cấp tự động sau khi lưu.</div>
        </div>
      </div>

      {/* Guidance Message */}
      <div className="mt-8 p-6 bg-tertiary-container border border-tertiary/20 rounded-sm flex gap-4 items-start shadow-sm">
        <span className="material-symbols-outlined text-tertiary shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
        <div>
          <h4 className="text-sm font-bold text-tertiary font-display">Lưu ý khi thêm thành viên</h4>
          <p className="text-xs text-tertiary/80 mt-1 leading-relaxed max-w-3xl">
            Thông tin địa chỉ sẽ được kế thừa trực tiếp từ Sổ Hộ giáo hiện tại để đảm bảo tính nhất quán của dữ liệu địa bàn.
          </p>
        </div>
      </div>
    </>
  );
}
