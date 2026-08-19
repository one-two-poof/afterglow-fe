import { Input } from "@afterglow/ui";
import { Lightbulb, Search, X } from "lucide-react";
import { useState } from "react";

import { PlaceCard } from "@/components/PlaceCard";
import { useDebounce } from "@/hooks/use-debounce";
import { usePlaces } from "@/hooks/use-places";
import type { Place } from "@/types/place";

export interface PlaceStepProps {
  /** 여행 일자들 */
  days: Date[];
  /** 일자별 선택 장소 (인덱스 = n번째 날, null이면 미선택) */
  selected: (Place | null)[];
  /** 특정 날짜의 장소 선택/취소. place가 null이면 취소 */
  onSelect: (dayIndex: number, place: Place | null) => void;
}

const formatDay = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;

/**
 * 관광지 선택 단계 (모든 날짜를 한 화면에서).
 * 검색으로 찾은 장소는 "활성 날짜" 슬롯에 채워지고, 다음 빈 날짜로 넘어간다.
 * 검색 결과는 오버레이(절대배치)로 떠서 아래 날짜 목록을 밀지 않는다.
 */
export const PlaceStep = ({ days, selected, onSelect }: PlaceStepProps) => {
  const [query, setQuery] = useState("");
  // 검색 결과가 채워질 대상 날짜 인덱스
  const [activeIndex, setActiveIndex] = useState(0);
  const debouncedQuery = useDebounce(query, 300);
  const hasQuery = debouncedQuery.trim() !== "";
  const { data: places = [], isFetching } = usePlaces(debouncedQuery, {
    enabled: hasQuery,
  });

  // 범위 축소 등으로 인덱스가 벗어나면 클램프
  const active = Math.min(activeIndex, days.length - 1);
  const activeDate = days[active];

  const showResults = query.trim() !== "";
  const isSearching = debouncedQuery !== query || isFetching;
  // 활성 날짜에 이미 고른 장소는 결과에서 제외
  const results = places.filter((place) => place.id !== selected[active]?.id);

  // 활성 날짜에 장소를 채우고, 검색어를 비운 뒤 다음 빈 날짜로 이동
  const handlePick = (place: Place) => {
    onSelect(active, place);
    setQuery("");
    const nextEmpty = days.findIndex((_, i) => i !== active && !selected[i]);
    if (nextEmpty !== -1) {
      setActiveIndex(nextEmpty);
    }
  };

  const toCard = (place: Place, onClick: () => void, isSelected: boolean) => (
    <PlaceCard
      key={place.id}
      category={place.categoryName}
      name={place.placeName}
      address={place.roadAddressName || place.addressName}
      imageUrl={place.image}
      selected={isSelected}
      onSelect={onClick}
    />
  );

  return (
    <div className="flex flex-col gap-3 pt-2">
      <div className="flex items-start gap-2 rounded-[12px] bg-surface-accent px-4 py-3">
        <Lightbulb
          size={18}
          className="mt-0.5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <p className="text-body-sm text-text-secondary">
          날짜별로 방문할 관광지를 검색해 선택하세요. 선택하면 다음 날짜로
          넘어갑니다.
        </p>
      </div>

      <div className="relative">
        <Input
          size="md"
          placeholder={
            activeDate
              ? `${formatDay(activeDate)} 관광지 검색`
              : "관광지 검색"
          }
          aria-label="관광지 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftIcon={<Search size={18} />}
          rightIcon={
            query ? (
              <button
                type="button"
                aria-label="검색어 지우기"
                onClick={() => setQuery("")}
                className="flex items-center text-text-muted hover:text-text focus-visible:outline-none"
              >
                <X size={18} />
              </button>
            ) : undefined
          }
        />

        {/* 검색 결과 오버레이 — 아래 날짜 목록을 밀지 않고 그 위에 뜬다 */}
        {showResults && (
          <div className="absolute inset-x-0 top-full z-10 mt-2 max-h-[320px] overflow-y-auto rounded-[12px] border border-border bg-bg p-2 shadow-lg">
            {results.length > 0 ? (
              <div className="flex flex-col gap-2">
                {results.map((place) =>
                  toCard(place, () => handlePick(place), false),
                )}
              </div>
            ) : isSearching ? (
              <p className="py-6 text-center text-body-sm text-text-muted">
                불러오는 중…
              </p>
            ) : (
              <p className="py-6 text-center text-body-sm text-text-muted">
                검색 결과가 없습니다.
              </p>
            )}
          </div>
        )}
      </div>

      {/* 날짜별 슬롯 — 정상 흐름(오버레이가 이 위를 덮음) */}
      <div className="flex flex-col gap-3">
        {days.map((day, i) => {
          const place = selected[i] ?? null;
          const isActive = i === active;
          return (
            <div key={formatDay(day)} className="flex flex-col gap-1.5">
              <span
                className={
                  isActive
                    ? "text-label-sm font-medium text-primary"
                    : "text-label-sm text-text"
                }
              >
                {formatDay(day)}
                {isActive && " · 검색 대상"}
              </span>

              {place ? (
                // 체크 표시를 눌러 선택 해제
                <PlaceCard
                  category={place.categoryName}
                  name={place.placeName}
                  address={place.roadAddressName || place.addressName}
                  imageUrl={place.image}
                  selected
                  onToggleSelect={() => onSelect(i, null)}
                />
              ) : (
                // PlaceCard와 동일한 박스 구조(p-3 + size-16)로 높이를 맞춰
                // 선택 시 레이아웃 시프트를 없앤다.
                <button
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={`flex w-full items-center gap-3 rounded-[12px] border-2 border-dashed p-3 text-left text-body-sm transition-colors ${
                    isActive
                      ? "border-primary bg-surface-accent text-primary"
                      : "border-border text-text-muted hover:border-border-focus"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="flex size-16 shrink-0 items-center justify-center rounded-[10px] bg-surface-muted"
                  >
                    <Search size={22} />
                  </span>
                  <span className="flex-1">장소를 검색해 선택하세요</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
