"use client";

import { useParishGroupsQuery } from '../queries/useParishGroupQueries';
import { useAuth } from '@/components/providers/auth-provider';
import { useState, useCallback, useMemo } from 'react';
import LoadingParishGroups from '../loading';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { ParishGroupSummaryCards } from './ParishGroupSummaryCards';
import { ParishGroupFilterBar } from './ParishGroupFilterBar';
import { ParishGroupTable } from './ParishGroupTable';

export function ParishGroupListClient() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const queryParams = useMemo(() => {
    const params: Record<string, string> = { page: String(page), limit: String(limit) };
    if (search) params.search = search;
    if (category) params.category = category;
    return params;
  }, [page, limit, search, category]);

  const { data: listData, isLoading: isLoadingList } = useParishGroupsQuery(queryParams);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1); // reset to page 1
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setCategory(value);
    setPage(1);
  }, []);

  if (isLoadingList) {
    return <LoadingParishGroups />;
  }

  const items = listData?.items || [];
  const stats = listData?.stats;
  const pagination = listData?.pagination;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-display font-bold text-on-surface mb-2">Hội đoàn</h2>
          <p className="text-on-surface-variant font-body">Quản lý thông tin và thành viên các hội đoàn trong giáo xứ</p>
        </div>

        {canEdit && (
          <Link
            href="/dashboard/parish-groups/create"
            className="flex items-center justify-center gap-2 bg-primary text-white px-6 h-12 rounded-sm font-bold text-sm hover:bg-primary/90 transition-all shadow-sm shrink-0"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Tạo hội đoàn mới</span>
          </Link>
        )}
      </div>

      <ParishGroupFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        category={category}
        onCategoryChange={handleCategoryChange}
        canEdit={canEdit}
      />

      {items.length > 0 ? (
        <ParishGroupTable items={items} pagination={pagination} onPageChange={setPage} />
      ) : (
        <div className="bg-surface rounded border border-outline p-12 text-center text-on-surface-variant flex flex-col items-center gap-4">
          <p>Không tìm thấy hội đoàn nào.</p>
          {canEdit && (
            <Link
              href="/dashboard/parish-groups/create"
              className="text-primary hover:underline font-bold"
            >
              Tạo hội đoàn đầu tiên của giáo xứ
            </Link>
          )}
        </div>
      )}

      {stats && (
        <ParishGroupSummaryCards
          totalGroups={stats.total_groups}
          totalMembers={stats.total_members}
        />
      )}
    </div>
  );
}
