import { type DateRange } from "@afterglow/utils";

import { StepPlaceholder } from "./StepPlaceholder";

export interface ScheduleStepProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

/** 여행 일정(기간) 선택. PR 11에서 Calendar 연동으로 구현. */
export function ScheduleStep(_props: ScheduleStepProps) {
  return <StepPlaceholder label="여행 일정 선택" />;
}
