/**
 * 장소(숙소·병원 등) 목록 API 클라이언트.
 * 인증 헤더 첨부·에러 정규화는 apiClient 인터셉터(lib/axios)가 담당한다.
 */
import { apiClient } from "@/lib/axios";
import type { Place } from "@/types/place";

/** 같은 id가 여러 번 오면 첫 항목만 남긴다 (입력 순서 유지). */
const dedupeById = (places: Place[]): Place[] => {
  const byId = new Map<number, Place>();
  for (const place of places) {
    if (!byId.has(place.id)) {
      byId.set(place.id, place);
    }
  }
  return [...byId.values()];
};

/** 장소 목록 조회. name으로 검색, 생략 시 전체 조회. */
export async function fetchPlaces(name?: string): Promise<Place[]> {
  const { data } = await apiClient.get<Place[]>("/api/places", {
    params: name ? { name } : undefined,
  });
  // 백엔드가 같은 장소를 중복으로 내려줄 수 있어 id 기준으로 제거
  return dedupeById(data);
}

/** 지도 카테고리 (API 경로 세그먼트와 동일) */
export type PlaceCategory = "hospital" | "accommodation" | "attraction";

/** 카테고리별 장소 조회. name 생략 시 해당 카테고리 전체. */
const fetchPlacesByCategory = async (
  category: PlaceCategory,
  name?: string,
): Promise<Place[]> => {
  const { data } = await apiClient.get<Place[]>(`/api/places/${category}`, {
    params: name ? { name } : undefined,
  });
  return dedupeById(data);
};

/** 병원 목록 (name 생략 시 전체) */
export const fetchHospitals = (name?: string) =>
  fetchPlacesByCategory("hospital", name);

/** 숙소 목록 (name 생략 시 전체) */
export const fetchAccommodations = (name?: string) =>
  fetchPlacesByCategory("accommodation", name);

/** 관광명소 목록 (name 생략 시 전체) */
export const fetchAttractions = (name?: string) =>
  fetchPlacesByCategory("attraction", name);
