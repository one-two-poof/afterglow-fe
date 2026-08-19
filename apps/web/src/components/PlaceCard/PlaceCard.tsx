"use client";

import { cn } from "@afterglow/utils";
import { Check } from "lucide-react";

export interface PlaceCardProps {
  name: string;
  address: string;
  /** 카테고리 태그 (예: "피부과") */
  category?: string;
  imageUrl?: string;
  selected?: boolean;
  onSelect?: () => void;
  /**
   * 선택 상태에서 체크 표시를 눌러 해제할 때 호출.
   * 주어지면 체크가 버튼이 되고, 카드 전체 클릭(onSelect)은 비활성화된다.
   */
  onToggleSelect?: () => void;
  className?: string;
}

/**
 * 선택 가능한 장소(숙소/병원 등) 카드.
 * 선택 시 파란 테두리 + 체크 인디케이터로 상태를 표시한다.
 * onToggleSelect가 주어지면 체크를 눌러 선택을 해제할 수 있다.
 */
export const PlaceCard = ({
  name,
  address,
  category,
  imageUrl,
  selected = false,
  onSelect,
  onToggleSelect,
  className,
}: PlaceCardProps) => {
  const cardClass = cn(
    "flex w-full items-center gap-3 rounded-[12px] border-2 bg-surface p-3 text-left shadow-sm transition-colors",
    selected ? "border-primary" : "border-transparent hover:border-border",
    className,
  );

  const thumb = imageUrl ? (
    // TODO: 이미지 호스트 확정되면 next/image로 교체 (remotePatterns 설정 필요)
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt=""
      loading="lazy"
      className="size-16 shrink-0 rounded-[10px] object-cover"
    />
  ) : (
    <div
      aria-hidden="true"
      className="size-16 shrink-0 rounded-[10px] bg-surface-muted"
    />
  );

  const info = (
    <div className="min-w-0 flex-1">
      {category && <p className="text-caption text-text-muted">{category}</p>}
      <p className="truncate text-label-lg text-text">{name}</p>
      <p className="truncate text-body-sm text-text-muted">{address}</p>
    </div>
  );

  // 체크로 해제하는 모드: 카드 전체는 비대화형(div), 체크만 버튼
  if (onToggleSelect) {
    return (
      <div className={cardClass}>
        {thumb}
        {info}
        <button
          type="button"
          onClick={onToggleSelect}
          aria-label="선택 해제"
          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-neutral-0 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:outline-none"
        >
          <Check size={14} strokeWidth={3} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        cardClass,
        "focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:outline-none",
      )}
    >
      {thumb}
      {info}
      <span
        aria-hidden="true"
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full",
          selected ? "bg-primary text-neutral-0" : "border-2 border-neutral-300",
        )}
      >
        {selected && <Check size={14} strokeWidth={3} />}
      </span>
    </button>
  );
};
