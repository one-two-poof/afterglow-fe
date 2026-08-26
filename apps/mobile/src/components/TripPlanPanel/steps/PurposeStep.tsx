import { StepPlaceholder } from "./StepPlaceholder";

export interface PurposeStepProps {
  value: string | null;
  onChange: (value: string) => void;
}

/** 여행 주요 목적 선택. PR 12에서 구현. */
export function PurposeStep(_props: PurposeStepProps) {
  return <StepPlaceholder label="여행 주요 목적 선택" />;
}
