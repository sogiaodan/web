"use client";

import { ParishGroupDetail } from '@/types/parish-group';
import { Calendar, Info, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Props {
  group: ParishGroupDetail;
}

export function GroupInfoCard({ group }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {/* Description Card */}
      <div className="bg-surface rounded-2xl border border-outline p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Info className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-bold text-on-surface uppercase tracking-wider text-xs">Mô tả & Sứ mạng</h3>
        </div>
        
        <div className="text-sm text-on-surface-variant leading-relaxed">
          {group.description || (
            <p className="italic text-on-surface-variant/60 bg-surface-variant/20 p-4 rounded-xl border border-dashed border-outline/50">
              Hội đoàn này chưa cập nhật nội dung mô tả hoặc sứ mạng hoạt động.
            </p>
          )}
        </div>
      </div>

      {/* Metadata Card */}
      <div className="bg-surface rounded-2xl border border-outline p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-secondary/10 rounded-lg">
            <Calendar className="w-4 h-4 text-secondary" />
          </div>
          <h3 className="font-bold text-on-surface uppercase tracking-wider text-xs">Thông tin hệ thống</h3>
        </div>

        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-surface-variant rounded-lg">
              <Clock className="w-4 h-4 text-on-surface-variant" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-0.5">Ngày tạo hồ sơ</p>
              <p className="text-sm font-medium text-on-surface">
                {formatDate(group.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-surface-variant rounded-lg">
              <Clock className="w-4 h-4 text-on-surface-variant" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-0.5">Cập nhật lần cuối</p>
              <p className="text-sm font-medium text-on-surface">
                {formatDate(group.updated_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
