"use client";

import { useMutation } from "@tanstack/react-query";

import { postCourseSelection } from "@/lib/course-selection";

/** 코스 선택(저장) mutation. 성공/실패 처리는 호출부에서 연결한다. */
export const useCourseSelection = () =>
  useMutation({
    mutationFn: postCourseSelection,
  });
