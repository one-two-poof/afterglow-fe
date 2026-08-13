"use client";

import { cn } from "@afterglow/utils";
import { Check } from "lucide-react";

export interface TreatmentOption {
  /** 제출 값(한글) 겸 표시 라벨 */
  name: string;
  icon: string;
}

/** 선택 가능한 시술 종류. name이 곧 제출 값 */
export const TREATMENTS: TreatmentOption[] = [
  { name: "리프팅", icon: "✨" },
  { name: "보톡스", icon: "💉" },
  { name: "비만(약처방)", icon: "💊" },
  { name: "스킨부스터", icon: "💧" },
  { name: "윤곽/체형주사", icon: "📐" },
  { name: "제모", icon: "🪒" },
  { name: "피부관리", icon: "🧖" },
  { name: "피부레이저", icon: "⚡" },
  { name: "필러", icon: "🧴" },
  { name: "필링", icon: "🍃" },
];

export interface TreatmentStepProps {
  selected: string[];
  onToggle: (name: string) => void;
}

/** 시술 종류 선택 (다중 선택). name 문자열을 그대로 제출 */
export const TreatmentStep = ({ selected, onToggle }: TreatmentStepProps) => (
  <div className="flex flex-col gap-3 pt-2">
    <p className="text-body-sm text-text-secondary">
      받으실 시술 종류를 선택해주세요 (다중 선택 가능)
    </p>

    <div className="grid grid-cols-2 gap-3">
      {TREATMENTS.map((option) => {
        const isSelected = selected.includes(option.name);
        return (
          <button
            key={option.name}
            type="button"
            onClick={() => onToggle(option.name)}
            aria-pressed={isSelected}
            className={cn(
              "flex flex-col gap-3 rounded-[12px] border-2 bg-surface p-3 text-left shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:outline-none",
              isSelected
                ? "border-primary"
                : "border-transparent hover:border-border",
            )}
          >
            <div className="flex items-start justify-between">
              <span aria-hidden="true" className="text-2xl leading-none">
                {option.icon}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full",
                  isSelected
                    ? "bg-primary text-neutral-0"
                    : "border-2 border-neutral-300",
                )}
              >
                {isSelected && <Check size={12} strokeWidth={3} />}
              </span>
            </div>
            <span className="text-label-lg text-text">{option.name}</span>
          </button>
        );
      })}
    </div>
  </div>
);
