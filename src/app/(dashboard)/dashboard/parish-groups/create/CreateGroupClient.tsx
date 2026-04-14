"use client";

import { CreateEditGroupForm } from '../components/CreateEditGroupForm';

export default function CreateGroupClient() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-on-surface mb-2">
          Tạo hội đoàn mới
        </h1>
        <p className="text-on-surface-variant font-body text-sm">
          Thêm một hội đoàn mới vào danh sách quản lý của giáo xứ.
        </p>
      </div>

      <CreateEditGroupForm isEdit={false} />
    </div>
  );
}
