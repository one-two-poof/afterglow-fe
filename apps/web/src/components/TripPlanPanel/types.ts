/** 여행 계획 폼 제출 페이로드 (백엔드 계약) */

export interface DailyStart {
  /** "YYYY-MM-DD" */
  date: string;
  start_name: string;
  start_lat: number;
  start_lon: number;
}

export interface TripPlanPayload {
  /** "YYYY-MM-DD" */
  trip_start_date: string;
  /** "YYYY-MM-DD" */
  trip_end_date: string;
  /** "YYYY-MM-DD" */
  treatment_date: string;
  treatment: string;
  user_purpose: string;
  /** 도보 선호도 (1~5) */
  user_walk_preference: number;
  daily_starts: DailyStart[];
}
