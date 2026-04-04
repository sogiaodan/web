'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CreateZoneDto, UpdateZoneDto, ZoneDetail, ParishionerLookup } from '@/types/zone';
import { toast } from 'sonner';

interface ZoneFormProps {
  initialData?: ZoneDetail;
  isEdit?: boolean;
}

export function ZoneForm({ initialData, isEdit }: ZoneFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateZoneDto>({
    name: initialData?.name || '',
    head_id: initialData?.head?.id || '',
    description: initialData?.description || '',
  });

  // Searching parishioners
  const [headSearchText, setHeadSearchText] = useState(
    initialData?.head ? `${initialData.head.christian_name} ${initialData.head.full_name}` : ''
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ParishionerLookup[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchParishioner = (text: string) => {
    setHeadSearchText(text);
    if (!text.trim()) {
      setSearchResults([]);
      setFormData(prev => ({ ...prev, head_id: '' }));
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    setShowDropdown(true);
    setIsSearching(true);
    
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/parishioners/search?q=${encodeURIComponent(text)}&limit=5`);
        if (res.ok) {
          const body = await res.json();
          setSearchResults(body.data || []);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error('Failed to search parishioners', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const selectParishioner = (p: ParishionerLookup) => {
    setFormData(prev => ({ ...prev, head_id: p.id }));
    setHeadSearchText(`${p.christian_name} ${p.full_name}`);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Vui lòng nhập tên giáo khu');

    setIsSubmitting(true);
    try {
      const url = isEdit ? `/api/v1/zones/${initialData?.id}` : `/api/v1/zones`;
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          head_id: formData.head_id || undefined, // Allow nulling out head if cleared
          description: formData.description || undefined
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Có lỗi xảy ra');
      }

      toast.success(isEdit ? 'Cập nhật giáo khu thành công' : 'Tạo giáo khu mới thành công');
      router.push(isEdit ? `/dashboard/zones/${initialData?.id}` : '/dashboard/zones');
      router.refresh();
      
    } catch (err: any) {
      toast.error(err.message || 'Lỗi kết nối');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface border border-outline rounded p-4 md:p-12 max-w-3xl mx-auto shadow-sm relative corner-accent mt-6">
      <div className="absolute top-0 right-0 w-12 h-12 bg-primary/10 rounded-bl-[20px]" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-primary mb-2">
          {isEdit ? 'Chỉnh sửa Giáo khu' : 'Thêm Giáo khu mới'}
        </h1>
        <p className="text-sm font-body text-on-surface-variant">
          Nhập thông tin chi tiết để thiết lập đơn vị quản lý địa giới mới cho Giáo xứ.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            Tên Giáo khu *
          </label>
          <input
            type="text"
            required
            maxLength={200}
            disabled={isSubmitting}
            value={formData.name}
            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
            placeholder="Ví dụ: Giáo khu Phanxicô Xaviê"
            className="w-full bg-surface border border-outline rounded px-4 py-3 text-sm font-body text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-50"
          />
        </div>

        <div className="space-y-2 relative" ref={dropdownRef}>
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            Trưởng Giáo khu
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 material-symbols-outlined text-on-surface-variant/50 text-[20px]">
              person_search
            </span>
            <input
              type="text"
              value={headSearchText}
              onChange={e => handleSearchParishioner(e.target.value)}
              disabled={isSubmitting}
              placeholder="Tìm kiếm giáo dân để bổ nhiệm..."
              className="w-full bg-surface border border-outline rounded pl-12 pr-4 py-3 text-sm font-body text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-50"
            />
          </div>
          <p className="text-xs font-body italic text-on-surface-variant/70">
            Lưu ý: Chỉ những giáo dân đã có trong hệ thống mới có thể được chọn làm trưởng giáo khu.
          </p>

          {/* Search Dropdown */}
          {showDropdown && headSearchText && (
            <div className="absolute left-0 right-0 mt-1 bg-surface border border-outline rounded shadow-lg z-10 max-h-60 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-sm text-on-surface-variant">Đang tìm kiếm...</div>
              ) : searchResults.length > 0 ? (
                <ul>
                  {searchResults.map(p => (
                    <li 
                      key={p.id}
                      onClick={() => selectParishioner(p)}
                      className="px-4 py-3 hover:bg-surface-container cursor-pointer flex justify-between items-center border-b border-outline last:border-0"
                    >
                      <div>
                        <p className="text-sm font-bold text-on-surface">{p.christian_name} {p.full_name}</p>
                        <p className="text-xs text-on-surface-variant">Ngày sinh: {p.birth_date || 'Không rõ'}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-sm text-on-surface-variant">Không tìm thấy giáo dân</div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            Mô tả / Địa giới
          </label>
          <textarea
            rows={4}
            disabled={isSubmitting}
            value={formData.description}
            onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
            placeholder="Mô tả phạm vi địa lý, các tuyến đường hoặc khu vực thuộc giáo khu này..."
            className="w-full min-h-[120px] bg-surface border border-outline rounded px-4 py-3 text-sm font-body text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-50 resize-y"
          />
        </div>

        {/* System Helper Box */}
        <div className="flex gap-3 bg-surface-container/50 border border-outline rounded-sm p-4">
          <span className="material-symbols-outlined text-[20px] text-primary shrink-0 mt-0.5">info</span>
          <div>
            <h4 className="text-sm font-bold text-on-surface mb-1">Lưu ý hệ thống</h4>
            <p className="text-xs font-body text-on-surface-variant leading-relaxed">
              Dữ liệu sau khi lưu sẽ tự động được đồng bộ với hệ thống thống kê của Giáo xứ. Bạn có thể cập nhật chi tiết ranh giới địa lý sau.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto bg-primary text-white px-8 py-3 rounded shadow-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[20px]">save</span>
            )}
            {isEdit ? 'Cập nhật' : 'Lưu Giáo khu'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="w-full md:w-auto border border-primary text-primary px-8 py-3 rounded font-bold hover:bg-primary/5 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
        </div>
      </form>

      {/* Footer Info */}
      <div className="mt-12 pt-6 border-t border-outline flex justify-between items-center opacity-60">
        <p className="text-xs font-body text-on-surface-variant flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">info</span>
          Tất cả thông tin sẽ được lưu trữ vào kho lưu trữ Sacred Vellum.
        </p>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
          ID: AUTO_GEN_01
        </p>
      </div>

      {/* Watermark */}
      <div className="absolute bottom-4 right-4 pointer-events-none opacity-[0.03] select-none text-[120px] leading-none">
        ⚜
      </div>
    </div>
  );
}
