/**
 * 장소(숙소·병원 등) 목록 API 클라이언트. 웹 lib/places의 앱 버전.
 * 인증 헤더 첨부·에러 정규화는 apiClient 인터셉터(lib/axios, PR 2)가 담당한다.
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
