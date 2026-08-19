"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchPlaces } from "@/lib/places";

/**
 * 장소(숙소·병원 등) 목록을 조회한다.
 * @param name 검색어. 생략 시 전체 목록.
 */
export const usePlaces = (name?: string) =>
  useQuery({
    queryKey: ["places", name ?? ""],
    queryFn: () => fetchPlaces(name),
  });
