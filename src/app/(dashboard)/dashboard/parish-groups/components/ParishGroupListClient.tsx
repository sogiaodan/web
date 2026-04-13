"use client";

import { useParishGroupsQuery, useParishGroupCategoriesQuery } from '../queries/useParishGroupQueries';
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
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const queryParams = useMemo(() => {
    const params: Record<string, string> = { page: String(page), limit: String(limit) };
    if (search) params.search = search;
    if (categoryId) params.category_id = categoryId;
    return params;
  }, [page, limit, search, categoryId]);

  const { data: listData, isLoading: isLoadingList } = useParishGroupsQuery(queryParams);
  const { data: categories } = useParishGroupCategoriesQuery();

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1); // reset to page 1
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setCategoryId(value);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {stats && (
          <ParishGroupSummaryCards
            totalGroups={stats.total_groups}
            totalMembers={stats.total_members}
            totalCategories={stats.total_categories}
          />
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="w-full md:flex-1">
          <ParishGroupFilterBar
            search={search}
            onSearchChange={handleSearchChange}
            categoryId={categoryId}
            onCategoryChange={handleCategoryChange}
            categories={categories || []}
            canEdit={canEdit}
          />
        </div>
        {canEdit && (
          <Link
            href="/dashboard/parish-groups/create"
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary px-6 h-12 w-full md:w-auto rounded-full font-bold shadow-md hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Tạo hội đoàn</span>
          </Link>
        )}
      </div>

      {items.length > 0 ? (
        <ParishGroupTable items={items} pagination={pagination} onPageChange={setPage} />
      ) : (
        <div className="bg-surface rounded-2xl border border-outline p-12 text-center text-on-surface-variant flex flex-col items-center gap-4">
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
    </div>
  );
}
