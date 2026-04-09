"use client";

import { useZoneDetailQuery } from "../../queries/useZoneDetailQuery";
import { ZoneForm } from "../../components/ZoneForm";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ZoneEditClient({ id }: { id: string }) {
  const { data: zone, isLoading, error } = useZoneDetailQuery(id);
  const { user } = useAuth();
  const router = useRouter();

  const canEdit = user?.role === "ADMIN" || user?.role === "EDITOR";

  useEffect(() => {
    if (user && !canEdit) {
      router.replace("/dashboard/zones");
    }
  }, [user, canEdit, router]);

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
        <div className="max-w-7xl mx-auto text-center p-8 text-on-surface-variant">
          Không thể tải dữ liệu giáo khu.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 text-sm font-body text-on-surface-variant flex items-center gap-1">
          <Link href="/dashboard/zones" className="hover:text-primary transition-colors">Giáo khu</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link href={`/dashboard/zones/${id}`} className="hover:text-primary transition-colors">Chi tiết Giáo khu</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="font-bold text-on-surface">Chỉnh sửa</span>
        </div>
        
        <ZoneForm initialData={zone} isEdit />
      </div>
    </div>
  );
}
