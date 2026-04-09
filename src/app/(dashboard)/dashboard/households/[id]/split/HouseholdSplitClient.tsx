"use client";

import { useHouseholdDetailQuery } from "../../queries/useHouseholdDetailQuery";
import { useZonesQuery } from "@/lib/queries/useZonesQuery";
import { SplitWizard } from "./components/SplitWizard";

export default function HouseholdSplitClient({ id }: { id: string }) {
  const { data: householdData, isLoading: isHouseholdLoading } = useHouseholdDetailQuery(id);
  const { data: zonesData, isLoading: isZonesLoading } = useZonesQuery();

  if (isHouseholdLoading || isZonesLoading) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-8 border-b border-border-color bg-surface flex-shrink-0 sticky top-0 z-30">
          <h1 className="font-display font-bold text-2xl text-text-main">Hôn phối & Tách hộ</h1>
        </header>

        <div className="flex-1 flex justify-center items-center bg-background pb-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!householdData || !zonesData) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-8 border-b border-border-color bg-surface flex-shrink-0 sticky top-0 z-30">
          <h1 className="font-display font-bold text-2xl text-text-main">Hôn phối & Tách hộ</h1>
        </header>

        <div className="flex-1 flex justify-center items-center bg-background pb-32 text-on-surface-variant">
           Không thể tải dữ liệu hộ giáo hoặc giáo khu.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      <header className="h-16 flex items-center justify-between px-8 border-b border-border-color bg-surface flex-shrink-0 sticky top-0 z-30">
        <h1 className="font-display font-bold text-2xl text-text-main">Hôn phối & Tách hộ</h1>
      </header>

      <div className="flex-1 overflow-y-auto w-full bg-background pb-32">
        <SplitWizard originHousehold={householdData} zones={zonesData.items || []} />
      </div>
    </div>
  );
}
