'use client';

import { Household, ParishionerSummary } from '@/types/household';
import { AlertCircle, UserCheck, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

interface SplitHouseholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  household: Household;
}

export function SplitHouseholdModal({ isOpen, onClose, household }: SplitHouseholdModalProps) {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const children = (household.current_members || []).filter(
    (m: ParishionerSummary) => m.relationship_to_head === 'CHILD'
  );

  const handleSelectChild = (childId: string) => {
    onClose();
    router.push(`/dashboard/households/${household.id}/split?child_id=${childId}`);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-background rounded-lg shadow-xl w-full max-w-md flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline">
          <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px]">church</span>
            Tách hộ
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-hover-bg transition-colors text-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex gap-3 text-amber-800 items-start">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Lưu ý quan trọng</p>
              <p>
                Chỉ thực hiện tách hộ nếu con cái đã có <strong>Sổ gia đình Công giáo mới</strong> và vợ chồng đang sinh hoạt ổn định (cư trú) tại Giáo xứ.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Chọn giáo dân để tách thành Hộ mới:</h4>

            {children.length === 0 ? (
              <p className="text-sm text-muted italic px-1">
                Không có thành viên nào là con trong Hộ giáo này (hoặc chưa cập nhật quan hệ ‘Con’).
              </p>
            ) : (
              <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto">
                {children.map((child: ParishionerSummary) => (
                  <button
                    key={child.id}
                    onClick={() => handleSelectChild(child.id)}
                    className="flex justify-between items-center p-3 border border-border-color rounded-md hover:border-primary/50 hover:bg-primary/5 transition-colors group cursor-pointer text-left"
                  >
                    <div>
                      <div className="font-bold text-foreground text-sm">
                        {child.christian_name} {child.full_name}
                      </div>
                      <div className="text-xs text-muted mt-0.5">
                        Ngày sinh:{' '}
                        {child.birth_date
                          ? new Date(child.birth_date).toLocaleDateString('vi-VN')
                          : '---'}
                      </div>
                    </div>
                    <UserCheck className="w-5 h-5 text-muted opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
