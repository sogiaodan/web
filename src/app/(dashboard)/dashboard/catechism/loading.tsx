export default function CatechismLoading() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light animate-pulse">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-surface-container rounded w-56 mb-2" />
          <div className="h-4 bg-surface-container rounded w-80" />
        </div>

        {/* Tab skeleton */}
        <div className="border-b border-outline mb-6 flex gap-4 pb-0">
          <div className="h-10 bg-surface-container rounded w-44" />
          <div className="h-10 bg-surface-container rounded w-36" />
        </div>

        {/* Filter bar skeleton */}
        <div className="flex justify-end gap-2 mb-4">
          <div className="h-9 bg-surface-container rounded w-64" />
          <div className="h-9 bg-surface-container rounded w-16" />
          <div className="h-9 bg-surface-container rounded w-20" />
        </div>

        {/* Table skeleton — desktop */}
        <div className="hidden md:block border border-outline rounded-sm overflow-hidden">
          <div className="bg-surface-container h-10 border-b border-outline" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-4 border-b border-outline last:border-0 bg-surface"
            >
              <div className="h-4 bg-surface-container rounded w-6 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 bg-surface-container rounded w-40" />
                <div className="h-3 bg-surface-container rounded w-24 opacity-60" />
              </div>
              <div className="h-4 bg-surface-container rounded w-20" />
              <div className="h-5 bg-surface-container rounded-full w-24" />
              <div className="h-4 bg-surface-container rounded w-20" />
              <div className="h-4 bg-surface-container rounded w-28" />
              <div className="h-4 bg-surface-container rounded w-20" />
              <div className="h-6 w-6 bg-surface-container rounded" />
            </div>
          ))}
        </div>

        {/* Card skeleton — mobile */}
        <div className="md:hidden space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface border border-outline rounded-sm p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 space-y-1.5">
                  <div className="h-5 bg-surface-container rounded w-40" />
                  <div className="h-3 bg-surface-container rounded w-28 opacity-60" />
                </div>
                <div className="h-8 w-8 bg-surface-container rounded" />
              </div>
              <div className="flex gap-2 mb-3">
                <div className="h-5 bg-surface-container rounded-full w-24" />
                <div className="h-5 bg-surface-container rounded w-20" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-outline/50">
                <div className="h-4 bg-surface-container rounded w-28" />
                <div className="h-4 bg-surface-container rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
