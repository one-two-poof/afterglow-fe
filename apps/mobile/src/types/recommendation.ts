/**
 * 통합 추천 코스 API(ML 서버) 응답 계약. 웹 types/recommendation.ts의 타입 부분.
 * (요청 페이로드는 components/TripPlanPanel/types.ts 의 TripPlanPayload)
 *
 * 구조: daily_recommendations[] = rank별 "완성된 다일 일정" 하나. 사용자는 rank 단위로
 * 통째로 채택/스킵한다.
 *
 * 지도용 좌표 변환 헬퍼(courseToMarkers 등)는 지도 PR(14~16)에서 함께 이식한다.
 */
import type { MapPoint } from "@afterglow/utils";

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
