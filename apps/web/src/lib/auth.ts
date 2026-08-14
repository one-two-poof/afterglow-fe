/**
 * 클라이언트 인증 유틸.
 * - 액세스 토큰은 OAuth 콜백에서 localStorage("accessToken")에 저장된다.
 * - 사용자 정보는 GET /api/auth/me 를 Bearer 토큰으로 조회한다.
 */

const ACCESS_TOKEN_KEY = "accessToken";
const RETURN_TO_KEY = "returnTo";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  /** Google 프로필 이미지 URL (없을 수 있음) */
  profileImageUrl?: string;
  role?: string;
  createdAt?: string;
}

/** 401 등 인증 실패를 일반 에러와 구분하기 위한 타입 */
export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const clearAccessToken = (): void => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  emit();
};

// --- 토큰 변경 구독 (useSyncExternalStore용) ---
// localStorage는 외부 가변 상태라 컴포넌트에서 직접 읽으면 SSR/하이드레이션이
// 어긋난다. 구독 모델로 노출해 useSyncExternalStore가 안전하게 읽도록 한다.
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export const subscribeAccessToken = (onChange: () => void): (() => void) => {
  listeners.add(onChange);
  // 다른 탭에서의 로그인/로그아웃도 반영
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
};

/** 서버/하이드레이션 시점에는 아직 알 수 없음(undefined)으로 표시 */
export const getAccessTokenServerSnapshot = (): string | null | undefined =>
  undefined;

const apiUrl = (path: string) =>
  new URL(path, process.env.NEXT_PUBLIC_API_URL).toString();

/**
 * 현재 위치를 저장한 뒤 Google OAuth 로그인으로 이동한다.
 * 콜백(/oauth/callback)에서 returnTo 로 복귀한다.
 */
export const startGoogleLogin = (): void => {
  sessionStorage.setItem(
    RETURN_TO_KEY,
    window.location.pathname + window.location.search,
  );
  window.location.href = apiUrl("api/auth/login/google");
};

/** 현재 로그인한 사용자 정보 조회. 토큰이 없거나 만료면 UnauthorizedError. */
export const getMe = async (): Promise<AuthUser> => {
  const token = getAccessToken();
  if (!token) throw new UnauthorizedError("액세스 토큰이 없습니다.");

  const res = await fetch(apiUrl("api/auth/me"), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401 || res.status === 403) {
    throw new UnauthorizedError();
  }
  if (!res.ok) {
    throw new Error(`내 정보를 불러오지 못했습니다. (${res.status})`);
  }

  return res.json() as Promise<AuthUser>;
};
