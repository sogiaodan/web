'use client';

export default function CatechismError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center p-16 bg-surface border border-outline rounded-sm mt-16">
          <p className="text-on-surface font-display font-semibold text-lg mb-2">
            Đã xảy ra lỗi
          </p>
          <p className="text-sm text-on-surface-variant font-body mb-6">
            Không thể tải danh sách chứng chỉ. Vui lòng thử lại.
          </p>
          <button
            type="button"
            onClick={reset}
            className="px-6 h-10 bg-primary text-white text-sm font-bold rounded-sm hover:bg-primary/90 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    </div>
  );
}
