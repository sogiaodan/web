'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MoreVertical, Plus } from 'lucide-react';

export function ZoneHeader({ canEdit }: { canEdit: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between gap-6 mb-8 mt-2">
      <h1 className="text-3xl md:text-4xl font-display font-bold text-on-surface">Danh sách Giáo khu</h1>
      
      {canEdit && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-black/5 rounded-full transition-colors text-on-surface-variant flex items-center justify-center min-w-[44px] min-h-[44px]"
            title="Thêm tùy chọn"
          >
            <MoreVertical size={24} />
          </button>
          
          {isOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface border border-outline rounded-lg shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in duration-200">
              <Link 
                href="/dashboard/zones/create"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-primary/5 transition-colors"
              >
                <Plus size={18} className="text-primary" />
                <span className="font-semibold text-primary">Thêm Giáo khu mới</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
