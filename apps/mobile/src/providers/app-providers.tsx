import { QueryClientProvider, focusManager } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { AppState, Platform, type AppStateStatus } from "react-native";

import { hydrateAccessToken } from "@/lib/auth";
import { createQueryClient } from "@/lib/query-client";

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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
