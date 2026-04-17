"use client";

import { useHouseholdsQuery } from "./queries/useHouseholdsQuery";
import { useZonesQuery } from "@/lib/queries/useZonesQuery";
import { HouseholdFilterBar } from "./components/HouseholdFilterBar";
import { HouseholdTable } from "./components/HouseholdTable";
import { HouseholdSummaryCards } from "./components/HouseholdSummaryCards";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function HouseholdsClient() {
  const searchParams = useSearchParams();
  // Ensure we fall back to defaults effectively, since searchParams.get can be null
  // But wait, URLSearchParams automatically maps undefined to "undefined". 
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";
  const zone_id = searchParams.get("zone_id") || "";
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";

  // The hook handles serializing empty strings nicely
  const queryParams: Record<string, string> = { page, limit };
  if (zone_id) queryParams.zone_id = zone_id;
  if (status) queryParams.status = status;
  if (search) queryParams.search = search;
  
  const { data: householdData, isLoading: isLoadingHouseholds } = useHouseholdsQuery(queryParams);
  const { data: zonesData } = useZonesQuery();

  const isActuallyLoading = isLoadingHouseholds && !householdData;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="text-4xl font-display font-bold text-on-surface mb-2">Danh sách Hộ giáo</h2>
            <p className="text-on-surface-variant font-body">Quản lý thông tin hộ gia đình trong giáo xứ</p>
          </div>

          <Link 
            href="/dashboard/households/add"
            className="flex items-center justify-center gap-2 bg-primary text-white px-6 h-12 rounded-sm font-bold text-sm hover:bg-primary/90 transition-all shadow-sm shrink-0"
          >
            <Plus className="h-5 w-5" />
            Tạo Hộ giáo mới
          </Link>
        </div>

        {isActuallyLoading ? (
          <div className="flex justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : !householdData ? (
          <div className="bg-surface border border-outline rounded p-8 text-center text-on-surface-variant">
            Không thể tải dữ liệu hộ giáo. Vui lòng thử lại sau.
          </div>
        ) : (
          <>
            <HouseholdFilterBar 
              zones={zonesData?.items || []} 
              total={householdData.pagination?.total || 0}
            />
            
            <HouseholdTable 
              households={householdData.items || []} 
              total={householdData.pagination?.total || 0}
              page={Number(page)}
              limit={Number(limit)}
            />

            {householdData?.stats && (
              <HouseholdSummaryCards stats={householdData.stats} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
