import Link from 'next/link';
import ActivityRow, { ActivityLog } from './ActivityRow';
import { AlertCircle } from 'lucide-react';

interface ActivityFeedProps {
  activities?: ActivityLog[];
}

export default function ActivityFeed({ activities = [] }: ActivityFeedProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-sm border border-outline bg-surface w-full mt-6 h-auto">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-outline bg-vellum px-4 py-4 md:px-6 shrink-0">
        <h2 className="font-serif text-lg font-bold text-foreground">
          Hoạt động gần đây
        </h2>
        <Link 
          href="/dashboard/activities" 
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="flex-1 pb-2">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <ActivityRow key={activity.id} activity={activity} />
          ))
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center min-h-[240px]">
            <AlertCircle className="h-10 w-10 text-muted mb-3" aria-hidden="true" />
            <p className="text-sm text-muted">
              Chưa có hoạt động nào được ghi nhận.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
