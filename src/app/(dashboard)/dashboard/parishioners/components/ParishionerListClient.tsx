'use client';

import { useState, useCallback } from 'react';
import { Zone } from '@/types/zone';
import { ParishionerListItem } from '@/types/parishioner';
import { AdvancedFilterDrawer } from './AdvancedFilterDrawer';
import { QuickPreviewDrawer } from './QuickPreviewDrawer';
import { ParishionerTable } from './ParishionerTable';
import { ParishionerFilterBar } from './ParishionerFilterBar';

interface Props {
  zones: Zone[];
  canEdit: boolean;
  items: ParishionerListItem[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Client shell that owns the drawer open/close state.
 * Keeps the list page (Server Component) clean.
 */
export function ParishionerListClient({ zones, canEdit, items, total, page, limit }: Props) {
  const [previewId, setPreviewId] = useState<string | null>(null);

  const handleOpenPreview = useCallback((id: string) => setPreviewId(id), []);
  const handleClosePreview = useCallback(() => setPreviewId(null), []);

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
      <QuickPreviewDrawer
        parishionerId={previewId}
        onClose={handleClosePreview}
        canEdit={canEdit}
      />
    </>
  );
}
