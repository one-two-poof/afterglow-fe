/**
 * 통합 추천 코스 API(ML 서버) 응답 계약.
 * (요청 페이로드는 components/TripPlanPanel/types.ts 의 TripPlanPayload)
 *
 * 구조: recommended_courses[] = rank별 "완성된 다일(多日) 일정" 하나.
 * 각 코스는 daily_schedules[](날짜별)를 품는다. 사용자는 rank 단위로 통째로 채택/스킵.
 *
 * ⚠️ 좌표 규약: 코스 데이터(추천·저장)는 mapX=위도(lat), mapY=경도(lng)로 온다.
 * 이는 장소 API(/api/places, mapX=lng)의 toLatLng 규약과 반대이므로,
 * 코스 좌표는 아래 courseToLatLng로 변환한다(toLatLng를 쓰지 않음).
 */
import type { LatLng, MapPoint } from "@afterglow/utils";

/** 코스 좌표(mapX=위도/mapY=경도) → 지도 좌표(lat/lng) */
const courseToLatLng = (point: MapPoint): LatLng => ({
  lat: point.mapX,
  lng: point.mapY,
});

/** 코스에 포함된 개별 장소 (방문 순서대로) */
export interface RecommendedPlace extends MapPoint {
  /** 방문 순서 (1부터) */
  visit_order: number;
  place_name: string;
  /** 명소 / 쇼핑 / 숙소 등 */
  place_category: string;
  /** 실내 여부 (0: 실외, 1: 실내) */
  is_indoor: 0 | 1;
  /** 도보 난이도 (1~5) */
  walk_hard: number;
  /** 직전 장소로부터의 거리(km). 첫 장소는 0 */
  dist_to_prev_km: number;
}

/** 코스 안의 하루치 일정 */
export interface DailySchedule {
  /** "YYYY-MM-DD" */
  date: string;
  /** 그날의 출발지(숙소·병원 등) */
  start_location: MapPoint & { name: string };
  places: RecommendedPlace[];
}

/** rank별 완성 일정 (전체 여행 기간 묶음, 채택/스킵 단위) */
export interface RecommendedCourse {
  /** 추천 순위 (1이 최상위) */
  rank: number;
  /** 코스 식별자 예: "C00003" */
  course_id: string;
  /** 코스 전체 이동 거리(km, 사전 계산값). 실제 도보 경로 길이는 경로 API의 distanceM 참고 */
  total_distance_km: number;
  /** 여행 기간 중 받는 시술 에코 (날짜별 매핑) */
  treatment: { name: string; date: string }[];
  /** 날짜별 일정 */
  daily_schedules: DailySchedule[];
}

/** 통합 추천 코스 API 최상위 응답 (rank 순 코스 배열) */
export interface RecommendationResponse {
  daily_recommendations: RecommendedCourse[];
}

/**
 * GET /api/recommendations 응답 아이템 (저장된 "내 코스").
 * 구조는 추천 코스(RecommendedCourse)와 동일하고 selectionId/selectedAt만 추가된다.
 * (daily_schedules[].places도 추천과 같은 RecommendedPlace 형태 — place_name 등)
 */
export interface SavedCourse extends RecommendedCourse {
  /** 저장 선택 식별자 (서버 부여) */
  selectionId: number;
  /** 저장 시각 (ISO 8601) */
  selectedAt: string;
}

/**
 * 임시(경로 추천 디버깅용): 코스의 "출발지 → 도착지" 두 지점만 마커로 찍는다.
 * - 출발지 = 코스의 맨 처음 지점(첫날 start_location)
 * - 도착지 = 코스의 맨 마지막 지점(마지막 방문 장소)
 * 경로 선(fetchCourseRouteLines)과 동일한 두 점을 사용한다.
 */
export function courseToMarkers(
  course: RecommendedCourse,
): (LatLng & { label: string })[] {
  const points: (MapPoint & { name?: string; place_name?: string })[] =
    course.daily_schedules.flatMap((day) => [day.start_location, ...day.places]);
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last || first === last) {
    return [];
  }

  const nameOf = (p: (typeof points)[number]) =>
    p.place_name ?? p.name ?? "";
  return [
    { ...courseToLatLng(first), label: `출발지${nameOf(first) ? ` · ${nameOf(first)}` : ""}` },
    { ...courseToLatLng(last), label: `도착지${nameOf(last) ? ` · ${nameOf(last)}` : ""}` },
  ];
}

/**
 * 저장된 코스(SavedCourse)의 모든 지점을 마커로.
 * 각 날의 출발지 + 방문 장소 전체를 이름 라벨과 함께 반환한다.
 * (TODO: from/to 경로 API 연동 시 마커 대신/함께 경로선도 그림)
 */
export function savedCourseToMarkers(
  course: SavedCourse,
): (LatLng & { label: string })[] {
  return course.daily_schedules.flatMap((day) => [
    { ...courseToLatLng(day.start_location), label: day.start_location.name },
    ...day.places.map((place) => ({
      ...courseToLatLng(place),
      label: place.place_name,
    })),
  ]);
}
