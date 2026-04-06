'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { 
  ChevronRight, 
  Search, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2,
  BookHeart
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { SettingsSaintsAPI, SaintName } from '@/lib/api/settings';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function SaintsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSaint, setEditingSaint] = useState<SaintName | null>(null);
  const [deletingSaint, setDeletingSaint] = useState<SaintName | null>(null);
  
  // Fetch data
  const { data: response, error, isLoading, mutate } = useSWR(
    '/settings/saints',
    SettingsSaintsAPI.list
  );

  const saints = response?.data || [];

  // Client-side filtering
  const filteredSaints = useMemo(() => {
    if (!searchTerm) return saints;
    return saints.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [saints, searchTerm]);

  const popularSaints = filteredSaints.filter(s => s.is_popular);
  const otherSaints = filteredSaints.filter(s => !s.is_popular);

  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  const handleAddSuccess = () => {
    setIsAddOpen(false);
    mutate();
  };

  const handleEditSuccess = () => {
    setEditingSaint(null);
    mutate();
  };

  const handleDeleteSuccess = () => {
    setDeletingSaint(null);
    mutate();
  };

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 lg:max-w-5xl lg:mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm font-medium text-muted mb-6">
        <Link href="/settings" className="hover:text-primary transition-colors">
          Cài đặt
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-primary font-bold">Quản lý tên thánh</span>
      </nav>

      {/* Header & CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-[24px] md:text-[28px] font-bold text-foreground">
            Danh mục Tên Thánh
          </h1>
          <p className="font-sans text-sm md:text-base text-muted mt-1">
            Quản lý danh sách các tên thánh sử dụng trong hồ sơ giáo xứ.
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center justify-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[48px] w-full md:w-auto transition-colors"
          >
            <Plus className="h-5 w-5" />
            Thêm tên thánh
          </button>
        )}
      </div>

      {/* Search Bar - Sticky on mobile */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
          <input
            type="text"
            placeholder="Tìm kiếm tên thánh (Giuse, Maria...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded bg-white border border-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-base text-foreground transition-all"
          />
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner className="h-8 w-8 text-primary" />
        </div>
      )}

      {error && !isLoading && (
        <div className="text-center py-12 text-error border border-error/20 rounded bg-error/5">
          <p>Có lỗi xảy ra khi tải danh mục tên thánh. Vui lòng thử lại.</p>
          <button onClick={() => mutate()} className="mt-4 text-primary underline">Tải lại</button>
        </div>
      )}

      {/* Data Visualization */}
      {!isLoading && !error && (
        <div className="flex flex-col gap-8 pb-12">
          {/* Phổ biến Section */}
          <section>
            <div className="flex items-center gap-4 mb-4">
              <h2 className="font-serif text-[18px] md:text-[20px] font-bold text-foreground whitespace-nowrap">
                Phổ biến
              </h2>
              <div className="h-[1px] w-full bg-outline"></div>
            </div>
            
            {popularSaints.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularSaints.map(saint => (
                  <SaintCard 
                    key={saint.name}
                    saint={saint}
                    canEdit={canEdit}
                    onEdit={() => setEditingSaint(saint)}
                    onDelete={() => setDeletingSaint(saint)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm italic">Không tìm thấy tên thánh phổ biến nào.</p>
            )}
          </section>

          {/* Các tên thánh khác Section */}
          <section>
            <div className="flex items-center gap-4 mb-4">
              <h2 className="font-serif text-[18px] md:text-[20px] font-bold text-foreground whitespace-nowrap">
                Các tên thánh khác
              </h2>
              <div className="h-[1px] w-full bg-outline"></div>
            </div>
            
            {otherSaints.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {otherSaints.map(saint => (
                  <SaintCard 
                    key={saint.name}
                    saint={saint}
                    canEdit={canEdit}
                    onEdit={() => setEditingSaint(saint)}
                    onDelete={() => setDeletingSaint(saint)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm italic">Không tìm thấy tên thánh nào.</p>
            )}
          </section>

          {/* Educational Info Card */}
          <div className="mt-8 bg-surface-container rounded border border-outline flex overflow-hidden">
            <div className="p-6 md:p-8 flex-1">
              <div className="flex items-center gap-2 text-primary mb-3">
                <BookHeart className="h-6 w-6" />
                <h3 className="font-serif font-bold text-lg">Vai trò của Tên Thánh</h3>
              </div>
              <p className="text-foreground text-sm md:text-base leading-relaxed">
                Trong truyền thống Công giáo, việc chọn tên thánh mang ý nghĩa sâu sắc, giúp giáo dân có một đấng bảo trợ và gương mẫu sống đạo. Việc quản lý chính xác danh mục này giúp việc tra cứu hồ sơ bí tích được đồng nhất và trang trọng.
              </p>
              <ul className="mt-4 flex flex-col md:flex-row gap-2 md:gap-6 text-sm text-foreground">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Chuẩn hóa tên gọi</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Tra cứu nhanh chóng</li>
              </ul>
            </div>
            {/* Image (hidden on mobile) */}
            <div className="hidden md:block w-[240px] bg-secondary-container flex-shrink-0 relative opacity-80 mix-blend-multiply">
              {/* Optional visually decorative area representing an old book or archives */}
              <div className="absolute inset-0 flex items-center justify-center p-8 text-outline">
                <BookHeart className="h-32 w-32 opacity-20" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isAddOpen && (
        <SaintFormModal 
          mode="ADD" 
          onClose={() => setIsAddOpen(false)} 
          onSuccess={handleAddSuccess} 
        />
      )}
      {editingSaint && (
        <SaintFormModal 
          mode="EDIT" 
          saint={editingSaint} 
          onClose={() => setEditingSaint(null)} 
          onSuccess={handleEditSuccess} 
        />
      )}
      {deletingSaint && (
        <DeleteConfirmationModal
          saint={deletingSaint}
          onClose={() => setDeletingSaint(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}

// --- SUB-COMPONENTS ---

function SaintCard({ 
  saint, 
  canEdit, 
  onEdit, 
  onDelete 
}: { 
  saint: SaintName, 
  canEdit: boolean,
  onEdit: () => void,
  onDelete: () => void 
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative bg-white border border-outline rounded p-4 flex flex-col md:flex-row md:items-center justify-between group hover:border-primary transition-colors min-h-[80px]">
      <div className="flex-1">
        <h3 className="font-serif font-bold text-[18px] text-foreground group-hover:text-primary transition-colors">
          {saint.name}
        </h3>
        <div className="mt-2 text-sm font-bold">
          {saint.gender === 'MALE' ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase bg-blue-100 text-blue-700">
              NAM
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase bg-pink-100 text-pink-700">
              NỮ
            </span>
          )}
        </div>
      </div>
      
      {canEdit && (
        <div className="absolute top-3 right-3 md:relative md:top-auto md:right-auto">
          <button 
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            onBlur={() => setTimeout(() => setMenuOpen(false), 200)}
            className="p-2 rounded-full hover:bg-hover-bg text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary min-h-[48px] min-w-[48px] flex items-center justify-center -mr-2 md:mr-0"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-outline rounded shadow-lg overflow-hidden z-20">
              <button
                type="button"
                className="w-full flex items-center gap-2 px-4 py-3 min-h-[48px] text-sm text-foreground hover:bg-hover-bg transition-colors"
                onClick={onEdit}
              >
                <Edit2 className="h-4 w-4" />
                Chỉnh sửa
              </button>
              <button
                type="button"
                className="w-full flex items-center gap-2 px-4 py-3 min-h-[48px] text-sm text-error hover:bg-error/10 transition-colors"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
                Xóa tên thánh
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SaintFormModal({ 
  mode, 
  saint, 
  onClose, 
  onSuccess 
}: { 
  mode: 'ADD' | 'EDIT', 
  saint?: SaintName, 
  onClose: () => void,
  onSuccess: () => void 
}) {
  const [name, setName] = useState(saint?.name || '');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>(saint?.gender || 'MALE');
  const [isPopular, setIsPopular] = useState(saint?.is_popular || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorName, setErrorName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorName('');

    if (!name.trim()) {
      setErrorName('Tên thánh không được để trống.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'ADD') {
        await SettingsSaintsAPI.create({ 
          name: name.trim(), 
          gender, 
          is_popular: isPopular 
        });
        toast.success('Thêm tên thánh thành công');
      } else if (mode === 'EDIT' && saint) {
        await SettingsSaintsAPI.update(saint.name, { 
          new_name: name.trim() !== saint.name ? name.trim() : undefined,
          gender,
          is_popular: isPopular 
        });
        toast.success('Cập nhật tên thánh thành công');
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Thao tác thất bại');
      if (err.message && err.message.toLowerCase().includes('exist')) {
        setErrorName('Tên thánh đã tồn tại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-foreground/50 transition-opacity" onClick={() => !isSubmitting && onClose()} />
      <div className="fixed inset-x-0 bottom-0 md:bottom-auto md:top-1/2 md:left-1/2 z-50 w-full md:max-w-[480px] md:-translate-x-1/2 md:-translate-y-1/2">
        <form onSubmit={handleSubmit} className="bg-background rounded-t-xl md:rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="px-6 py-5 border-b border-outline flex items-center justify-between bg-surface">
            <h3 className="font-serif text-[20px] font-bold text-foreground">
              {mode === 'ADD' ? 'Thêm Tên Thánh' : 'Chỉnh sửa Tên Thánh'}
            </h3>
            <button 
              type="button" 
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 rounded-full hover:bg-hover-bg text-muted min-h-[48px] min-w-[48px] flex items-center justify-center -mr-2"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                TÊN THÁNH <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="VD: Giuse, Maria"
                className={`w-full h-12 px-4 rounded bg-white border ${errorName ? 'border-error ring-1 ring-error' : 'border-outline focus:border-primary focus:ring-1 focus:ring-primary'} focus:outline-none transition-all`}
                disabled={isSubmitting}
              />
              {errorName && <p className="mt-1 text-sm text-error">{errorName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                GIỚI TÍNH <span className="text-error">*</span>
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div className="relative flex items-center justify-center w-6 h-6">
                    <input
                      type="radio"
                      name="gender"
                      value="MALE"
                      checked={gender === 'MALE'}
                      onChange={() => setGender('MALE')}
                      disabled={isSubmitting}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded-full border-2 border-outline peer-checked:border-primary transition-colors"></div>
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-primary scale-0 peer-checked:scale-100 transition-transform"></div>
                  </div>
                  <span className="text-base text-foreground font-medium">Nam (Ông Thánh)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div className="relative flex items-center justify-center w-6 h-6">
                    <input
                      type="radio"
                      name="gender"
                      value="FEMALE"
                      checked={gender === 'FEMALE'}
                      onChange={() => setGender('FEMALE')}
                      disabled={isSubmitting}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded-full border-2 border-outline peer-checked:border-primary transition-colors"></div>
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-primary scale-0 peer-checked:scale-100 transition-transform"></div>
                  </div>
                  <span className="text-base text-foreground font-medium">Nữ (Bà Thánh)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer p-4 border border-outline rounded hover:bg-hover-bg transition-colors">
                <div className="relative flex items-center justify-center w-6 h-6">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    disabled={isSubmitting}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 rounded border-2 border-outline peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                    <svg className="w-3 h-3 text-white scale-0 peer-checked:scale-100 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>
                <div className="flex-1">
                  <span className="block text-base font-semibold text-foreground">Đánh dấu phổ biến</span>
                  <span className="block text-sm text-muted">Ghim tên thánh này lên phần trên cùng của danh sách để dễ tra cứu.</span>
                </div>
              </label>
            </div>
          </div>
          
          <div className="p-4 bg-surface border-t border-outline flex flex-col md:flex-row items-center justify-end gap-3 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full md:w-auto px-4 py-2 text-sm font-medium text-foreground hover:bg-hover-bg border border-outline rounded min-h-[48px] transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded min-h-[48px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <LoadingSpinner className="h-4 w-4" /> : null}
              {mode === 'ADD' ? 'Tạo tên thánh' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function DeleteConfirmationModal({ 
  saint, 
  onClose, 
  onSuccess 
}: { 
  saint: SaintName, 
  onClose: () => void,
  onSuccess: () => void 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await SettingsSaintsAPI.delete(saint.name);
      toast.success('Xóa tên thánh thành công');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa tên thánh. Tên thánh có thể đang được sử dụng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-foreground/50 transition-opacity" onClick={() => !isSubmitting && onClose()} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-[calc(100vw-32px)] md:max-w-md -translate-x-1/2 -translate-y-1/2">
        <div className="bg-background rounded-xl shadow-xl overflow-hidden flex flex-col">
          <div className="p-6 pb-4">
            <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mb-4 mx-auto md:mx-0">
              <Trash2 className="h-6 w-6 text-error" />
            </div>
            <h3 className="font-serif text-[20px] font-bold text-foreground text-center md:text-left mb-2">
              Xóa Tên Thánh
            </h3>
            <p className="text-base text-foreground text-center md:text-left mt-2">
              Bạn có chắc chắn muốn xóa tên thánh <strong className="font-serif text-primary">{saint.name}</strong> không?
            </p>
            <p className="text-sm text-error mt-2 p-3 bg-error/5 rounded border border-error/10">
              <strong>Lưu ý:</strong> Hành động này không thể hoàn tác. Nếu tên thánh này đang được sử dụng trong hồ sơ giáo dân hoặc linh mục, hệ thống sẽ từ chối việc xóa.
            </p>
          </div>
          
          <div className="px-6 py-4 bg-surface border-t border-outline flex flex-col md:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full md:w-auto px-4 py-2 text-sm font-medium text-foreground hover:bg-hover-bg border border-outline rounded min-h-[48px] transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="w-full md:w-auto px-6 py-2 text-sm font-medium text-white bg-error hover:bg-error/90 rounded min-h-[48px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <LoadingSpinner className="h-4 w-4" /> : null}
              Xóa tên thánh
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
