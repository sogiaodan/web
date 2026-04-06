'use client';

interface BookInfoFieldsProps {
  bookNo: string;
  onBookNoChange: (val: string) => void;
  pageNo: string;
  onPageNoChange: (val: string) => void;
  registryNumber: string;
  onRegistryNumberChange: (val: string) => void;
  errors?: {
    bookNo?: string;
    pageNo?: string;
    registryNumber?: string;
  };
  disabled?: boolean;
}

export function BookInfoFields({
  bookNo,
  onBookNoChange,
  pageNo,
  onPageNoChange,
  registryNumber,
  onRegistryNumberChange,
  errors = {},
  disabled = false,
}: BookInfoFieldsProps) {
  return (
    <div className="bg-surface-container rounded-sm border border-outline p-5 mt-6">
      <h3 className="font-display font-bold text-sm text-on-surface mb-4 pb-2 border-b border-outline">
        Thông tin Sổ lưu trữ
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
            Số Sổ / Cuốn
          </label>
          <input
            type="text"
            value={bookNo}
            onChange={(e) => onBookNoChange(e.target.value)}
            disabled={disabled}
            placeholder="VD: II, 2..."
            className={`w-full bg-surface border rounded-sm px-3 py-2.5 text-sm font-body focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${
              errors.bookNo ? 'border-red-500' : 'border-outline text-on-surface'
            } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
          />
          {errors.bookNo && <p className="mt-1 text-[10px] text-red-500">{errors.bookNo}</p>}
        </div>
        <div>
          <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
            Số Trang
          </label>
          <input
            type="text"
            value={pageNo}
            onChange={(e) => onPageNoChange(e.target.value)}
            disabled={disabled}
            placeholder="VD: 15, 30..."
            className={`w-full bg-surface border rounded-sm px-3 py-2.5 text-sm font-body focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${
              errors.pageNo ? 'border-red-500' : 'border-outline text-on-surface'
            } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
          />
          {errors.pageNo && <p className="mt-1 text-[10px] text-red-500">{errors.pageNo}</p>}
        </div>
        <div>
          <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
            Số Thứ Tự (STT)
          </label>
          <input
            type="text"
            value={registryNumber}
            onChange={(e) => onRegistryNumberChange(e.target.value)}
            disabled={disabled}
            placeholder="VD: 102, 345..."
            className={`w-full bg-surface border rounded-sm px-3 py-2.5 text-sm font-body focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${
              errors.registryNumber ? 'border-red-500' : 'border-outline text-on-surface'
            } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
          />
          {errors.registryNumber && <p className="mt-1 text-[10px] text-red-500">{errors.registryNumber}</p>}
        </div>
      </div>
    </div>
  );
}
