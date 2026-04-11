'use client';

import Link from 'next/link';
import { Map, Plus } from 'lucide-react';

export function EmptyZoneState({ canEdit }: { canEdit: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-surface border border-dashed border-outline rounded-xl mt-4">
      <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
        <Map size={40} />
      </div>
      
      <h2 className="text-2xl font-display font-bold text-on-surface mb-2">Chưa có Giáo khu nào</h2>
      <p className="text-on-surface-variant font-body max-w-md mb-8">
        Hệ thống chưa ghi nhận thông tin giáo khu nào. Hãy bắt đầu bằng cách thêm các giáo khu trong giáo xứ của bạn để quản lý giáo dân hiệu quả hơn.
      </p>
      
      {canEdit && (
        <Link 
          href="/dashboard/zones/create"
          className="bg-primary text-white px-8 py-3 rounded-lg shadow-lg flex items-center gap-2 font-bold hover:shadow-xl hover:translate-y-[-2px] transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>Thêm Giáo khu đầu tiên</span>
        </Link>
      )}
    </div>
  );
}
