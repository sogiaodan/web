'use client';

import * as React from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { FieldLabel, FieldError } from './FormPrimitives';

interface DatePickerProps {
  label?: string;
  value: string | undefined; // YYYY-MM-DD
  onChange: (value: string) => void; // YYYY-MM-DD
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  /** ISO date string "YYYY-MM-DD". Days after this date will be disabled. */
  max?: string;
}

export function DatePicker({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  className,
  max,
}: DatePickerProps) {
  // Parse incoming YYYY-MM-DD string → Date object
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : undefined;
  }, [value]);

  // Build a Date representing end-of-day for `max` so the max day itself is selectable
  const maxDate = React.useMemo(() => {
    if (!max) return undefined;
    const parsed = parseISO(max);
    if (!isValid(parsed)) return undefined;
    const d = new Date(parsed);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [max]);

  const isDateDisabled = React.useCallback(
    (day: Date) => {
      if (maxDate) return day > maxDate;
      return false;
    },
    [maxDate]
  );

  const handleSelect = (day: Date | undefined) => {
    if (day) {
      onChange(format(day, 'yyyy-MM-dd'));
    } else {
      onChange('');
    }
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal bg-surface h-11',
              error && 'border-red-500 focus-visible:ring-red-500',
              !selectedDate && 'text-[#A8A29E]',
              disabled && 'opacity-70 bg-surface-container'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate
              ? format(selectedDate, 'dd/MM/yyyy', { locale: vi })
              : <span>dd/mm/yyyy</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[100]" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={isDateDisabled}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error && <FieldError message={error} />}
    </div>
  );
}
