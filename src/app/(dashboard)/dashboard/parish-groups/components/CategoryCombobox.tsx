"use client";

import { useState, useRef, useEffect } from 'react';
import { ParishGroupCategory } from '@/types/parish-group';
import { useCreateParishGroupCategory } from '../queries/useParishGroupMutations';
import { cn } from '@/lib/utils';
import { Search, PlusCircle, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  categories: ParishGroupCategory[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function CategoryCombobox({ categories, value, onChange, error }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const createCategoryMutation = useCreateParishGroupCategory();

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  
  const showCreateOption = search.trim().length > 0 && 
    !categories.some(c => c.name.toLowerCase() === search.trim().toLowerCase());

  const selectedCategory = categories.find(c => c.id === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreate = async () => {
    const trimmedName = search.trim();
    if (!trimmedName) return;

    try {
      const result = await createCategoryMutation.mutateAsync({ name: trimmedName });
      onChange(result.id);
      setIsOpen(false);
      setSearch('');
      toast.success('Đã tạo phân loại mới');
    } catch (err: unknown) {
      if ((err as { status?: number }).status === 409) {
        toast.error('Phân loại này đã tồn tại');
      } else {
        toast.error((err as Error).message || 'Lỗi khi tạo phân loại');
      }
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div 
        className={cn(
          "w-full min-h-[48px] px-4 py-3 bg-surface border rounded-xl flex items-center justify-between cursor-pointer transition-all",
          error ? "border-red-500" : isOpen ? "border-primary ring-2 ring-primary/20" : "border-outline hover:border-outline-variant",
          !selectedCategory && "text-on-surface-variant"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedCategory ? selectedCategory.name : "Chọn hoặc tạo phân loại..."}</span>
        <Search className="w-5 h-5 text-on-surface-variant" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-surface border border-outline rounded-xl shadow-lg max-h-60 overflow-y-auto overflow-x-hidden p-2">
          <div className="sticky top-0 bg-surface pb-2">
            <input
              type="text"
              className="w-full px-3 py-2 bg-background rounded-lg border border-outline focus:outline-none focus:border-primary text-sm"
              placeholder="Tìm kiếm hoặc nhập tên phân loại mới..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between px-3 py-2 hover:bg-surface-variant/50 rounded-lg cursor-pointer"
                onClick={() => {
                  onChange(cat.id);
                  setIsOpen(false);
                  setSearch('');
                }}
              >
                <span>{cat.name}</span>
                {value === cat.id && <Check className="w-4 h-4 text-primary" />}
              </div>
            ))}

            {showCreateOption && (
              <div
                className="flex items-center gap-2 px-3 py-2 hover:bg-primary/5 text-primary rounded-lg cursor-pointer mt-1 border-t border-outline/50 pt-2"
                onClick={handleCreate}
              >
                {createCategoryMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <PlusCircle className="w-4 h-4" />
                )}
                <span className="font-medium">Tạo mới &quot;{search.trim()}&quot;</span>
              </div>
            )}

            {filteredCategories.length === 0 && !showCreateOption && (
              <div className="px-3 py-4 text-center text-on-surface-variant text-sm">
                Không tìm thấy phân loại
              </div>
            )}
          </div>
        </div>
      )}
      
      {error && <span className="text-red-500 text-xs mt-1 block">{error}</span>}
    </div>
  );
}
