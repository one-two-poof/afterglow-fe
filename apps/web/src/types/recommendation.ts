/**
 * 통합 추천 코스 API(ML 서버) 응답 계약.
 * (요청 페이로드는 components/TripPlanPanel/types.ts 의 TripPlanPayload)
 *
 * 구조: recommended_courses[] = rank별 "완성된 다일(多日) 일정" 하나.
 * 각 코스는 daily_schedules[](날짜별)를 품는다. 사용자는 rank 단위로 통째로 채택/스킵.
 *
 * 좌표(mapX/mapY)는 @afterglow/utils 의 MapPoint/toLatLng 로 지도 좌표(lat/lng)로 변환.
 */
import { toLatLng, type LatLng, type MapPoint } from "@afterglow/utils";

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

/** 통합 추천 코스 API 최상위 응답 */
export interface RecommendationResponse {
  status: string;
  message: string;
  data: {
    recommended_courses: RecommendedCourse[];
  };
}

/**
 * 채택되어 서버에 저장된 코스. 추천 코스(RecommendedCourse)에 서버 부여 id가 붙은 형태.
 * ⚠️ GET /my-courses 응답 스키마는 아직 미확정 — id 필드명/타입은 확정 시 조정.
 */
export type SavedCourse = RecommendedCourse & { id: number };

/**
 * 코스의 모든 장소를 지도 마커로 변환. daily_schedules를 순회하며 방문 순서대로 평탄화한다.
 * (실제 도보 경로 선은 후속 범위 — 지금은 좌표 마커만)
 */
export function courseToMarkers(
  course: RecommendedCourse,
): (LatLng & { label: string })[] {
  return course.daily_schedules.flatMap((day) =>
    day.places.map((place) => ({
      ...toLatLng(place),
      label: `${place.visit_order}. ${place.place_name}`,
    })),
  );
}
