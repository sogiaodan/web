import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
}

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div className={cn("relative flex h-10 w-10 items-center justify-center", className)}>
      {/* Outer spinning ring with gradient */}
      <div className="absolute h-full w-full animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      
      {/* Inner pulsing circle for "life" feeling */}
      <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
    </div>
  );
}
