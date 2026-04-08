'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { SacramentTabs } from './SacramentTabs';
import { SacramentFilterBar } from './SacramentFilterBar';
import { SacramentTable } from './SacramentTable';
import { MarriageTable } from './MarriageTable';
import { SacramentInfoCards } from './SacramentInfoCards';
import { SacramentListItem, MarriageListItem, SacramentType } from '@/types/sacrament';

interface SacramentListClientProps {
  items: (SacramentListItem | MarriageListItem)[];
  total: number;
  page: number;
  limit: number;
  activeTab: SacramentType;
}

export function SacramentListClient({
  items,
  total,
  page,
  limit,
  activeTab: serverActiveTab
}: SacramentListClientProps) {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [localActiveTab, setLocalActiveTab] = useState<SacramentType>(serverActiveTab);

  // Sync back if server state changes (e.g. from popstate or parent update)
  useEffect(() => {
    setLocalActiveTab(serverActiveTab);
  }, [serverActiveTab]);

  const isMarriage = localActiveTab === 'MARRIAGE';

  const handleTabChange = useCallback((type: SacramentType) => {
    // 0ms feedback: Update the UI tab instantly
    setLocalActiveTab(type);
    
    // Background fetch the data
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

  const handleExport = () => {
    const currentParams = new URLSearchParams(searchParams.toString());
    const type = currentParams.get('type') || 'BAPTISM';
    
    // Using explicit file download
    const isMarriage = type === 'MARRIAGE';
    const baseUrl = isMarriage ? '/api/v1/sacraments/marriages/export' : '/api/v1/sacraments/export';
    const exportUrl = `${baseUrl}?${currentParams.toString()}`;
    
    window.open(exportUrl, '_blank');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <SacramentTabs activeTab={localActiveTab} onTabChange={handleTabChange} />
          
          {isPending && (
            <div className="flex items-center gap-2 text-primary/60 transition-opacity whitespace-nowrap">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span className="text-[11px] font-medium font-display">Cập nhật...</span>
            </div>
          )}
        </div>

        {canEdit && (
          <Link
            href="/dashboard/sacraments/new"
            className="flex items-center justify-center gap-2 bg-primary text-white px-6 h-12 rounded-sm font-bold text-sm hover:bg-primary/90 transition-all shadow-sm shrink-0"
          >
            <Plus className="h-5 w-5" />
            Ghi nhận Bí tích
          </Link>
        )}
      </div>

      <SacramentFilterBar
        search={searchParams.get('search') || ''}
        onSearchChange={handleSearch}
        onExport={handleExport}
      />

      {isMarriage ? (
        <MarriageTable
          items={items as MarriageListItem[]}
          total={total}
          page={page}
          limit={limit}
        />
      ) : (
        <SacramentTable
          items={items as SacramentListItem[]}
          type={localActiveTab}
          total={total}
          page={page}
          limit={limit}
        />
      )}

      <SacramentInfoCards />
    </div>
  );
}
