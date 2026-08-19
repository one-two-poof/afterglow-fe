"use client";

import { MapLibreMap, TripPlanPanel } from "@/components";
import { useCategoryPlaces } from "@/hooks/use-category-places";
import { useDebounce } from "@/hooks/use-debounce";
import { usePlaces } from "@/hooks/use-places";
import { getAccessToken } from "@/lib/auth";
import type { PlaceCategory } from "@/lib/places";
import type { Place } from "@/types/place";
import { Input, TagList } from "@afterglow/ui";
import { toLatLng } from "@afterglow/utils";
import { Plus, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

// 지도 카테고리 필터 태그 (API 연동 예정 — 현재는 UI만)
// "전체"는 필터 해제(기본) 역할
const CATEGORY_ITEMS: { value: string; name: string; icon?: string }[] = [
  { value: "all", name: "전체" },
  { value: "hospital", icon: "🏥", name: "병원" },
  { value: "attraction", icon: "🗺️", name: "관광명소" },
  { value: "accommodation", icon: "🏨", name: "숙소" },
];

export default function Home() {
  const router = useRouter();
  // 선택된 카테고리 태그. "all"(전체)이 기본이자 필터 해제 상태
  const [filter, setFilter] = useState("all");
  const [planOpen, setPlanOpen] = useState(false);

  // 장소 검색: 입력값을 300ms 디바운스해 요청. 빈 문자열이면 요청하지 않음.
  const [search, setSearch] = useState("");
  // 드롭다운 열림 여부. 검색어와 분리해, 결과 선택 시 닫아 재요청을 막는다.
  const [searchOpen, setSearchOpen] = useState(false);
  // 검색 결과에서 선택한 장소 (지도 마커/이동 대상)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const debouncedSearch = useDebounce(search, 300);
  // 선택으로 닫힌 상태(searchOpen=false)에서는 요청하지 않는다.
  const searchEnabled = searchOpen && debouncedSearch.trim() !== "";
  const { data: searchResults = [], isFetching: isSearching } = usePlaces(
    debouncedSearch,
    { enabled: searchEnabled },
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setSearchOpen(true);
  };

  const clearSearch = () => {
    setSearch("");
    setSearchOpen(false);
  };

  // 결과 선택: 입력값을 장소명으로 바꾸고, 드롭다운을 닫아 재요청을 막는다.
  // 선택한 장소를 지도 마커 대상으로 두고, 카테고리 필터는 "전체"로 되돌린다.
  const selectPlace = (place: Place) => {
    setSearch(place.placeName);
    setSearchOpen(false);
    setSelectedPlace(place);
    setFilter("all");
  };

  const showSearchResults = searchOpen && search.trim() !== "";

  // 카테고리 태그 선택 시 그 카테고리 전체를 조회. "전체"(all)면 요청하지 않음.
  const category = filter === "all" ? null : (filter as PlaceCategory);
  const { data: categoryPlaces = [] } = useCategoryPlaces(category);

  // 마커: 검색으로 선택한 장소가 있으면 그 한 곳, 없으면 선택 카테고리의 장소들.
  // (MapLibreMap이 markers 변경 시 fitBounds로 지도도 이동시킨다)
  const markers = useMemo(() => {
    if (selectedPlace) {
      return [{ ...toLatLng(selectedPlace), label: selectedPlace.placeName }];
    }
    return categoryPlaces.map((place) => ({
      ...toLatLng(place),
      label: place.placeName,
    }));
  }, [selectedPlace, categoryPlaces]);

  // 여행 일정 만들기는 로그인 필요 — 미로그인 시 내 정보(로그인) 화면으로 이동
  const handleCreatePlan = () => {
    if (!getAccessToken()) {
      router.push("/my-page");
      return;
    }
    setPlanOpen(true);
  };

  return (
    <div className="relative h-full">
      <MapLibreMap markers={markers} />
      <div className="absolute top-4 left-1/2 z-20 w-[95%] -translate-x-1/2">
        <Input
          className="w-full"
          placeholder="병원 또는 관광지를 검색해보세요"
          aria-label="장소 검색"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          leftIcon={<Search size={18} />}
          rightIcon={
            search ? (
              <button
                type="button"
                aria-label="검색어 지우기"
                onClick={clearSearch}
                className="flex items-center text-text-muted hover:text-text focus-visible:outline-none"
              >
                <X size={18} />
              </button>
            ) : undefined
          }
          size="lg"
        />

        {showSearchResults && (
          <ul className="mt-2 max-h-64 overflow-y-auto rounded-[8px] border border-border bg-neutral-0 shadow-md">
            {searchResults.length > 0 ? (
              searchResults.map((place) => (
                <li
                  key={place.id}
                  className="border-b border-border last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => selectPlace(place)}
                    className="w-full px-4 py-3 text-left text-body-sm text-text hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none"
                  >
                    {place.placeName}
                  </button>
                </li>
              ))
            ) : isSearching ? (
              <li className="px-4 py-3 text-body-sm text-text-muted">
                검색 중…
              </li>
            ) : (
              <li className="px-4 py-3 text-body-sm text-text-muted">
                검색 결과가 없습니다.
              </li>
            )}
          </ul>
        )}
      </div>

      <TagList
        value={filter}
        onChange={(value) => {
          setFilter(value);
          setSelectedPlace(null);
        }}
        className="absolute bottom-0 p-5"
      >
        {CATEGORY_ITEMS.map((item) => (
          <TagList.Item key={item.value} value={item.value} icon={item.icon}>
            {item.name}
          </TagList.Item>
        ))}
      </TagList>

      <button
        type="button"
        aria-label="여행 일정 만들기"
        onClick={handleCreatePlan}
        className="absolute right-5 bottom-28 z-10 flex size-14 items-center justify-center rounded-full bg-action-primary text-on-action-primary shadow-md hover:bg-action-primary-hover focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:outline-none"
      >
        <Plus size={26} />
      </button>

      <TripPlanPanel open={planOpen} onClose={() => setPlanOpen(false)} />
    </div>
  );
}
