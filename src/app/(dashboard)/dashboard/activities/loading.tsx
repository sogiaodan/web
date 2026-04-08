import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ActivitiesLoading() {
  return (
    <div className="flex h-[calc(100vh-100px)] w-full flex-col items-center justify-center space-y-4">
      <LoadingSpinner className="h-10 w-10 text-primary" />
      <p className="text-sm font-medium text-muted">Đang tải lịch sử hoạt động...</p>
    </div>
  );
}
