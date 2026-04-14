'use client';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronRight, Upload, Church } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/components/providers/auth-provider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ParishInfo } from '@/lib/api/settings';
import { 
  useParishQuery, 
  useUpdateParishMutation, 
  useLogoUploadMutation 
} from '@/lib/queries/useSettingsQueries';

const parishFormSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên giáo xứ'),
  diocese: z.string().max(255).optional().nullable(),
  deanery: z.string().max(255).optional().nullable(),
  patron_saint: z.string().max(255).optional().nullable(),
  established_year: z.number().min(1500, 'Năm thành lập phải lớn hơn hoặc bằng 1500').max(2100, 'Năm thành lập không hợp lệ').nullable().optional(),
  address: z.string().max(500).optional().nullable(),
  phone_number: z.string().max(20).optional().nullable(),
  pastor_name: z.string().max(255).optional().nullable(),
});

type ParishFormData = z.infer<typeof parishFormSchema>;

export default function ParishInformationPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  
  const { data: parishData, isLoading: isParishLoading } = useParishQuery(user?.role === 'ADMIN');
  const updateParish = useUpdateParishMutation();
  const uploadLogo = useLogoUploadMutation();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ParishFormData>({
    resolver: zodResolver(parishFormSchema),
  });

  useEffect(() => {
    // Only ADMIN can access
    if (!isAuthLoading && user && user.role !== 'ADMIN') {
      router.replace('/settings');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    if (parishData?.data) {
      const info = parishData.data;
      reset({
        name: info.name || '',
        diocese: info.diocese || '',
        deanery: info.deanery || '',
        patron_saint: info.patron_saint || '',
        established_year: info.established_year || null,
        address: info.address || '',
        phone_number: info.phone_number || '',
        pastor_name: info.pastor_name || '',
      });
    }
  }, [parishData, reset]);

  const onSubmit = async (data: ParishFormData) => {
    // Transform NaN to null in case valueAsNumber parses empty input as NaN
    const payload = {
      ...data,
      established_year: Number.isNaN(data.established_year) ? null : data.established_year,
    };

    updateParish.mutate(payload as Partial<ParishInfo>, {
      onSuccess: () => {
        reset(data); // Reset isDirty
      }
    });
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      toast.error('File size cannot exceed 1MB');
      return;
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Only PNG or JPG images are allowed');
      return;
    }

    uploadLogo.mutate(file, {
      onSettled: () => {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    });
  };

  const parishInfo = parishData?.data;

  if (isAuthLoading || (user?.role === 'ADMIN' && isParishLoading)) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  // Double check so no flash occurs before redirect
  if (user?.role !== 'ADMIN') return null;

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Scrollable container */}
      <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
        <div className="mx-auto max-w-3xl pb-24">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-1 text-sm font-medium text-muted mb-6">
            <Link href="/settings" className="hover:text-foreground transition-colors">
              Cài đặt
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Thông tin Giáo xứ</span>
          </nav>

          <div className="mb-8">
            <h1 className="font-serif text-2xl font-bold text-foreground">Thông tin Giáo xứ</h1>
            <p className="mt-1 text-sm text-muted">Quản lý thông tin chi tiết, logo và thông tin liên hệ của giáo xứ.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Column - Logo Upload */}
            <div className="col-span-1 flex flex-col items-center">
              <div className="relative group rounded-xl overflow-hidden mb-3 border-2 border-dashed border-outline hover:border-primary/50 transition-colors w-40 h-40 flex items-center justify-center bg-surface-container">
                {parishInfo?.logo_url ? (
                  <Image 
                    src={parishInfo.logo_url.startsWith('http') ? parishInfo.logo_url : (parishInfo.logo_url.startsWith('/') ? parishInfo.logo_url : `/storage/${parishInfo.logo_url}`)} 
                    alt="Parish Logo" 
                    width={160}
                    height={160}
                    className="w-full h-full object-contain p-2"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <Church className="w-16 h-16 text-muted/30" />
                )}
                
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="h-6 w-6 text-white mb-2" />
                  <span className="text-xs font-semibold text-white">Tải ảnh mới</span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/png, image/jpeg"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  disabled={uploadLogo.isPending}
                />
              </div>

              {uploadLogo.isPending ? (
                <div className="flex items-center text-xs text-primary font-medium">
                  <LoadingSpinner className="h-3 w-3 mr-2" /> Uploading...
                </div>
              ) : (
                <p className="text-[11px] text-muted text-center leading-tight px-2">
                  Khuyên dùng: Ảnh vuông PNG/JPG<br/>Kích thước tối đa: 1MB
                </p>
              )}
            </div>

            {/* Right Column - Form */}
            <div className="col-span-1 md:col-span-2">
              <form id="parish-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* General Information Section */}
                <div className="bg-surface border border-outline rounded-xl p-5 md:p-6 shadow-sm">
                  <h3 className="font-serif text-lg font-bold text-foreground border-b border-outline/50 pb-3 mb-5">Thông tin Chung</h3>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    
                    <div className="sm:col-span-2">
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                        Tên Giáo xứ <span className="text-primary">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        {...register('name')}
                        className={`block w-full rounded border px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[48px] transition-all ${errors.name ? 'border-primary' : 'border-outline'}`}
                        placeholder="VD: Giáo xứ Tân Định"
                      />
                      {errors.name && <p className="mt-1 text-xs text-primary">{errors.name.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="diocese" className="block text-sm font-medium text-foreground mb-1.5">
                        Giáo phận
                      </label>
                      <input
                        type="text"
                        id="diocese"
                        {...register('diocese')}
                        className={`block w-full rounded border px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[48px] transition-all border-outline`}
                        placeholder="VD: TGP Sài Gòn"
                      />
                    </div>

                    <div>
                      <label htmlFor="deanery" className="block text-sm font-medium text-foreground mb-1.5">
                        Giáo hạt
                      </label>
                      <input
                        type="text"
                        id="deanery"
                        {...register('deanery')}
                        className={`block w-full rounded border px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[48px] transition-all border-outline`}
                        placeholder="VD: Hạt Tân Định"
                      />
                    </div>

                    <div>
                      <label htmlFor="patron_saint" className="block text-sm font-medium text-foreground mb-1.5">
                        Thánh Bổn mạng
                      </label>
                      <input
                        type="text"
                        id="patron_saint"
                        {...register('patron_saint')}
                        className={`block w-full rounded border px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[48px] transition-all border-outline`}
                        placeholder="VD: Thánh Tâm Chúa"
                      />
                    </div>

                    <div>
                      <label htmlFor="established_year" className="block text-sm font-medium text-foreground mb-1.5">
                        Năm Thành lập
                      </label>
                      <input
                        type="number"
                        id="established_year"
                        {...register('established_year', { valueAsNumber: true })}
                        className={`block w-full rounded border px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[48px] transition-all ${errors.established_year ? 'border-primary' : 'border-outline'}`}
                        placeholder="VD: 1870"
                      />
                      {errors.established_year && <p className="mt-1 text-xs text-primary">{errors.established_year.message}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="pastor_name" className="block text-sm font-medium text-foreground mb-1.5">
                        Tên Linh mục Chánh xứ
                      </label>
                      <input
                        type="text"
                        id="pastor_name"
                        {...register('pastor_name')}
                        className={`block w-full rounded border px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[48px] transition-all border-outline`}
                        placeholder="Tên Linh mục Chánh xứ"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="bg-surface border border-outline rounded-xl p-5 md:p-6 shadow-sm">
                  <h3 className="font-serif text-lg font-bold text-foreground border-b border-outline/50 pb-3 mb-5">Thông tin Liên hệ</h3>
                  <div className="grid grid-cols-1 gap-5">
                    
                    <div>
                      <label htmlFor="phone_number" className="block text-sm font-medium text-foreground mb-1.5">
                        Số điện thoại
                      </label>
                      <input
                        type="text"
                        id="phone_number"
                        {...register('phone_number')}
                        className={`block w-full rounded border px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[48px] transition-all border-outline`}
                        placeholder="Số điện thoại văn phòng"
                      />
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-foreground mb-1.5">
                        Địa chỉ
                      </label>
                      <textarea
                        id="address"
                        {...register('address')}
                        rows={3}
                        className={`block w-full rounded border px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px] transition-all border-outline resize-vertical`}
                        placeholder="Địa chỉ giáo xứ..."
                      />
                    </div>

                  </div>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Footer */}
      <div className="border-t border-outline bg-surface p-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] relative z-10 flex items-center justify-end">
        <div className="flex gap-3 w-full md:w-auto">
          <Link
            href="/settings"
            className="flex-1 md:flex-none inline-flex justify-center items-center rounded border border-outline bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-hover-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[48px] transition-colors"
          >
            Hủy
          </Link>
          <button
            type="submit"
            form="parish-form"
            disabled={!isDirty || updateParish.isPending}
            className="flex-1 md:flex-none inline-flex justify-center items-center rounded bg-primary px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[48px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
          >
            {updateParish.isPending ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner className="h-4 w-4" />
                Lưu lại
              </span>
            ) : (
              'Lưu thay đổi'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
