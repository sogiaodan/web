"use client";

import { useZonesQuery } from '@/lib/queries/useZonesQuery';
import { useAuth } from '@/components/providers/auth-provider';
import { ZoneSummaryWidgets } from './components/ZoneSummaryWidgets';
import { ZoneTable } from './components/ZoneTable';
import { ZoneHeader } from './components/ZoneHeader';
import { EmptyZoneState } from './components/EmptyZoneState';

export default function ZonesClient() {
  const { data: zoneData, isLoading, error } = useZonesQuery();
  const { user } = useAuth();

  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const churchName = user?.church_name || 'Đa Minh';

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-7xl mx-auto text-on-surface">
        <ZoneHeader canEdit={canEdit} />

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : error || !zoneData ? (
          <div className="bg-surface border border-outline rounded p-8 text-center text-on-surface-variant font-body mt-4">
            Không thể tải dữ liệu giáo khu. Vui lòng thử lại sau.
          </div>
        ) : (
          <>
            {zoneData.stats && (
              <ZoneSummaryWidgets 
                totalZones={zoneData.stats.total_zones} 
                totalMembers={zoneData.stats.total_zone_members} 
              />
            )}

            {zoneData.items && zoneData.items.length > 0 ? (
              <ZoneTable 
                zones={zoneData.items} 
                churchName={churchName}
              />
            ) : (
              <EmptyZoneState canEdit={canEdit} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
