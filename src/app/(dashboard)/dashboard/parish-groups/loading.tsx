export default function LoadingParishGroups() {
  return (
    <div className="space-y-6 md:space-y-8 animate-pulse">
      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-surface-container rounded-2xl" />
        ))}
      </div>
      
      {/* Filter Skeleton */}
      <div className="h-14 bg-surface-container rounded-xl w-full" />
      
      {/* Table Skeleton */}
      <div className="bg-surface rounded-2xl border border-outline-variant h-96 w-full" />
    </div>
  );
}
