'use client';

import { useTransition, useCallback, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';
import { CertificateTypeTabs } from './CertificateTypeTabs';
import { CertificateFilterBar } from './CertificateFilterBar';
import { CertificateTable } from './CertificateTable';
import { CertificateType } from '@/types/catechism';
import { useCatechismQuery } from '../queries/useCatechismQuery';

export function CertificateListClient() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const isAdmin = user?.role === 'ADMIN';
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);

  const activeTab: CertificateType = (searchParams.get('type') as CertificateType) || 'MARRIAGE_PREP';
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

  const queryParams: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
    ...(searchParams.get('search') ? { search: searchParams.get('search') as string } : {}),
    ...(searchParams.get('date_from') ? { date_from: searchParams.get('date_from') as string } : {}),
    ...(searchParams.get('date_to') ? { date_to: searchParams.get('date_to') as string } : {}),
    type: activeTab,
  };

  const { data: response, isLoading } = useCatechismQuery(queryParams);

  const handleTabChange = useCallback((type: CertificateType) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('type', type);
      params.delete('page');
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
      currentParams.set('type', activeTab);
      
      const response = await fetch(`/api/v1/catechism-certificates/export?${currentParams.toString()}`);
      
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
      a.download = `chungchi_${activeTab.toLowerCase()}_${new Date().getTime()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Đã xuất dữ liệu ${activeTab} thành công.`);
    } catch (_error) {
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
          <CertificateTypeTabs activeTab={activeTab} onTabChange={handleTabChange} />
          
          {(isPending || isLoading) && (
            <div className="flex items-center gap-2 text-primary/60 transition-opacity whitespace-nowrap">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span className="text-[11px] font-medium font-display">Cập nhật...</span>
            </div>
          )}
        </div>

        {canEdit && (
          <Link
            href="/dashboard/catechism/new"
            className="flex items-center justify-center gap-2 bg-primary text-white px-6 h-12 rounded-sm font-bold text-sm hover:bg-primary/90 transition-all shadow-sm shrink-0"
          >
            <Plus className="h-5 w-5" />
            Ghi nhận Chứng chỉ
          </Link>
        )}
      </div>

      <CertificateFilterBar
        search={searchParams.get('search') || ''}
        onSearchChange={handleSearch}
        onExport={handleExport}
        isExporting={isExporting}
        total={total}
      />

      <CertificateTable
        items={items}
        activeTab={activeTab}
        total={total}
        page={page}
        limit={limit}
        canEdit={canEdit}
        isAdmin={isAdmin}
      />
    </div>
  );
}
