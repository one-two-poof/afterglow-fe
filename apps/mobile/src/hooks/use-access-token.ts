import { getAccessToken } from "@/lib/auth";

/**
 * 액세스 토큰을 읽는다 (웹 use-access-token의 앱 버전).
 * - `undefined` : 아직 확인 전 → 로딩 스켈레톤
 * - `null`      : 토큰 없음 → 로그인 안내
 * - `string`    : 로그인됨
 *
 * TODO(PR 18): 현재는 스텁(getAccessToken이 항상 null)이라 반응형이 아니다.
 * secure-store + OAuth 딥링크 도입 시 로그인/로그아웃에 반응하도록 교체한다
 * (예: 토큰을 zustand/외부 store로 두고 useSyncExternalStore로 구독).
 */
export const useAccessToken = (): string | null | undefined => getAccessToken();
