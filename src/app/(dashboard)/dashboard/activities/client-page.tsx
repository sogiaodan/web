'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { RefreshCcw, Search, FilterX } from 'lucide-react';
import { ActivityLog } from '@/components/dashboard/ActivityRow';
import ActivityRow from '@/components/dashboard/ActivityRow';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { ApiResponse } from '@/lib/auth-api';

interface ActivitiesResponse {
  items: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => r.json())
    .then((res: ApiResponse<ActivitiesResponse>) => {
      if (res.status !== 200) throw new Error(res.message || 'Lỗi lấy dữ liệu');
      return res.data;
    });

export default function ActivitiesPage() {
  const [page, setPage] = useState(1);
  const limit = 20;
  
  const [actionType, setActionType] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const buildQuery = () => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    
    if (actionType) params.set('action_type', actionType);
    if (userId) params.set('user_id', userId);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    
    return params.toString();
  };

  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/dashboard/activities?${buildQuery()}`,
    fetcher,
    { keepPreviousData: true }
  );

  // Fetch users for the filter dropdown
  const { data: usersData } = useSWR(
    '/api/v1/settings/accounts',
    (url: string) => fetch(url).then(r => r.json()).then(res => res.data?.items || [])
  );

  const resetFilters = useCallback(() => {
    setActionType('');
    setUserId('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  }, []);

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 rounded-full bg-red-50 p-4">
          <RefreshCcw className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="mb-2 font-serif text-xl font-bold text-foreground">
          Không thể tải dữ liệu
        </h2>
        <p className="mb-6 max-w-md text-sm text-muted">
          Đã xảy ra lỗi trong quá trình lấy thông tin hoạt động. Vui lòng thử lại sau.
        </p>
        <button
          onClick={() => mutate()}
          className="inline-flex min-h-[44px] items-center justify-center rounded-sm bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Tất cả hoạt động</h1>
          <p className="mt-1 text-sm text-muted">Xem và theo dõi toàn bộ lịch sử thao tác hệ thống.</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-sm border border-outline bg-surface p-4 shadow-sm">
        <div className="w-full sm:w-auto flex-1 min-w-[180px]">
          <label className="mb-1 block text-xs font-medium text-foreground">Loại hoạt động</label>
          <select
            className="w-full rounded-sm border border-outline bg-surface p-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-[42px]"
            value={actionType}
            onChange={(e) => {
              setActionType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả hoạt động</option>
            <option value="CREATE">Tạo mới</option>
            <option value="UPDATE">Cập nhật</option>
            <option value="DELETE">Xóa</option>
            <option value="SPLIT_HOUSEHOLD">Tách hộ</option>
            <option value="BATCH_CREATE">Tạo hàng loạt</option>
          </select>
        </div>

        <div className="w-full sm:w-auto flex-1 min-w-[180px]">
          <label className="mb-1 block text-xs font-medium text-foreground">Người thực hiện</label>
          <select
            className="w-full rounded-sm border border-outline bg-surface p-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-[42px]"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả người dùng</option>
            {usersData?.map((user: any) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-auto flex-1 md:max-w-[170px]">
          <label className="mb-1 block text-xs font-medium text-foreground">Từ ngày</label>
          <input
            type="date"
            className="w-full rounded-sm border border-outline bg-surface p-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-[42px]"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="w-full sm:w-auto flex-1 md:max-w-[200px]">
          <label className="mb-1 block text-xs font-medium text-foreground">Đến ngày</label>
          <input
            type="date"
            className="w-full rounded-sm border border-outline bg-surface p-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-[42px]"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="w-full sm:w-auto flex-1 md:max-w-[120px] shrink-0">
          <label className="mb-1 block text-xs font-medium opacity-0 select-none">Bỏ lọc</label>
          <button
            onClick={resetFilters}
            className="flex h-[42px] w-full items-center justify-center gap-2 rounded-sm border border-outline bg-surface px-4 text-sm font-medium text-muted hover:bg-surface-hover hover:text-foreground md:w-auto transition-colors"
          >
            <FilterX className="h-4 w-4" />
            <span className="md:hidden lg:inline">Xóa</span>
          </button>
        </div>
      </div>

      <div className="rounded-sm border border-outline bg-surface shadow-sm">
        {isLoading && !data ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : data?.items.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <Search className="mb-3 h-10 w-10 text-muted" />
            <p className="text-sm font-medium text-foreground">Không tìm thấy hoạt động nào</p>
            <p className="text-xs text-muted">Thử thay đổi bộ lọc hoặc dọn dẹp điều kiện tìm kiếm.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {data?.items.map((activity) => (
              <ActivityRow key={activity.id} activity={activity} />
            ))}
          </div>
        )}

        {data && data.pagination.total_pages > 1 && (
          <div className="border-t border-outline p-4 flex items-center justify-between bg-vellum rounded-b-sm">
            <div className="text-xs text-muted">
              Đang xem {(page - 1) * limit + 1} - {Math.min(page * limit, data.pagination.total)} trong tổng số {data.pagination.total} hoạt động
            </div>
            <PaginationControls
              page={page}
              totalPages={data.pagination.total_pages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
