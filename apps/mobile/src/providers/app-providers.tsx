import {
  QueryClientProvider,
  focusManager,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AppState, Platform, type AppStateStatus } from "react-native";

import { useAccessToken } from "@/hooks/use-access-token";
import { hydrateAccessToken } from "@/lib/auth";
import { createQueryClient } from "@/lib/query-client";

/** 인증 상태에 따라 정리할 사용자 스코프 쿼리 키. */
const USER_SCOPED_KEYS = [["recommendations"], ["me"]] as const;

/**
 * 로그인/로그아웃에 맞춰 사용자 스코프 캐시를 정리한다.
 *
 * 탭 화면은 blur되면 freeze되어(react-native-screens) 토큰 변경을 그 자리에서
 * 반영하지 못한다. 그래서 로그아웃 후에도 홈의 저장 코스 태그가 남거나, 로그인
 * 직후 태그가 바로 뜨지 않는 문제가 있었다. 항상 마운트되는(=freeze되지 않는)
 * 이 컴포넌트에서 토큰 변화를 감지해 캐시를 정리하면 로그아웃 버튼과 401 만료
 * 경로를 모두 한곳에서 커버한다.
 *
 * - 로그아웃(→null): 사용자 데이터 쿼리 제거 → 잔존 태그/내 정보 즉시 사라짐
 * - 로그인(→string): 이전 세션 데이터 무효화 → 활성 화면에서 새로 조회
 */
function AuthQuerySync() {
  const queryClient = useQueryClient();
  const token = useAccessToken();
  const prevToken = useRef(token);

  useEffect(() => {
    const previous = prevToken.current;
    prevToken.current = token;

    // 하이드레이트 전(undefined)엔 아직 판단하지 않는다.
    if (token === undefined) return;

    if (token === null) {
      USER_SCOPED_KEYS.forEach((queryKey) =>
        queryClient.removeQueries({ queryKey }),
      );
    } else if (previous !== token) {
      USER_SCOPED_KEYS.forEach((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      );
    }
  }, [token, queryClient]);

  return null;
}

/**
 * react-query에 "포커스" 신호를 전달한다.
 *
 * 웹의 refetchOnWindowFocus는 브라우저 window focus 이벤트에 기댄다. RN에는 window
 * focus가 없으므로, 앱이 background→active로 돌아오는 AppState 변화를 포커스로
 * 연결한다(react-query 공식 RN 가이드 방식).
 */
function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

/**
 * 앱 전역 프로바이더. 지금은 react-query만 감싼다.
 * (추후 인증/테마 등 전역 컨텍스트가 생기면 여기에 중첩)
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  // 부팅 시 secure-store의 액세스 토큰을 메모리 캐시로 1회 로드한다.
  // 완료 전까지 useAccessToken은 undefined(로딩)를 반환한다.
  useEffect(() => {
    void hydrateAccessToken();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);
    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthQuerySync />
      {children}
    </QueryClientProvider>
  );
}
