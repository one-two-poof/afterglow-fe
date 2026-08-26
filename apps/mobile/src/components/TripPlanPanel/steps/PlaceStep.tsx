import { type Place } from "@/types/place";

import { StepPlaceholder } from "./StepPlaceholder";

export interface PlaceStepProps {
  days: Date[];
  selected: (Place | null)[];
  onSelect: (dayIndex: number, place: Place | null) => void;
}

/** 일자별 관광지(숙소) 선택. PR 12에서 PlaceCard 연동으로 구현. */
export function PlaceStep(_props: PlaceStepProps) {
  return <StepPlaceholder label="관광지 선택" />;
}
