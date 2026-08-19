import { create } from "zustand";

import type { RecommendedCourse } from "@/types/recommendation";

/**
 * "내 코스" — 채택한 완성 일정(코스) 컬렉션.
 * 한 번의 추천 브라우징에선 rank를 훑다 코스 1개만 채택하면 종료되지만,
 * 여러 여행에 걸쳐 채택분이 쌓이므로 리스트로 보관(course_id로 구분).
 * 지도 하단 TagList가 이걸 읽어 Tag로 표시하고, Tag 클릭 시 selectedCourseId로 지도에 렌더.
 */
interface AdoptedCoursesState {
  /** 채택한 코스들 (채택 순) */
  courses: RecommendedCourse[];
  /** 지도에 그릴(선택된) 코스의 course_id. null이면 지도에 코스 없음 */
  selectedCourseId: string | null;

  /** 코스 채택. 같은 course_id가 이미 있으면 무시(중복 방지) */
  adopt: (course: RecommendedCourse) => void;
  /** 채택 취소. 선택 중이던 코스면 선택도 해제 */
  remove: (courseId: string) => void;
  /** 지도에 그릴 코스 선택 (Tag 클릭). null이면 해제 */
  select: (courseId: string | null) => void;
  /** 전체 초기화 (새 여행 계획 시작 시) */
  reset: () => void;
}

export const useAdoptedCoursesStore = create<AdoptedCoursesState>((set) => ({
  courses: [],
  selectedCourseId: null,

  adopt: (course) =>
    set((state) => {
      if (state.courses.some((c) => c.course_id === course.course_id)) {
        return state;
      }
      return { courses: [...state.courses, course] };
    }),

  remove: (courseId) =>
    set((state) => ({
      courses: state.courses.filter((c) => c.course_id !== courseId),
      selectedCourseId:
        state.selectedCourseId === courseId ? null : state.selectedCourseId,
    })),

  select: (courseId) => set({ selectedCourseId: courseId }),

  reset: () => set({ courses: [], selectedCourseId: null }),
}));
