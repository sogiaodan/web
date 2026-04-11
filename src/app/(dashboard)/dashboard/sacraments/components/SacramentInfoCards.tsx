import { ClipboardList, FileCheck2, Printer } from 'lucide-react';

export function SacramentInfoCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      <div className="bg-surface border border-outline p-5 rounded-sm flex items-start gap-4">
        <div className="bg-surface-hover p-2.5 rounded text-primary shrink-0">
          <ClipboardList className="h-6 w-6" />
        </div>
        <div>
          <h4 className="font-display font-bold text-on-surface text-base mb-1">
            Quy tắc ghi sổ
          </h4>
          <p className="text-sm font-body text-on-surface-variant leading-relaxed">
            Sử dụng chữ có dấu, trình bày rõ ràng theo mẫu quy định của Giáo phận.
          </p>
        </div>
      </div>

      <div className="bg-surface border border-outline p-5 rounded-sm flex items-start gap-4">
        <div className="bg-amber-50 p-2.5 rounded text-amber-600 shrink-0">
          <FileCheck2 className="h-6 w-6" />
        </div>
        <div>
          <h4 className="font-display font-bold text-on-surface text-base mb-1">
            Xác minh dữ liệu
          </h4>
          <p className="text-sm font-body text-on-surface-variant leading-relaxed">
            Thông tin sẽ tự động đối chiếu với Cơ sở dữ liệu quốc gia về Giáo dân.
          </p>
        </div>
      </div>

      <div className="bg-surface border border-outline p-5 rounded-sm flex items-start gap-4">
        <div className="bg-green-50 p-2.5 rounded text-green-600 shrink-0">
          <Printer className="h-6 w-6" />
        </div>
        <div>
          <h4 className="font-display font-bold text-on-surface text-base mb-1">
            In Chứng chỉ
          </h4>
          <p className="text-sm font-body text-on-surface-variant leading-relaxed">
            Có thể xuất file PDF và in chứng chỉ ngay sau khi lưu bản ghi thành công.
          </p>
        </div>
      </div>
    </div>
  );
}
