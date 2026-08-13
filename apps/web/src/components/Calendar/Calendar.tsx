"use client";

import { cn } from "@afterglow/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import {
  addMonths,
  formatMonthTitle,
  getMonthMatrix,
  isInRange,
  isSameDay,
  nextRange,
  startOfMonth,
  WEEKDAYS_KO,
  type DateRange,
} from "./date-utils";

export interface CalendarProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  maxDaysFromStart?: number;
  startLabel?: string;
  defaultMonth?: Date;
  className?: string;
}

export const Calendar = ({
  value,
  onChange,
  maxDaysFromStart = 4,
  startLabel,
  defaultMonth,
  className,
}: CalendarProps) => {
  const [month, setMonth] = useState(() =>
    startOfMonth(defaultMonth ?? value.start ?? new Date()),
  );

  const weeks = getMonthMatrix(month.getFullYear(), month.getMonth());
  const hasRange = Boolean(value.start && value.end);

  return (
    <div className={cn("rounded-[20px] bg-surface p-5", className)}>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label="이전 달"
          onClick={() => setMonth((m) => addMonths(m, -1))}
          className="rounded-full p-1 text-text-secondary hover:bg-surface-muted hover:text-text focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:outline-none"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-heading-sm text-text">{formatMonthTitle(month)}</h2>
        <button
          type="button"
          aria-label="다음 달"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          className="rounded-full p-1 text-text-secondary hover:bg-surface-muted hover:text-text focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:outline-none"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7" aria-hidden="true">
        {WEEKDAYS_KO.map((weekday, i) => (
          <span
            key={weekday}
            className={cn(
              "py-2 text-center text-label-sm",
              i === 0
                ? "text-error-500"
                : i === 6
                  ? "text-primary"
                  : "text-text-secondary",
            )}
          >
            {weekday}
          </span>
        ))}
      </div>

      <div role="grid" aria-label="날짜 선택">
        {weeks.map((week, wi) => (
          <div key={wi} role="row" className="grid grid-cols-7">
            {week.map((day, di) =>
              day ? (
                <DayCell
                  key={day.getTime()}
                  day={day}
                  range={value}
                  hasRange={hasRange}
                  startLabel={startLabel}
                  onSelect={() =>
                    onChange(nextRange(value, day, maxDaysFromStart))
                  }
                />
              ) : (
                <div
                  key={`blank-${wi}-${di}`}
                  role="gridcell"
                  aria-hidden="true"
                  className="h-11"
                />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

interface DayCellProps {
  day: Date;
  range: DateRange;
  hasRange: boolean;
  startLabel?: string;
  onSelect: () => void;
}

const DayCell = ({
  day,
  range,
  hasRange,
  startLabel,
  onSelect,
}: DayCellProps) => {
  const isStart = Boolean(range.start && isSameDay(day, range.start));
  const isEnd = Boolean(range.end && isSameDay(day, range.end));
  const inMiddle = isInRange(day, range);
  const isEndpoint = isStart || isEnd;
  const weekday = day.getDay();

  const baseColor =
    weekday === 0
      ? "text-error-500"
      : weekday === 6
        ? "text-primary"
        : "text-text";

  const ariaLabel = `${day.getFullYear()}년 ${day.getMonth() + 1}월 ${day.getDate()}일 ${WEEKDAYS_KO[weekday]}요일${
    isStart && startLabel ? `, ${startLabel}` : ""
  }`;

  return (
    <div role="gridcell">
      <button
        type="button"
        onClick={onSelect}
        aria-label={ariaLabel}
        aria-pressed={isEndpoint || inMiddle}
        className="relative flex h-11 w-full items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:outline-none"
      >
        {hasRange && (inMiddle || isEndpoint) && (
          <span
            className={cn(
              "absolute inset-y-1 bg-primary-100",
              inMiddle && "inset-x-0",
              isStart && "right-0 left-1/2",
              isEnd && "right-1/2 left-0",
            )}
          />
        )}

        {isEndpoint ? (
          <span
            className={cn(
              "relative z-10 flex items-center justify-center rounded-full bg-primary-500 text-neutral-0",
              isStart && startLabel ? "h-11 w-9 flex-col gap-0.5" : "size-9",
            )}
          >
            <span className="text-body-sm leading-none">{day.getDate()}</span>
            {isStart && startLabel && (
              <span className="text-[9px] leading-none">{startLabel}</span>
            )}
          </span>
        ) : (
          <span
            className={cn(
              "relative z-10 text-body-md",
              inMiddle ? "text-primary-700" : baseColor,
            )}
          >
            {day.getDate()}
          </span>
        )}
      </button>
    </div>
  );
};
