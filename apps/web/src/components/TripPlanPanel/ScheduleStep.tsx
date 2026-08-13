import { Lightbulb } from "lucide-react";

import { Calendar, TripSummaryCard, type DateRange } from "@/components/Calendar";

export interface ScheduleStepProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

/** 1단계: 여행 일정(시술일 포함 최대 4일) 선택 */
export const ScheduleStep = ({ value, onChange }: ScheduleStepProps) => (
  <div className="flex flex-col gap-3 pt-2">
    <div className="flex items-start gap-2 rounded-[12px] bg-surface-accent px-4 py-3">
      <Lightbulb
        size={18}
        className="mt-0.5 shrink-0 text-primary"
        aria-hidden="true"
      />
      <p className="text-body-sm text-text-secondary">
        시술 당일 또는 직후 가벼운 휴식을 포함한 최적의 맞춤형 관광 코스를
        추천해드립니다.
      </p>
    </div>

    <TripSummaryCard range={value} />
    <Calendar value={value} onChange={onChange} startLabel="시작일" />
  </div>
);
