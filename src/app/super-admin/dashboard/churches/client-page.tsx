'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Church, Plus, Search, Building2, Globe, User, Mail, Calendar } from 'lucide-react';
import { ChurchOnboardingForm } from './onboarding-form';
import { useChurchesQuery, useOnboardChurchMutation } from '@/lib/queries/useSystemAdminQueries';
import { ChurchListItem } from '@/types/system-admin';
import clsx from 'clsx';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ChurchCardSkeleton() {
  return (
    <div className="bg-white border border-outline p-6 rounded-sm shadow-sm animate-pulse">
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-5 w-3/4 bg-outline/50 rounded" />
            <div className="h-4 w-1/2 bg-outline/30 rounded" />
          </div>
          <div className="h-3 w-3 rounded-full bg-outline/50" />
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline/50">
          <div className="space-y-2">
            <div className="h-3 w-16 bg-outline/30 rounded" />
            <div className="h-4 w-24 bg-outline/40 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-16 bg-outline/30 rounded" />
            <div className="h-4 w-24 bg-outline/40 rounded" />
          </div>
          <div className="col-span-2 space-y-2">
            <div className="h-3 w-16 bg-outline/30 rounded" />
            <div className="h-4 w-40 bg-outline/40 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Church Card ──────────────────────────────────────────────────────────────

interface ChurchCardProps {
  church: ChurchListItem;
  onClick: (id: string) => void;
}

function ChurchCard({ church, onClick }: ChurchCardProps) {
  const isActive = church.status === 'ACTIVE';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(church.id)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(church.id)}
      className="bg-white border border-outline p-6 rounded-sm shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 min-h-[48px]"
    >
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity select-none pointer-events-none">
        <Building2 className="h-24 w-24" />
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-serif text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors duration-200">
              {church.name}
            </h3>
            <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-primary uppercase tracking-wider bg-primary/5 px-2 py-1 rounded w-fit italic">
              <Globe className="h-3 w-3" />
              {church.schema_name}
            </div>
          </div>
          <div
            className={clsx(
              'h-3 w-3 rounded-full shadow-sm shrink-0 mt-1',
              isActive
                ? 'bg-green-500 shadow-green-500/50'
                : 'bg-stone-400 shadow-stone-400/30',
            )}
            title={isActive ? 'Đang hoạt động' : 'Vô hiệu hóa'}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline/50">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Quản trị viên</p>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <User className="h-3.5 w-3.5 text-muted shrink-0" />
              <span className="font-medium truncate">{church.admin?.name ?? '—'}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Ngày khởi tạo</p>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Calendar className="h-3.5 w-3.5 text-muted shrink-0" />
              <span className="font-medium">
                {new Date(church.created_at).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
          <div className="col-span-2 space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Email kỹ thuật</p>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Mail className="h-3.5 w-3.5 text-muted shrink-0" />
              <span className="font-medium truncate">{church.admin?.email ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChurchesManagementPage() {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 300ms debounce
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(val);
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const { data: churches, isLoading } = useChurchesQuery(
    debouncedSearch ? { search: debouncedSearch } : undefined,
  );

  const onboardMutation = useOnboardChurchMutation();

  const handleCardClick = useCallback(
    (id: string) => {
      router.push(`/super-admin/dashboard/churches/${id}`);
    },
    [router],
  );

  const handleOnboardSuccess = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  const handleOnboardCancel = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  return (
    <div className="relative min-h-full">
      <div
        className={clsx(
          'space-y-8 transition-all duration-500',
          showOnboarding ? 'opacity-30 blur-sm pointer-events-none scale-[0.98]' : 'opacity-100',
        )}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Quản Trị Giáo Xứ</h1>
            <p className="text-muted mt-1 italic font-medium">
              Lưu trữ và quản lý quyền truy cập các thực thể tôn giáo.
            </p>
          </div>

          <button
            id="btn-onboard-church"
            onClick={() => setShowOnboarding(true)}
            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-0.5 active:translate-y-0 group min-h-[48px] w-full sm:w-auto"
          >
            <Plus className="h-5 w-5" />
            ONBOARD GIÁO XỨ MỚI
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {/* Search */}
          <div className="relative group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted transition-colors group-focus-within:text-primary" />
            <input
              id="church-search"
              type="text"
              placeholder="Tìm kiếm giáo xứ, schema..."
              value={inputValue}
              onChange={handleSearchChange}
              className="w-full bg-white border border-outline pl-12 pr-4 py-3 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:italic min-h-[48px]"
            />
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <ChurchCardSkeleton key={i} />
              ))}
            </div>
          ) : !churches || churches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <Church className="h-12 w-12 text-muted/40" />
              <p className="text-muted font-medium italic">Không tìm thấy giáo xứ nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {churches.map((church) => (
                <ChurchCard key={church.id} church={church} onClick={handleCardClick} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Onboarding Drawer */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={handleOnboardCancel}
          />
          <div className="relative w-full max-w-lg h-full">
            <ChurchOnboardingForm
              onSuccess={handleOnboardSuccess}
              onCancel={handleOnboardCancel}
              mutation={onboardMutation}
            />
          </div>
        </div>
      )}
    </div>
  );
}
