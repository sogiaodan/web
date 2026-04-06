'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { CertificateTypeTabs } from './CertificateTypeTabs';
import { CertificateFilterBar } from './CertificateFilterBar';
import { CertificateTable } from './CertificateTable';
import { CertificateListItem, CertificateType } from '@/types/catechism';

interface CertificateListClientProps {
  canEdit: boolean;
  isAdmin: boolean;
  items: CertificateListItem[];
  total: number;
  page: number;
  limit: number;
  activeTab: CertificateType;
}

export function CertificateListClient({
  canEdit,
  isAdmin,
  items,
  total,
  page,
  limit,
  activeTab,
}: CertificateListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleTabChange = (type: CertificateType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('type', type);
    params.delete('page');
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
    currentParams.set('type', activeTab);
    window.open(`/api/v1/catechism-certificates/export?${currentParams.toString()}`, '_blank');
  };

  return (
    <>
      {/* CTA - Desktop absolute positioning */}
      {canEdit && (
        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-10 hidden md:block">
          <Link
            href="/dashboard/catechism/new"
            className="flex items-center gap-2 bg-primary text-white px-4 h-12 rounded-sm font-bold text-sm hover:bg-primary/90 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Plus className="h-5 w-5" />
            Ghi nhận Chứng chỉ
          </Link>
        </div>
      )}

      {/* CTA - Mobile FAB */}
      {canEdit && (
        <div className="md:hidden fixed bottom-6 right-6 z-40">
          <Link
            href="/dashboard/catechism/new"
            className="flex items-center justify-center bg-primary text-white w-14 h-14 rounded-lg shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 hover:bg-primary/90 transition-all"
            aria-label="Ghi nhận Chứng chỉ"
          >
            <Plus className="h-6 w-6" />
          </Link>
        </div>
      )}

      <CertificateTypeTabs activeTab={activeTab} onTabChange={handleTabChange} />

      <CertificateFilterBar
        search={searchParams.get('search') || ''}
        onSearchChange={handleSearch}
        onExport={handleExport}
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
    </>
  );
}
