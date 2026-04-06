'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { SacramentTabs } from './SacramentTabs';
import { SacramentFilterBar } from './SacramentFilterBar';
import { SacramentTable } from './SacramentTable';
import { MarriageTable } from './MarriageTable';
import { SacramentInfoCards } from './SacramentInfoCards';
import { SacramentListItem, MarriageListItem, SacramentType } from '@/types/sacrament';

interface SacramentListClientProps {
  canEdit: boolean;
  items: (SacramentListItem | MarriageListItem)[];
  total: number;
  page: number;
  limit: number;
  activeTab: SacramentType;
}

export function SacramentListClient({
  canEdit,
  items,
  total,
  page,
  limit,
  activeTab
}: SacramentListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleTabChange = (type: SacramentType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('type', type);
    params.delete('page'); // reset page on tab switch
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (search: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleExport = () => {
    const currentParams = new URLSearchParams(searchParams.toString());
    const type = currentParams.get('type') || 'BAPTISM';
    
    // Using explicit file download
    const isMarriage = type === 'MARRIAGE';
    const baseUrl = isMarriage ? '/api/v1/sacraments/marriages/export' : '/api/v1/sacraments/export';
    const exportUrl = `${baseUrl}?${currentParams.toString()}`;
    
    window.open(exportUrl, '_blank');
  };

  const isMarriage = activeTab === 'MARRIAGE';

  return (
    <>
      {canEdit && (
        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-10 hidden md:block">
          <Link
            href="/dashboard/sacraments/new"
            className="flex items-center gap-2 bg-primary text-white px-4 h-12 rounded-sm font-bold text-sm hover:bg-primary/90 transition-colors shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Plus className="h-5 w-5" />
            Ghi nhận Bí tích
          </Link>
        </div>
      )}

      {canEdit && (
        <div className="md:hidden fixed bottom-6 right-6 z-40">
          <Link
            href="/dashboard/sacraments/new"
            className="flex items-center justify-center bg-primary text-white w-14 h-14 rounded-lg shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 hover:bg-primary/90 transition-all"
            aria-label="Ghi nhận Bí tích"
          >
            <Plus className="h-6 w-6" />
          </Link>
        </div>
      )}

      <SacramentTabs activeTab={activeTab} onTabChange={handleTabChange} />
      
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
    </>
  );
}
