/** 여행 계획 폼 제출 페이로드 (백엔드 계약) */

export interface DailyStart {
  /** "YYYY-MM-DD" */
  date: string;
  start_name: string;
  start_lat: number;
  start_lon: number;
}

export interface TreatmentSelection {
  /** 시술 종류 (한글 라벨 그대로 제출) */
  name: string;
  /** 시술 받는 날짜 "YYYY-MM-DD" (같은 날짜에 여러 시술 가능) */
  date: string;
}

export interface TripPlanPayload {
  /** "YYYY-MM-DD" */
  trip_start_date: string;
  /** "YYYY-MM-DD" */
  trip_end_date: string;
  /** 선택한 시술 종류 + 각 시술의 날짜 */
  treatment: TreatmentSelection[];
  user_purpose: string;
  /** 도보 선호도 (1~5) */
  user_walk_preference: number;
  daily_starts: DailyStart[];
}
