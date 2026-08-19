"use client";

import { Button } from "@afterglow/ui";
import { useEffect } from "react";

import { LoginPrompt } from "@/components/MyPage/LoginPrompt";
import { useAccessToken } from "@/components/MyPage/use-access-token";
import { useRecommendations } from "@/hooks/use-recommendations";
import { clearAccessToken, UnauthorizedError } from "@/lib/auth";

import { MyCourseSkeleton } from "./MyCourseSkeleton";
import { SavedCourseCard } from "./SavedCourseCard";

/**
 * 내 코스 컨테이너.
 * 흐름: 토큰 확인 → 없으면 로그인 안내 / 있으면 저장 코스 조회 후 렌더링.
 * 토큰이 만료(401/403)면 토큰을 정리해 자동으로 로그인 화면으로 전환한다.
 */
export const MyCourse = () => {
  const token = useAccessToken();
  const isAuthed = typeof token === "string";

  const {
    data: courses = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useRecommendations(isAuthed);

  // 만료/무효 토큰이면 정리 → 로그인 화면으로 전환됨
  useEffect(() => {
    if (isError && error instanceof UnauthorizedError) {
      clearAccessToken();
    }
  }, [isError, error]);

  if (token === undefined) return <MyCourseSkeleton />;
  if (token === null) return <LoginPrompt />;
  if (isLoading) return <MyCourseSkeleton />;

  // 네트워크/서버 오류 (인증 오류는 위 effect에서 로그인 화면으로 전환됨)
  if (isError) {
    return (
      <div
        role="alert"
        className="flex min-h-[70dvh] flex-col items-center justify-center gap-4 px-6 text-center"
      >
        <div>
          <h1 className="text-heading-sm text-text">코스를 불러오지 못했어요</h1>
          <p className="mt-2 text-body-sm text-text-secondary">
            잠시 후 다시 시도해 주세요.
          </p>
        </div>
        <Button
          variant="secondary"
          size="md"
          onClick={() => refetch()}
          className="w-auto px-6"
        >
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-bg px-5 py-6">
      <h1 className="text-heading-sm text-text">내 코스</h1>

      {courses.length === 0 ? (
        <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-2 text-center">
          <p className="text-body-md text-text">저장된 코스가 없어요</p>
          <p className="text-body-sm text-text-muted">
            여행 일정을 만들고 마음에 드는 코스를 저장해보세요.
          </p>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-4">
          {courses.map((course) => (
            <li key={course.selectionId}>
              <SavedCourseCard course={course} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
