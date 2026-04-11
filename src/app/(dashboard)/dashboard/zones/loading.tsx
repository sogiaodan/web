import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function LoadingZones() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-light">
      <div className="max-w-7xl mx-auto h-[70vh] flex flex-col items-center justify-center space-y-4">
        <LoadingSpinner className="h-8 w-8 text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse font-display">
          Đang tải dữ liệu giáo khu...
        </p>
      </div>
    </div>
  );
}
