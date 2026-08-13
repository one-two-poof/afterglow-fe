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
  className?: string;
}

/**
 * 선택 가능한 장소(숙소/병원 등) 카드.
 * 선택 시 파란 테두리 + 체크 인디케이터로 상태를 표시한다.
 */
export const PlaceCard = ({
  name,
  address,
  category,
  imageUrl,
  selected = false,
  onSelect,
  className,
}: PlaceCardProps) => (
  <button
    type="button"
    onClick={onSelect}
    aria-pressed={selected}
    className={cn(
      "flex w-full items-center gap-3 rounded-[12px] border-2 bg-surface p-3 text-left shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:outline-none",
      selected ? "border-primary" : "border-transparent hover:border-border",
      className,
    )}
  >
    {imageUrl ? (
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
    )}

    <div className="min-w-0 flex-1">
      {category && <p className="text-caption text-text-muted">{category}</p>}
      <p className="truncate text-label-lg text-text">{name}</p>
      <p className="truncate text-body-sm text-text-muted">{address}</p>
    </div>

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
