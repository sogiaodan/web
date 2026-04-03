import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number | string;
  href: string;
  icon: LucideIcon;
}

export default function MetricCard({ label, value, href, icon: Icon }: MetricCardProps) {
  const formattedValue = typeof value === 'number' ? value.toLocaleString('vi-VN') : value;

  return (
    <Link
      href={href}
      className="group relative flex flex-col justify-between overflow-hidden rounded-sm border border-outline bg-surface p-6 shadow-sm transition-all duration-150 hover:border-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-32 min-w-48"
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-[12px] font-medium uppercase tracking-wider text-muted">
            {label}
          </span>
          <span className="mt-2 font-serif text-[40px] leading-tight font-bold text-foreground">
            {formattedValue}
          </span>
        </div>
        <div className="shrink-0 p-1">
          <Icon className="h-6 w-6 text-primary/60" aria-hidden="true" />
        </div>
      </div>
      
      {/* Decorative Element */}
      <div className="corner-accent-lg transition-transform duration-150 group-hover:scale-110" />
    </Link>
  );
}
