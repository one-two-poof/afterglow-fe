import { useQueries, type UseQueryResult } from "@tanstack/react-query";
import { useMemo } from "react";

import type { MapBounds } from "@/components/MapLibreMap/types";
import { getGridCells } from "@/lib/map-grid";
import {
  fetchAccommodations,
  fetchAttractions,
  fetchHospitals,
  type PlaceCategory,
} from "@/lib/places";
import { mergeTourismPlaces } from "@/lib/tourism-browse";
import type { Place } from "@/types/place";

const FETCHERS: Record<
  PlaceCategory,
  (name?: string, bounds?: MapBounds) => Promise<Place[]>
> = {
  hospital: fetchHospitals,
  accommodation: fetchAccommodations,
  attraction: fetchAttractions,
};

// 병원·관광명소·숙소는 거의 변하지 않으므로 하루 동안 캐시를 신선하게 유지.
const ONE_DAY_MS = 1000 * 60 * 60 * 24;

// The category endpoints currently require a non-empty `name` parameter.
// `%` is the backend's match-all value, so bounds remain the actual filter.
const ALL_NAMES = "%";

const EMPTY_PLACES: Place[] = [];

// 모듈 레벨에 두어 참조가 고정돼야 react-query가 결과가 같을 때 합친 배열을 재사용한다.
const combinePlaces = (results: UseQueryResult<Place[]>[]) => {
  const groups = results.flatMap((result) =>
    result.data ? [result.data] : [],
  );
  return {
    data: groups.length > 0 ? mergeTourismPlaces(groups) : EMPTY_PLACES,
    isFetching: results.some((result) => result.isFetching),
  };
};

/**
 * 선택한 카테고리의 장소 목록을 조회한다.
 * category가 null("전체")이거나 bounds가 없으면 요청하지 않는다.
 *
 * 뷰포트를 그대로 쿼리 키로 쓰면 조금만 움직여도 키가 바뀌어 캐시가 맞지 않고,
 * 응답 전까지 데이터가 비어 마커가 깜빡인다. 그래서 뷰포트를 고정 격자 셀로 쪼개
 * 셀 단위로 조회·캐싱하고, 결과를 id로 합친다. 이동 시 이미 받은 셀은 그대로 남고
 * 새로 보이는 셀만 요청한다.
 */
export const useCategoryPlaces = (
  category: PlaceCategory | null,
  bounds?: MapBounds | null,
) => {
  const cells = useMemo(
    () => (category !== null && bounds ? getGridCells(bounds) : []),
    [category, bounds],
  );

  return useQueries({
    queries: cells.map((cell) => ({
      queryKey: ["places", "category", category, cell.id],
      queryFn: () => FETCHERS[category!](ALL_NAMES, cell.bounds),
      staleTime: ONE_DAY_MS,
      gcTime: ONE_DAY_MS,
    })),
    combine: combinePlaces,
  });
};
