import {
  UserPlus,
  Home,
  Droplet,
  Edit,
  Trash2,
  Users,
  Split,
  Clock,
  LucideIcon
} from 'lucide-react';
import clsx from 'clsx';

export interface ActivityLog {
  id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  description: string;
  user_name: string;
  created_at: string;
}

const getIconConfig = (actionType: string, entityType: string): { Icon: LucideIcon, bg: string, color: string } => {
  if (actionType === 'CREATE' && entityType === 'PARISHIONER') return { Icon: UserPlus, bg: 'bg-primary/10', color: 'text-primary' };
  if (actionType === 'CREATE' && entityType === 'HOUSEHOLD') return { Icon: Home, bg: 'bg-primary/10', color: 'text-primary' };
  if (actionType === 'CREATE' && entityType === 'SACRAMENT') return { Icon: Droplet, bg: 'bg-primary/10', color: 'text-primary' };
  if (actionType === 'UPDATE') return { Icon: Edit, bg: 'bg-blue-50', color: 'text-blue-700' };
  if (actionType === 'DELETE') return { Icon: Trash2, bg: 'bg-red-50', color: 'text-red-700' };
  if (actionType === 'BATCH_CREATE') return { Icon: Users, bg: 'bg-green-50', color: 'text-green-800' };
  if (actionType === 'SPLIT_HOUSEHOLD') return { Icon: Split, bg: 'bg-amber-50', color: 'text-amber-700' };
  
  return { Icon: Edit, bg: 'bg-surface-container', color: 'text-muted' };
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) {
    // Check if it's strictly yesterday (calendar day) or just < 24h
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear()) {
      return `Hôm qua, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    return `${diffHours} giờ trước`;
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear()) {
    return `Hôm qua, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

const formatDescription = (desc: string) => {
  // Convert markdown bold **Text** to <strong>Text</strong>
  const parts = desc.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

export default function ActivityRow({ activity }: { activity: ActivityLog }) {
  const { Icon, bg, color } = getIconConfig(activity.action_type, activity.entity_type);

  return (
    <div className="flex items-start gap-x-4 border-b border-outline p-4 transition-colors hover:bg-hover-bg md:px-6 last:border-b-0 min-w-full">
      <div className={clsx("flex mt-0.5 h-8 w-8 shrink-0 items-center justify-center rounded-sm", bg, color)}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-sm font-medium text-foreground">
          {formatDescription(activity.description)}
        </p>
        <div className="flex items-center gap-1 text-xs text-muted">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{formatRelativeTime(activity.created_at)}</span>
          <span className="mx-1">•</span>
          <span>{activity.user_name || 'Người dùng đã xóa'}</span>
        </div>
      </div>
    </div>
  );
}
