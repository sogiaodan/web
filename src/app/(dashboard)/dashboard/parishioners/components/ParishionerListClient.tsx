'use client';
import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { AdvancedFilterDrawer } from './AdvancedFilterDrawer';
import { QuickPreviewDrawer } from './QuickPreviewDrawer';
import { ParishionerTable } from './ParishionerTable';
import { ParishionerFilterBar } from './ParishionerFilterBar';
import { ParishionerSummaryCards } from './ParishionerSummaryCards';
import { useParishionersQuery } from '../queries/useParishionerQueries';
import { useZonesQuery } from '@/lib/queries/useZonesQuery';

export function ParishionerListClient() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const [previewId, setPreviewId] = useState<string | null>(null);

  const handleOpenPreview = useCallback((id: string) => setPreviewId(id), []);
  const handleClosePreview = useCallback(() => setPreviewId(null), []);

  const { data: zonesData } = useZonesQuery();
  const zones = zonesData?.items || [];

  const queryParams = useMemo(() => {
    const params: Record<string, string | string[]> = {};
    searchParams.forEach((value, key) => {
      if (params[key]) {
        if (Array.isArray(params[key])) {
          (params[key] as string[]).push(value);
        } else {
          params[key] = [params[key] as string, value];
        }
      } else {
        params[key] = value;
      }
    });

    params.page = params.page || '1';
    params.limit = params.limit || '10';
    return params;
  }, [searchParams]);

  const { data, isLoading } = useParishionersQuery(queryParams);
  
  if (isLoading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-white border border-outline rounded-sm mb-6" />
        <div className="bg-white border border-outline rounded-sm overflow-hidden">
          <div className="h-10 bg-slate-50 border-b border-outline" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b border-outline last:border-0" />
          ))}
        </div>
      </div>
    );
  }

  const items = data?.items || [];
  const total = data?.pagination?.total || 0;
  const page = data?.pagination?.page || Number(queryParams.page);
  const limit = data?.pagination?.limit || Number(queryParams.limit);

  return (
    <>
      <ParishionerFilterBar
        zones={zones}
        canEdit={canEdit}
        filterDrawerSlot={<AdvancedFilterDrawer zones={zones} />}
      />
      <ParishionerTable
        items={items}
        total={total}
        page={page}
        limit={limit}
        canEdit={canEdit}
        onPreview={handleOpenPreview}
      />
      {data?.stats && (
        <ParishionerSummaryCards stats={data.stats} />
      )}
      <QuickPreviewDrawer
        parishionerId={previewId}
        onClose={handleClosePreview}
        canEdit={canEdit}
      />
    </>
  );
}
