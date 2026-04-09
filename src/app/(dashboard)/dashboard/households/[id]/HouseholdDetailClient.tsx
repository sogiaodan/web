"use client";

import { useHouseholdDetailQuery } from "./queries/useHouseholdDetailQuery";
import { HouseholdDetailHeader } from "./components/HouseholdDetailHeader";
import { StatusSyncAlert } from "./components/StatusSyncAlert";
import { CoupleCards } from "./components/CoupleCards";
import { MembersTable } from "./components/MembersTable";
import { SplitMembersSection } from "./components/SplitMembersSection";
import Link from "next/link";
import { notFound } from "next/navigation";

export default function HouseholdDetailClient({ id }: { id: string }) {
  const { data: householdData, isLoading, error } = useHouseholdDetailQuery(id);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-8 border-b border-border-color bg-surface flex-shrink-0">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/households" className="text-muted text-sm font-medium hover:text-primary transition-colors">
              Hộ giáo
            </Link>
            <span className="material-symbols-outlined text-sm text-muted/60">chevron_right</span>
            <span className="font-display font-bold text-lg text-primary">Chi tiết Hộ giáo</span>
          </div>
        </header>
        <div className="flex-1 p-8 bg-background-light flex justify-center items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || !householdData) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-8 border-b border-border-color bg-surface flex-shrink-0">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/households" className="text-muted text-sm font-medium hover:text-primary transition-colors">
              Hộ giáo
            </Link>
          </div>
        </header>
        <div className="flex-1 p-8 bg-background-light flex justify-center items-center">
           Không thể tải dữ liệu hộ giáo. Có thể hộ không tồn tại hoặc đã bị xóa.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      <header className="h-16 flex items-center justify-between px-8 border-b border-border-color bg-surface flex-shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/households" className="text-muted text-sm font-medium hover:text-primary transition-colors">
            Hộ giáo
          </Link>
          <span className="material-symbols-outlined text-sm text-muted/60">chevron_right</span>
          <h1 className="font-display font-bold text-lg text-primary">Chi tiết Hộ giáo {householdData.household_code}</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light text-text-main">
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
          <StatusSyncAlert household={householdData} />
          <HouseholdDetailHeader household={householdData} />
          <CoupleCards household={householdData} />
          <MembersTable members={householdData.current_members || []} />
          <SplitMembersSection members={householdData.split_members || []} />
        </div>
      </div>
    </div>
  );
}
