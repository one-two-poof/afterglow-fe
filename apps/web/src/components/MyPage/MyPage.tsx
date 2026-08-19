"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@afterglow/ui";
import { clearAccessToken, UnauthorizedError } from "@/lib/auth";
import { useAccessToken } from "./use-access-token";
import { useMe } from "./use-me";
import { LoginPrompt } from "./LoginPrompt";
import { ProfileHeader } from "./ProfileHeader";
import { SettingsList } from "./SettingsList";
import { MyPageSkeleton } from "./MyPageSkeleton";

/**
 * 내 정보 컨테이너.
 * 흐름: 토큰 확인 → 없으면 로그인 안내 / 있으면 내 정보 조회 후 렌더링.
 * 토큰이 만료(401/403)면 토큰을 정리해 자동으로 로그인 화면으로 전환한다.
 */
export const MyPage = () => {
  const queryClient = useQueryClient();
  const token = useAccessToken();
  const isAuthed = typeof token === "string";

  const { data, isLoading, isError, error, refetch } = useMe(isAuthed);

  // 만료/무효 토큰이면 정리 → 토큰 스토어가 갱신되며 로그인 화면으로 전환됨
  useEffect(() => {
    if (isError && error instanceof UnauthorizedError) {
      clearAccessToken();
    }
  }, [isError, error]);

  const handleLogout = () => {
    clearAccessToken();
    queryClient.removeQueries({ queryKey: ["me"] });
  };

  if (token === undefined) return <MyPageSkeleton />;
  if (token === null) return <LoginPrompt />;
  if (isLoading) return <MyPageSkeleton />;

  // 네트워크/서버 오류 (인증 오류는 위 effect에서 로그인 화면으로 전환됨)
  if (isError || !data) {
    return (
      <div
        role="alert"
        className="flex min-h-[70dvh] flex-col items-center justify-center gap-4 px-6 text-center"
      >
        <div>
          <h1 className="text-heading-sm text-text">내 정보를 불러오지 못했어요</h1>
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
    <div className="min-h-full bg-bg">
      <ProfileHeader user={data} />
      <SettingsList onLogout={handleLogout} />
    </div>
  );
};
