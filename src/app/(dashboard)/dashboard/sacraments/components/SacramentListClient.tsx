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
import { useSacramentsQuery } from '../queries/useSacramentQuery';

export function SacramentListClient() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

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

  const handleExport = () => {
    const currentParams = new URLSearchParams(searchParams.toString());
    const type = currentParams.get('type') || 'BAPTISM';
    const isMarriageExport = type === 'MARRIAGE';
    const baseUrl = isMarriageExport ? '/api/v1/sacraments/marriages/export' : '/api/v1/sacraments/export';
    const exportUrl = `${baseUrl}?${currentParams.toString()}`;
    window.open(exportUrl, '_blank');
  };

  const items = response?.items || [];
  const total = response?.pagination?.total || 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <SacramentTabs activeTab={activeTab} onTabChange={handleTabChange} />
          
          {(isPending || isLoading) && (
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
          type={activeTab}
          total={total}
          page={page}
          limit={limit}
        />
      )}

      <SacramentInfoCards />
    </div>
  );
}
