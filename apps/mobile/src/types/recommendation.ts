/**
 * 통합 추천 코스 API(ML 서버) 응답 계약. 웹 types/recommendation.ts의 타입 부분.
 * (요청 페이로드는 components/TripPlanPanel/types.ts 의 TripPlanPayload)
 *
 * 구조: daily_recommendations[] = rank별 "완성된 다일 일정" 하나. 사용자는 rank 단위로
 * 통째로 채택/스킵한다.
 *
 * 지도용 좌표 변환 헬퍼(courseToMarkers 등)는 지도 PR(14~16)에서 함께 이식한다.
 */
import type { LatLng, MapPoint } from "@afterglow/utils";

/**
 * 코스 좌표(mapX=위도/mapY=경도) → 지도 좌표(lat/lng).
 * ⚠️ BE 장소용 toLatLng(mapX=경도)와 **반대 관례**다. ML 추천 서버의 코스 응답은
 * mapX에 위도, mapY에 경도를 담아 내려주므로 여기서만 별도로 변환한다(웹과 동일).
 */
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
  /** 코스 전체 이동 거리(km, 사전 계산값) */
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
 */
export interface SavedCourse extends RecommendedCourse {
  /** 저장 선택 식별자 (서버 부여) */
  selectionId: number;
  /** 저장 시각 (ISO 8601) */
  selectedAt: string;
}

/** 지도 마커 (좌표 + 라벨). 모바일 MapMarker와 호환된다. */
export type CourseMarker = LatLng & { label: string };

/**
 * 추천 코스(RecommendedCourse)의 "출발지 → 도착지" 두 지점만 마커로 찍는다.
 * - 출발지 = 코스의 맨 처음 지점(첫날 start_location)
 * - 도착지 = 코스의 맨 마지막 지점(마지막 방문 장소)
 * (웹 courseToMarkers와 동일 — 경로 API 연동 전 임시 표시)
 */
export function courseToMarkers(course: RecommendedCourse): CourseMarker[] {
  const points: (MapPoint & { name?: string; place_name?: string })[] =
    course.daily_schedules.flatMap((day) => [
      day.start_location,
      ...day.places,
    ]);
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last || first === last) {
    return [];
  }

  const nameOf = (p: (typeof points)[number]) => p.place_name ?? p.name ?? "";
  return [
    {
      ...courseToLatLng(first),
      label: `출발지${nameOf(first) ? ` · ${nameOf(first)}` : ""}`,
    },
    {
      ...courseToLatLng(last),
      label: `도착지${nameOf(last) ? ` · ${nameOf(last)}` : ""}`,
    },
  ];
}

/**
 * 저장된 코스(SavedCourse)의 모든 지점을 마커로.
 * 각 날의 출발지 + 방문 장소 전체를 이름 라벨과 함께 반환한다(웹과 동일).
 */
export function savedCourseToMarkers(course: SavedCourse): CourseMarker[] {
  return course.daily_schedules.flatMap((day) => [
    { ...courseToLatLng(day.start_location), label: day.start_location.name },
    ...day.places.map((place) => ({
      ...courseToLatLng(place),
      label: place.place_name,
    })),
  ]);
}
