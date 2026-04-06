"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  PrefixIcon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, type = "text", label, error, helperText, PrefixIcon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;
    const isError = Boolean(error);

    return (
      <div className={cn("flex flex-col space-y-1.5", className)}>
        <label
          htmlFor={props.id || props.name}
          className="font-sans text-[14px] font-medium uppercase tracking-[0.05em] text-foreground"
        >
          {label}
        </label>
        <div className="relative flex w-full flex-col">
          {PrefixIcon && (
             <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center text-outline-variant">
               <PrefixIcon className="h-5 w-5" aria-hidden="true" />
             </div>
          )}
          <input
            {...props}
            ref={ref}
            type={inputType}
            className={cn(
              "flex w-full items-center font-sans h-12 rounded-[2px] border bg-vellum px-3 text-[16px] text-foreground outline-none transition-all duration-200 ease-in-out placeholder:text-outline-variant hover:bg-surface-container-low focus-visible:ring-2 focus-visible:border-transparent",
              PrefixIcon && "pl-10",
              isPassword && "pr-10",
              isError
                ? "border-primary focus-visible:ring-primary"
                : "border-outline-variant focus-visible:ring-outline-variant"
            )}
            aria-invalid={isError ? "true" : "false"}
          />
          {isPassword && (
            <button
              type="button"
              className="absolute right-0 top-0 flex h-full items-center justify-center px-3 text-outline-variant transition-colors hover:text-primary focus:outline-none"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Eye className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
        {isError ? (
          <p className="mt-1 font-sans text-[12px] font-medium text-primary">
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-1 font-sans text-[11px] text-muted-foreground italic">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
