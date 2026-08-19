/**
 * 장소(숙소·병원 등) 목록 API 클라이언트.
 * 인증 헤더 첨부·에러 정규화는 apiClient 인터셉터(lib/axios)가 담당한다.
 */
import { apiClient } from "@/lib/axios";
import type { Place } from "@/types/place";

/** 장소 목록 조회. name으로 검색, 생략 시 전체 조회. */
export async function fetchPlaces(name?: string): Promise<Place[]> {
  const { data } = await apiClient.get<Place[]>("/api/places", {
    params: name ? { name } : undefined,
  });
  return data;
}
