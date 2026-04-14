"use client";

import { useZoneDetailQuery } from "../queries/useZoneDetailQuery";
import { useAuth } from "@/components/providers/auth-provider";
import { ZoneDetailHeader } from "./components/ZoneDetailHeader";
import { ZoneInfoCard } from "./components/ZoneInfoCard";
import { ZoneStatCards } from "./components/ZoneStatCards";
import { ZoneParishionerTable } from "./components/ZoneParishionerTable";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function ZoneDetailClient({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const canEdit = user?.role === "ADMIN" || user?.role === "EDITOR";

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

    params.page = params.page || "1";
    params.limit = params.limit || "10";
    return params;
  }, [searchParams]);

  const { data: zone, isLoading, error } = useZoneDetailQuery(id, queryParams as any);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
        <div className="max-w-7xl mx-auto flex justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || !zone) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
        <div className="max-w-7xl mx-auto">
          <div className="bg-surface border border-outline rounded p-8 text-center text-on-surface-variant font-body">
            Không thể tải dữ liệu giáo khu. Có thể giáo khu không tồn tại hoặc đã bị xóa.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-7xl mx-auto">
        <ZoneDetailHeader id={zone.id} name={zone.name} canEdit={canEdit} />

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-3/5">
            <ZoneInfoCard head={zone.head} description={zone.description} />
          </div>
          <div className="w-full md:w-2/5">
            <ZoneStatCards 
              totalParishioners={zone.stats?.total_parishioners || 0} 
              totalHouseholds={zone.stats?.total_households || 0} 
            />
          </div>
        </div>

        <ZoneParishionerTable 
          zoneId={zone.id}
          items={zone.parishioners?.items || []}
          total={zone.parishioners?.pagination?.total || 0}
          page={Number(queryParams.page)}
          limit={Number(queryParams.limit)}
        />
      </div>
    </div>
  );
}
