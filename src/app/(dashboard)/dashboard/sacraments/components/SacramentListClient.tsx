'use client';

import { useTransition, useCallback, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Plus, X, ChevronRight } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';
import { SacramentTabs } from './SacramentTabs';
import { SacramentFilterBar } from './SacramentFilterBar';
import { SacramentTable } from './SacramentTable';
import { MarriageTable } from './MarriageTable';
import { SacramentInfoCards } from './SacramentInfoCards';
import { SacramentListItem, MarriageListItem, SacramentType } from '@/types/sacrament';
import { useSacramentsQuery } from '../queries/useSacramentQuery';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function SacramentListClient() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);

  const activeTab: SacramentType = (searchParams.get('type') as SacramentType) || 'BAPTISM';
  const isMarriage = activeTab === 'MARRIAGE';
  
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  
  // Construct params object for query key and fetch
  const queryParams: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
    ...(searchParams.get('search') ? { search: searchParams.get('search') as string } : {}),
    ...(searchParams.get('date_from') ? { date_from: searchParams.get('date_from') as string } : {}),
    ...(searchParams.get('date_to') ? { date_to: searchParams.get('date_to') as string } : {}),
    type: activeTab,
  };

  const { data: response, isLoading } = useSacramentsQuery(queryParams);

  const handleTabChange = useCallback((type: SacramentType) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('type', type);
      params.delete('page'); // reset page on tab switch
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [pathname, router, searchParams]);

  const handleSearch = useCallback((search: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) {
        params.set('search', search);
      } else {
        params.delete('search');
      }
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [pathname, router, searchParams]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const currentParams = new URLSearchParams(searchParams.toString());
      const type = currentParams.get('type') || activeTab || 'BAPTISM';
      
      // Ensure type is explicitly set in parameters
      if (!currentParams.has('type')) {
        currentParams.set('type', type);
      }

      const isMarriageExport = type === 'MARRIAGE';
      const baseUrl = isMarriageExport ? '/api/v1/sacraments/marriages/export' : '/api/v1/sacraments/export';
      const exportUrl = `${baseUrl}?${currentParams.toString()}`;
      
      const response = await fetch(exportUrl);
      
      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Gửi yêu cầu quá nhanh. Vui lòng thử lại sau 1 phút.');
        } else {
          toast.error('Xuất dữ liệu thất bại. Vui lòng thử lại.');
        }
        return;
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bitich_${type.toLowerCase()}_${new Date().getTime()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Đã xuất dữ liệu ${type} thành công.`);
    } catch {
      toast.error('Lỗi hệ thống khi xuất dữ liệu.');
    } finally {
      setIsExporting(false);
    }
  };

  const items = response?.items || [];
  const total = response?.pagination?.total || 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <SacramentTabs activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        {canEdit && (
          <button
            onClick={() => setIsSelectModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-primary text-white px-6 h-12 rounded-sm font-bold text-sm hover:bg-primary/90 transition-all shadow-sm shrink-0"
          >
            <Plus className="h-5 w-5" />
            Ghi nhận Bí tích
          </button>
        )}
      </div>

      <SacramentFilterBar
        search={searchParams.get('search') || ''}
        onSearchChange={handleSearch}
        onExport={handleExport}
        isExporting={isExporting}
        total={total}
      />

      {isLoading || isPending ? (
        <div className="bg-surface border border-outline rounded p-12 flex flex-col items-center justify-center gap-3 mt-4 min-h-[300px]">
          <LoadingSpinner className="h-10 w-10 text-primary" />
          <p className="text-sm font-body text-muted">Đang tải danh sách hồ sơ bí tích...</p>
        </div>
      ) : isMarriage ? (
        <MarriageTable
          items={items as MarriageListItem[]}
          total={total}
          page={page}
          limit={limit}
        />
      ) : (
        <SacramentTable
          items={items as SacramentListItem[]}
          type={activeTab}
          total={total}
          page={page}
          limit={limit}
        />
      )}

      <SacramentInfoCards />

      {/* Sacrament type selection Modal */}
      {isSelectModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-foreground/50 transition-opacity"
            onClick={() => setIsSelectModalOpen(false)}
          />

          {/* Dialog container */}
          <div className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 z-50 md:w-full md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2">
            <div className="bg-background rounded-xl shadow-xl overflow-hidden flex flex-col border border-outline animate-in fade-in-50 zoom-in-95 duration-150">
              {/* Header */}
              <div className="px-6 py-5 border-b border-outline flex items-center justify-between bg-surface shrink-0">
                <h2 className="font-serif text-xl font-bold text-foreground">
                  Chọn loại Bí tích ghi nhận
                </h2>
                <button
                  type="button"
                  onClick={() => setIsSelectModalOpen(false)}
                  aria-label="Đóng"
                  className="p-2 rounded-full hover:bg-hover-bg text-muted min-h-[48px] min-w-[48px] flex items-center justify-center -mr-2 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Options list */}
              <div className="p-6 space-y-3">
                <button
                  onClick={() => {
                    setIsSelectModalOpen(false);
                    router.push('/dashboard/sacraments/new?type=BAPTISM');
                  }}
                  className="w-full flex items-center justify-between p-4 border border-outline rounded-sm hover:border-primary hover:bg-primary/5 transition-all text-left font-body text-foreground"
                >
                  <div>
                    <div className="font-bold text-sm">Bí tích Rửa tội</div>
                    <div className="text-xs text-muted">Ghi nhận hồ sơ Rửa tội cho giáo dân</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted" />
                </button>

                <button
                  onClick={() => {
                    setIsSelectModalOpen(false);
                    router.push('/dashboard/sacraments/new?type=EUCHARIST');
                  }}
                  className="w-full flex items-center justify-between p-4 border border-outline rounded-sm hover:border-primary hover:bg-primary/5 transition-all text-left font-body text-foreground"
                >
                  <div>
                    <div className="font-bold text-sm">Bí tích Rước lễ</div>
                    <div className="text-xs text-muted">Ghi nhận hồ sơ Rước lễ lần đầu</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted" />
                </button>

                <button
                  onClick={() => {
                    setIsSelectModalOpen(false);
                    router.push('/dashboard/sacraments/new?type=CONFIRMATION');
                  }}
                  className="w-full flex items-center justify-between p-4 border border-outline rounded-sm hover:border-primary hover:bg-primary/5 transition-all text-left font-body text-foreground"
                >
                  <div>
                    <div className="font-bold text-sm">Bí tích Thêm sức</div>
                    <div className="text-xs text-muted">Ghi nhận hồ sơ lãnh nhận Bí tích Thêm sức</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted" />
                </button>

                <button
                  onClick={() => {
                    setIsSelectModalOpen(false);
                    router.push('/dashboard/sacraments/new?type=MARRIAGE');
                  }}
                  className="w-full flex items-center justify-between p-4 border border-outline rounded-sm hover:border-primary hover:bg-primary/5 transition-all text-left font-body text-foreground"
                >
                  <div>
                    <div className="font-bold text-sm">Bí tích Hôn phối</div>
                    <div className="text-xs text-muted">Ghi nhận kết hôn (Hôn phối trong đạo)</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted" />
                </button>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-surface border-t border-outline flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsSelectModalOpen(false)}
                  className="px-5 py-2 text-sm font-medium text-foreground hover:bg-hover-bg border border-outline rounded min-h-[48px] transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
