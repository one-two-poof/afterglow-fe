import { StepPlaceholder } from "./StepPlaceholder";

export interface TreatmentStepProps {
  selected: string[];
  onToggle: (name: string) => void;
}

/** 시술 종류 선택. PR 11에서 구현. */
export function TreatmentStep(_props: TreatmentStepProps) {
  return <StepPlaceholder label="시술 종류 선택" />;
}
