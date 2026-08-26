/**
 * 앱 인증 유틸 (axios 인터셉터가 사용).
 *
 * 웹은 액세스 토큰을 localStorage에 저장하지만, 앱에는 localStorage가 없다.
 * 실제 토큰 저장/조회(expo-secure-store)와 OAuth 딥링크 흐름은 **PR 18**에서
 * 구현한다. 지금은 axios 인터셉터 구조를 웹과 동일하게 맞춰두기 위한 스텁으로,
 * 항상 토큰 없음(null)을 반환한다.
 */

/** 401/403 등 인증 실패를 일반 에러와 구분하기 위한 타입 (웹과 동일) */
export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * 액세스 토큰 조회.
 * TODO(PR 18): expo-secure-store에서 토큰을 읽어오도록 교체.
 */
export const getAccessToken = (): string | null => {
  return null;
};

/**
 * 액세스 토큰 삭제 (로그아웃/만료 시).
 * TODO(PR 18): expo-secure-store에서 토큰을 지우도록 교체.
 */
export const clearAccessToken = (): void => {
  // no-op (스텁)
};
