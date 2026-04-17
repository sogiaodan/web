'use client';

import { useHouseholdDetailQuery } from "../../queries/useHouseholdDetailQuery";
import { useZonesQuery } from "@/lib/queries/useZonesQuery";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { ArrowLeft, Church } from "lucide-react";
import { useSplitHousehold } from "../../queries/useHouseholdMutations";
import { DatePicker } from "@/components/dashboard/shared/DatePicker";

const splitSchema = z.object({
  household_code: z.string().min(1, 'Mã hộ là bắt buộc'),
  zone_id: z.string().min(1, 'Giáo khu là bắt buộc'),
  address: z.string().optional(),
  pastoral_notes: z.string().optional(),
  physical_book_no: z.string().optional(),
  book_issue_date: z.string().optional(),
});

type SplitFormValues = z.infer<typeof splitSchema>;

export default function HouseholdSplitClient({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const childId = searchParams.get('child_id');
  
  const { data: householdData, isLoading: isHouseholdLoading } = useHouseholdDetailQuery(id);
  const { data: zonesData, isLoading: isZonesLoading } = useZonesQuery();
  const splitMutation = useSplitHousehold(id);

  const child = householdData?.current_members?.find(m => m.id === childId);

  const { register, handleSubmit, control, formState: { errors } } = useForm<SplitFormValues>({
    resolver: zodResolver(splitSchema),
    defaultValues: {
      zone_id: householdData?.zone_id || '',
      address: householdData?.address || '',
    }
  });

  const onSubmit = (data: SplitFormValues) => {
    if (!childId) return;
    
    splitMutation.mutate({
      new_household: {
        ...data,
      },
      head_id: childId,
      member_ids: [childId],
    }, {
      onSuccess: () => {
        router.push(`/dashboard/households/${id}`);
      }
    });
  };

  if (isHouseholdLoading || isZonesLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!householdData || !child) {
    return (
      <div className="flex-1 p-8 text-center text-muted">
        Không tìm thấy thông tin hoặc giáo dân không hợp lệ để tách hộ.
        <div className="mt-4">
          <Link href={`/dashboard/households/${id}`} className="text-primary hover:underline">
            Quay lại Chi tiết Hộ giáo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-light">
      <header className="h-16 flex items-center px-8 border-b border-border-color bg-surface shrink-0">
        <Link href={`/dashboard/households/${id}`} className="flex items-center gap-2 text-muted hover:text-foreground transition-colors mr-4">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display font-bold text-xl text-text-main flex items-center gap-2">
          <Church className="w-5 h-5 text-primary" />
          Thiết lập Hộ giáo mới (Tách hộ)
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto space-y-8 pb-32">
          
          <div className="bg-surface border border-outline rounded-md overflow-hidden">
            <div className="px-6 py-4 border-b border-outline bg-background/50">
              <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">person</span>
                Thông tin Chủ Hộ mới
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50">
              <div>
                <label className="block text-xs font-bold text-muted mb-1 uppercase tracking-wider">Họ và tên</label>
                <div className="text-foreground font-medium">{child.christian_name} {child.full_name}</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted mb-1 uppercase tracking-wider">Tình trạng hôn phối (sau khi tách)</label>
                <div className="text-emerald-700 font-medium font-semibold bg-emerald-100 inline-block px-2 py-0.5 rounded text-sm">Đã kết hôn</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted mb-1 uppercase tracking-wider">Vai trò trong Hộ mới</label>
                <div className="text-primary font-bold">Chủ hộ</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted mb-1 uppercase tracking-wider">Hộ gốc</label>
                <div className="text-muted text-sm">{householdData.household_code}</div>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-outline rounded-md overflow-hidden">
            <div className="px-6 py-4 border-b border-outline">
              <h3 className="font-semibold text-lg text-primary">Thông tin Hộ giáo</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">Mã hộ giáo mới <span className="text-primary">*</span></label>
                <input
                  type="text"
                  {...register('household_code')}
                  className={`w-full px-3 py-2 border rounded-sm outline-none transition-colors ${errors.household_code ? 'border-primary ring-1 ring-primary/20' : 'border-outline focus:border-primary/50'}`}
                  placeholder="VD: TT-26-102"
                />
                {errors.household_code && <p className="text-primary text-xs mt-1">{errors.household_code.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">Giáo khu <span className="text-primary">*</span></label>
                <select
                  {...register('zone_id')}
                  className={`w-full px-3 py-2 border rounded-sm outline-none transition-colors ${errors.zone_id ? 'border-primary ring-1 ring-primary/20' : 'border-outline focus:border-primary/50'} bg-white`}
                >
                  <option value="">Chọn giáo khu</option>
                  {(zonesData?.items || []).map(z => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
                {errors.zone_id && <p className="text-primary text-xs mt-1">{errors.zone_id.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">Địa chỉ thường trú</label>
                <input
                  type="text"
                  {...register('address')}
                  className="w-full px-3 py-2 border border-outline rounded-sm outline-none transition-colors focus:border-primary/50"
                  placeholder="Nhập địa chỉ đầy đủ..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">Số quyển / STT</label>
                <input
                  type="text"
                  {...register('physical_book_no')}
                  className="w-full px-3 py-2 border border-outline rounded-sm outline-none transition-colors focus:border-primary/50"
                  placeholder="Nhập số quyển sổ gốc (nếu có)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">Ngày cấp sổ</label>
                <Controller
                  control={control}
                  name="book_issue_date"
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">Ghi chú mục vụ</label>
                <textarea
                  {...register('pastoral_notes')}
                  className="w-full px-3 py-2 border border-outline rounded-sm outline-none transition-colors focus:border-primary/50 min-h-[80px] resize-y"
                  placeholder="Ghi chú thêm về hộ giáo..."
                />
              </div>

            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-outline">
            <Link 
              href={`/dashboard/households/${id}`}
              className="px-6 py-2.5 rounded-sm border border-outline font-semibold text-foreground hover:bg-hover-bg transition-colors"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={splitMutation.isPending}
              className="px-6 py-2.5 rounded-sm bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {splitMutation.isPending && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
              Tiến hành tách hộ
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
