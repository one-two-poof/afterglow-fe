"use client";

import { cn } from "@afterglow/utils";

import { formatISODate, WEEKDAYS_KO } from "@/components/Calendar";

export interface TreatmentDateStepProps {
  /** 선택된 시술 종류 */
  treatments: string[];
  /** 여행 일자 목록(순서대로) */
  days: Date[];
  /** 시술 → 선택 날짜("YYYY-MM-DD") 매핑 */
  value: Record<string, string>;
  onAssign: (treatment: string, date: string) => void;
}

/** 선택한 시술별로 받을 날짜(Day)를 매칭 */
export const TreatmentDateStep = ({
  treatments,
  days,
  value,
  onAssign,
}: TreatmentDateStepProps) => (
  <div className="flex flex-col gap-3 pt-2">
    <p className="text-body-sm text-text-secondary">
      각 시술을 받을 날짜를 선택해주세요
    </p>

    {treatments.map((treatment) => (
      <div
        key={treatment}
        className="flex flex-col gap-3 rounded-[16px] bg-surface p-4 shadow-sm"
      >
        <p className="text-label-lg text-text">{treatment}</p>
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
          }}
        >
          {days.map((day, i) => {
            const iso = formatISODate(day);
            const active = value[treatment] === iso;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => onAssign(treatment, iso)}
                aria-pressed={active}
                aria-label={`${treatment} ${i + 1}일차 ${day.getMonth() + 1}월 ${day.getDate()}일`}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-[12px] border-2 py-3 text-center transition-colors focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:outline-none",
                  active
                    ? "border-primary bg-primary-100 text-primary-700"
                    : "border-border bg-bg text-text-secondary hover:border-primary",
                )}
              >
                <span className="text-label-md">Day {i + 1}</span>
                <span className="text-caption">
                  {day.getMonth() + 1}/{day.getDate()} (
                  {WEEKDAYS_KO[day.getDay()]})
                </span>
              </button>
            );
          })}
        </div>
      </div>
    ))}
  </div>
);
