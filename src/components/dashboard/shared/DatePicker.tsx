'use client';

import * as React from 'react';
import { format, parse, parseISO, isValid } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { FieldLabel, FieldError } from './FormPrimitives';

interface DatePickerProps {
  label?: string;
  value: string | undefined; // YYYY-MM-DD (ISO)
  onChange: (value: string) => void;
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
  const [open, setOpen] = React.useState(false);
  const [inputText, setInputText] = React.useState('');
  const [inputError, setInputError] = React.useState('');

  // Parse the ISO value → Date object
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : undefined;
  }, [value]);

  // Build maxDate at end-of-day so the max day itself is selectable
  const maxDate = React.useMemo(() => {
    if (!max) return undefined;
    const parsed = parseISO(max);
    if (!isValid(parsed)) return undefined;
    const d = new Date(parsed);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [max]);

  // Keep inputText in sync with external value changes (e.g. from calendar click)
  React.useEffect(() => {
    if (selectedDate) {
      setInputText(format(selectedDate, 'dd/MM/yyyy'));
      setInputError('');
    } else if (!value) {
      setInputText('');
      setInputError('');
    }
  }, [selectedDate, value]);

  const isDateDisabled = React.useCallback(
    (day: Date) => {
      if (maxDate) return day > maxDate;
      return false;
    },
    [maxDate]
  );

  // Auto-format dd/mm/yyyy as user types (auto-insert slashes)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, ''); // digits only
    if (raw.length > 8) raw = raw.slice(0, 8);

    let formatted = raw;
    if (raw.length > 4) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`;
    } else if (raw.length > 2) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }

    setInputText(formatted);
    setInputError('');

    // Once we have a full date (10 chars), parse and validate immediately
    if (formatted.length === 10) {
      validateAndCommit(formatted);
    } else {
      // Clear value if input is being cleared
      if (raw.length === 0) onChange('');
    }
  };

  const validateAndCommit = (text: string) => {
    if (!text || text.length < 10) {
      if (!text) onChange('');
      return;
    }

    const parsed = parse(text, 'dd/MM/yyyy', new Date());

    if (!isValid(parsed)) {
      setInputError('Ngày không hợp lệ (dd/mm/yyyy)');
      return;
    }

    if (maxDate && parsed > maxDate) {
      setInputError('Ngày không được ở tương lai');
      return;
    }

    // Valid — commit as ISO
    setInputError('');
    onChange(format(parsed, 'yyyy-MM-dd'));
  };

  const handleBlur = () => {
    if (inputText && inputText.length < 10) {
      setInputError('Ngày chưa đầy đủ (dd/mm/yyyy)');
    } else if (!inputText) {
      setInputError('');
      onChange('');
    }
  };

  const handleCalendarSelect = (day: Date | undefined) => {
    if (day) {
      onChange(format(day, 'yyyy-MM-dd'));
      setInputError('');
    }
    setOpen(false);
  };

  const hasError = !!error || !!inputError;
  const displayError = inputError || error;

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <FieldLabel required={required}>{label}</FieldLabel>}

      {/* Input row: text field + calendar icon trigger */}
      <div className={cn(
        'flex items-center h-11 rounded border bg-surface transition-all',
        hasError
          ? 'border-red-500 focus-within:ring-1 focus-within:ring-red-500'
          : 'border-outline focus-within:border-primary focus-within:ring-1 focus-within:ring-primary',
        disabled && 'opacity-70 bg-surface-container pointer-events-none'
      )}>
        {/* Text input */}
        <input
          type="text"
          inputMode="numeric"
          value={inputText}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder="dd/mm/yyyy"
          maxLength={10}
          className="flex-1 h-full px-3 text-sm bg-transparent outline-none text-on-surface placeholder:text-on-surface-variant/60 font-body"
        />

        {/* Calendar popover trigger */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                'h-full px-3 border-l border-outline text-on-surface-variant',
                'hover:text-primary hover:bg-primary/5 transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
                'rounded-r'
              )}
              aria-label="Mở lịch chọn ngày"
            >
              <CalendarIcon className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-[100]" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleCalendarSelect}
              disabled={isDateDisabled}
              defaultMonth={selectedDate ?? (maxDate ? new Date(maxDate.getFullYear(), maxDate.getMonth()) : undefined)}
              captionLayout="dropdown"
              startMonth={new Date(1900, 0)}
              endMonth={maxDate ?? new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {displayError && <FieldError message={displayError} />}
    </div>
  );
}
