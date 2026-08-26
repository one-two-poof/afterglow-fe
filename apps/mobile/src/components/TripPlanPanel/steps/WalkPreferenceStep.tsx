import { StepPlaceholder } from "./StepPlaceholder";

export interface WalkPreferenceStepProps {
  value: number | null;
  onChange: (value: number) => void;
}

/** 도보 선호도(1~5) 선택. PR 12에서 구현. */
export function WalkPreferenceStep(_props: WalkPreferenceStepProps) {
  return <StepPlaceholder label="도보 선호도 선택" />;
}
