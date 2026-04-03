'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Household } from '@/types/household';

// Status enum from backend
const MemberStatus = z.enum(['PRESENT', 'ABSENT', 'DECEASED', 'MOVED']);
const Gender = z.enum(['MALE', 'FEMALE']);

const newbornSchema = z.object({
  christian_name: z.string().optional(),
  full_name: z.string().min(1, 'Họ và tên là bắt buộc'),
  nick_name: z.string().optional(),
  gender: Gender,
  birth_date: z.string().min(1, 'Ngày sinh là bắt buộc'),
  status: MemberStatus,
  condition_detail: z.string().optional(),
});

type NewbornFormValues = z.infer<typeof newbornSchema>;

export function AddMemberForm({ household }: { household: Household }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewbornFormValues>({
    resolver: zodResolver(newbornSchema),
    defaultValues: {
      status: 'PRESENT',
      gender: 'MALE'
    }
  });

  const onSubmit = async (data: NewbornFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/households/${household.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.message || 'Lỗi server');
      }

      toast.success('Thêm giáo dân mới thành công!');
      router.push(`/dashboard/households/${household.id}`);
      router.refresh();
      
    } catch (err: any) {
      toast.error(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const headName = household.head?.full_name || 'Không xác định';

  return (
    <>
      <div className="bg-surface border border-border-color p-10 rounded-sm corner-accent-lg shadow-sm relative overflow-hidden">
        <div className="mb-8 md:mb-10 text-center">
          <h2 className="text-xl md:text-3xl font-display font-bold text-text-main mb-3">Thêm Giáo dân mới (Khai sinh)</h2>
          <div className="inline-flex items-center justify-center gap-2 text-muted bg-surface-container px-4 py-2 rounded-full border border-border-color/50">
            <span className="material-symbols-outlined text-lg text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>family_history</span>
            <span className="text-sm font-medium">Hộ giáo: Gia đình Ông {household.head?.christian_name} {household.head?.full_name}</span>
          </div>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          {/* Identity Section — 1 col on mobile, 3 col on desktop */}
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

          {/* Parent Info — 1 col on mobile, 2 col on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6 bg-surface-container rounded border border-border-color/60 border-dashed">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-muted">Thông tin Cha</label>
              <div className="flex items-center gap-3 text-text-main">
                <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                </div>
                <span className="font-display font-bold text-lg line-clamp-1">
                  {household.head ? `${household.head.christian_name || ''} ${household.head.full_name}` : 'Không có thông tin'}
                </span>
              </div>
              <p className="text-[10px] text-muted italic ml-11">Kế thừa từ Sổ Hộ giáo</p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-muted">Thông tin Mẹ</label>
              <div className="flex items-center gap-3 text-text-main">
                <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>person_2</span>
                </div>
                <span className="font-display font-bold text-lg line-clamp-1">
                  {household.spouse ? `${household.spouse.christian_name || ''} ${household.spouse.full_name}` : 'Không có thông tin'}
                </span>
              </div>
              <p className="text-[10px] text-muted italic ml-11">Kế thừa từ Sổ Hộ giáo</p>
            </div>
          </div>

          {/* Status & Condition — 1 col on mobile, 2 col on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted">Trạng thái</label>
              <select 
                {...register('status')}
                className="w-full bg-background-light border border-border-color p-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all rounded-sm"
              >
                <option value="PRESENT">Hiện diện (Present)</option>
                <option value="ABSENT">Vắng mặt (Absent)</option>
                <option value="MOVED">Chuyển xứ (Moved Parish)</option>
                <option value="DECEASED">Đã qua đời (Deceased)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted">Tình trạng (Condition Detail)</label>
              <input 
                {...register('condition_detail')}
                className="w-full bg-background-light border border-border-color p-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all rounded-sm" 
                placeholder="Ghi chú về tình trạng hiện tại" 
                type="text"
              />
            </div>
          </div>

          {/* Actions — stacked full-width on mobile, right-aligned inline on desktop */}
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
          <h4 className="text-sm font-bold text-tertiary font-display">Lưu ý khi thêm Khai sinh</h4>
          <p className="text-xs text-tertiary/80 mt-1 leading-relaxed max-w-3xl">
            Việc thêm giáo dân mới qua luồng Khai sinh sẽ tự động cập nhật số lượng thành viên trong Hộ giáo. Thông tin địa chỉ sẽ được kế thừa trực tiếp từ Sổ Hộ giáo hiện tại để đảm bảo tính nhất quán của dữ liệu địa bàn.
          </p>
        </div>
      </div>
    </>
  );
}
