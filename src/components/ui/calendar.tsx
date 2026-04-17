"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { vi } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

// Override month names: "Tháng 01" ... "Tháng 12" instead of spelled-out Vietnamese
const MONTHS = [
  'Tháng 01', 'Tháng 02', 'Tháng 03', 'Tháng 04',
  'Tháng 05', 'Tháng 06', 'Tháng 07', 'Tháng 08',
  'Tháng 09', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

const customViLocale = {
  ...vi,
  localize: {
    ...vi.localize,
    month: (index: number) => MONTHS[index] ?? MONTHS[0],
  },
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={customViLocale as Parameters<typeof DayPicker>[0]['locale']}
      showOutsideDays={showOutsideDays}
      className={cn("p-3 font-body", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium hidden",
        dropdowns: "flex gap-1 items-center justify-center",
        dropdown: "relative",
        months_dropdown: "appearance-none bg-surface border border-outline rounded px-2 py-1 text-sm font-medium cursor-pointer hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-primary pr-6",
        years_dropdown: "appearance-none bg-surface border border-outline rounded px-2 py-1 text-sm font-medium cursor-pointer hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-primary pr-6",
        nav: "space-x-1 flex items-center",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-primary/10 [&:has([aria-selected])]:rounded-md",
        // Key fix: remove text-on-surface so the `selected` class can control text color
        day_button: cn(
          "inline-flex items-center justify-center rounded-sm text-sm transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          "disabled:pointer-events-none disabled:opacity-50",
          "hover:bg-surface-hover",
          "h-8 w-8 p-0 font-normal"
        ),
        selected: "!bg-primary !text-white hover:!bg-primary hover:!text-white rounded-md",
        today: "bg-surface-container font-bold rounded-md",
        outside: "opacity-40",
        disabled: "opacity-30 pointer-events-none",
        range_middle: "bg-primary/10 rounded-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: (props) => {
          if (props.orientation === "left") return <ChevronLeft className="h-4 w-4" />
          return <ChevronRight className="h-4 w-4" />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
