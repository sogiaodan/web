"use client";

import { forwardRef } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  icon?: boolean;
}

export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ className, children, isLoading, icon = true, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(
          "group inline-flex h-12 w-full items-center justify-center gap-2 rounded-[2px] bg-primary px-8 font-sans text-[14px] font-bold tracking-[0.05em] text-vellum outline-none transition-all duration-200 ease-in-out hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-vellum disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-vellum" aria-hidden="true" />
        ) : (
          <>
            {children}
            {icon && (
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 ease-in-out group-hover:translate-x-1"
                aria-hidden="true"
              />
            )}
          </>
        )}
      </button>
    );
  }
);

PrimaryButton.displayName = "PrimaryButton";
