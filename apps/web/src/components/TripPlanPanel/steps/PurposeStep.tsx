"use client";

import { cn } from "@afterglow/utils";
import { Check } from "lucide-react";

export interface PurposeOption {
  /** 제출 값(한글) 겸 표시 라벨 */
  value: string;
  emoji: string;
  description: string;
}

/** 여행 주요 목적 선택지. value가 곧 제출 값(user_purpose) */
export const PURPOSES: PurposeOption[] = [
  {
    value: "문화관광",
    emoji: "🛍️",
    description: "한국의 트렌디한 쇼핑몰과 도심 랜드마크 탐방",
  },
  {
    value: "뷰티쇼핑",
    emoji: "🍰",
    description: "핫플레이스 맛집투어와 감성 카페 거리",
  },
  {
    value: "휴식",
    emoji: "🌳",
    description: "도심 속 정원, 한강 공원, 고궁 산책을 통한 안정",
  },
];

export interface PurposeStepProps {
  value: string | null;
  onChange: (value: string) => void;
}

/** 여행 주요 목적 선택 (단일 선택). value 문자열을 그대로 제출 */
export const PurposeStep = ({ value, onChange }: PurposeStepProps) => (
  <div className="flex flex-col gap-3 pt-2">
    <p className="text-body-sm text-text-secondary">
      시술 외에 어떤 활동을 주로 원하시나요?
    </p>

    {PURPOSES.map((option) => {
      const selected = value === option.value;
      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={selected}
          className={cn(
            "flex w-full items-center gap-3 rounded-[12px] border-2 bg-surface p-3 text-left shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:outline-none",
            selected
              ? "border-primary"
              : "border-transparent hover:border-border",
          )}
        >
          <div
            aria-hidden="true"
            className="flex size-16 shrink-0 items-center justify-center rounded-[10px] bg-surface-muted text-3xl"
          >
            {option.emoji}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-label-lg text-text">{option.value}</p>
            <p className="text-body-sm text-text-muted">{option.description}</p>
          </div>

          <span
            aria-hidden="true"
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full",
              selected
                ? "bg-primary text-neutral-0"
                : "border-2 border-neutral-300",
            )}
          >
            {selected && <Check size={14} strokeWidth={3} />}
          </span>
        </button>
      );
    })}
  </div>
);
