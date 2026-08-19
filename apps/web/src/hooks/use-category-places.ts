"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchAccommodations,
  fetchAttractions,
  fetchHospitals,
  type PlaceCategory,
} from "@/lib/places";
import type { Place } from "@/types/place";

const FETCHERS: Record<PlaceCategory, (name?: string) => Promise<Place[]>> = {
  hospital: fetchHospitals,
  accommodation: fetchAccommodations,
  attraction: fetchAttractions,
};

/**
 * 선택한 카테고리의 장소 목록을 조회한다.
 * category가 null("전체")이면 요청하지 않는다.
 */
export const useCategoryPlaces = (category: PlaceCategory | null) =>
  useQuery({
    queryKey: ["places", "category", category],
    queryFn: () => FETCHERS[category!](),
    enabled: category !== null,
  });
