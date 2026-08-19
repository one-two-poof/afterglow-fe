import type { Place } from "./PlaceStep";

// TODO: 실제 추천 숙소 API 연동 시 제거 (lat/lon 포함해 서버에서 내려받기)
// 숙소 선택 단계(PlaceStep)에 넘길 임시 데이터.
export const MOCK_PLACES: Place[] = [
  {
    id: 7,
    category: "숙소",
    name: "도미인 서울 강남",
    address: "서울 서초구 강남대로 415",
    lat: 37.5,
    lon: 127.026,
  },
  {
    id: 5,
    category: "숙소",
    name: "유앤아이 호텔 강남점",
    address: "서울 서초구 강남대로 421",
    lat: 37.503,
    lon: 127.024,
  },
];
