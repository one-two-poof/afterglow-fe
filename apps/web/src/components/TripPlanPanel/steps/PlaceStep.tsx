import { Input } from "@afterglow/ui";
import { Lightbulb, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { PlaceCard } from "@/components/PlaceCard";

export interface Place {
  /** 병원·숙소 데이터 아이디 (제출 시 daily_startList[].start_id) */
  id: number;
  name: string;
  address: string;
  /** 위도 (지도 마커용) */
  lat: number;
  /** 경도 (지도 마커용) */
  lon: number;
  category?: string;
  imageUrl?: string;
}

export interface PlaceStepProps {
  places: Place[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

/** 2단계: 숙소(또는 병원 등) 선택 */
export const PlaceStep = ({ places, selectedId, onSelect }: PlaceStepProps) => {
  const [query, setQuery] = useState("");

  // TODO: 실검색 API 연동 시 서버 필터링으로 교체 (현재는 클라이언트 필터)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return places;
    }
    return places.filter(
      (place) =>
        place.name.toLowerCase().includes(q) ||
        place.address.toLowerCase().includes(q),
    );
  }, [places, query]);

  return (
    <div className="flex flex-col gap-3 pt-2">
      <div className="flex items-start gap-2 rounded-[12px] bg-surface-accent px-4 py-3">
        <Lightbulb
          size={18}
          className="mt-0.5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <p className="text-body-sm text-text-secondary">
          시술 장소와 가까운 숙소를 선택하면 이동 동선을 고려한 코스를
          추천해드립니다.
        </p>
      </div>

      <Input
        type="search"
        size="md"
        placeholder="숙소 이름 · 주소로 검색"
        aria-label="숙소 검색"
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

      {filtered.length > 0 ? (
        filtered.map((place) => (
          <PlaceCard
            key={place.id}
            category={place.category}
            name={place.name}
            address={place.address}
            imageUrl={place.imageUrl}
            selected={selectedId === place.id}
            onSelect={() => onSelect(place.id)}
          />
        ))
      ) : (
        <p className="py-8 text-center text-body-sm text-text-muted">
          검색 결과가 없습니다.
        </p>
      )}
    </div>
  );
};
