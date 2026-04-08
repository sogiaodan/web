'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { CertificateTypeTabs } from './CertificateTypeTabs';
import { CertificateFilterBar } from './CertificateFilterBar';
import { CertificateTable } from './CertificateTable';
import { CertificateListItem, CertificateType } from '@/types/catechism';

interface CertificateListClientProps {
  items: CertificateListItem[];
  total: number;
  page: number;
  limit: number;
  activeTab: CertificateType;
}

export function CertificateListClient({
  items,
  total,
  page,
  limit,
  activeTab: serverActiveTab,
}: CertificateListClientProps) {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const isAdmin = user?.role === 'ADMIN';
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [localActiveTab, setLocalActiveTab] = useState<CertificateType>(serverActiveTab);

  // Sync back if server state changes (e.g. from popstate or parent update)
  useEffect(() => {
    setLocalActiveTab(serverActiveTab);
  }, [serverActiveTab]);

  const handleTabChange = useCallback((type: CertificateType) => {
    // 0ms feedback: Chuyển tab trên UI ngay lập tức
    setLocalActiveTab(type);
    
    // Thực hiện fetch dữ liệu mới trong background transition
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('type', type);
      params.delete('page');
      router.replace(`${pathname}?${params.toString()}`);
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
      router.replace(`${pathname}?${params.toString()}`);
    });
  }, [pathname, router, searchParams]);

  const handleExport = () => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set('type', localActiveTab);
    window.open(`/api/v1/catechism-certificates/export?${currentParams.toString()}`, '_blank');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <CertificateTypeTabs activeTab={localActiveTab} onTabChange={handleTabChange} />
          
          {isPending && (
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
      />

      <CertificateTable
        items={items}
        activeTab={localActiveTab}
        total={total}
        page={page}
        limit={limit}
        canEdit={canEdit}
        isAdmin={isAdmin}
      />
    </div>
  );
}
