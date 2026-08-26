import { StepPlaceholder } from "./StepPlaceholder";

export interface TreatmentDateStepProps {
  treatments: string[];
  days: Date[];
  value: Record<string, string>;
  onAssign: (name: string, date: string) => void;
}

/** 시술별 날짜 매칭. PR 11에서 구현. */
export function TreatmentDateStep(_props: TreatmentDateStepProps) {
  return <StepPlaceholder label="시술 날짜 선택" />;
}
