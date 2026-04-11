'use client';

// ─── Pagination Controls ──────────────────────────────────────────────────────

export function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const btnBase =
    'w-9 h-9 flex items-center justify-center rounded border text-xs font-medium transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-30 disabled:pointer-events-none';

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={`${btnBase} border-outline bg-surface hover:bg-surface-hover text-on-surface`}
      >
        <span className="material-symbols-outlined text-lg">chevron_left</span>
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="w-9 flex justify-center text-xs text-on-surface-variant">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`${btnBase} ${
              p === page
                ? 'border-primary bg-primary text-white'
                : 'border-outline bg-surface hover:bg-surface-hover text-on-surface'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={`${btnBase} border-outline bg-surface hover:bg-surface-hover text-on-surface`}
      >
        <span className="material-symbols-outlined text-lg">chevron_right</span>
      </button>
    </div>
  );
}
