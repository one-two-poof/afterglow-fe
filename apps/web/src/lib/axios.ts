/**
 * 공용 axios 클라이언트 + 인터셉터.
 * - 요청: localStorage 액세스 토큰이 있으면 Bearer 헤더로 자동 첨부
 * - 응답: 401/403은 UnauthorizedError로, 그 외 실패는 상태코드를 담은 Error로 정규화
 *
 * base URL이 둘이라 인스턴스를 분리한다:
 * - apiClient: 인증·경로 등 메인 BE (NEXT_PUBLIC_API_URL)
 * - aiClient : ML 추천 서버 (NEXT_PUBLIC_AI_API_URL)
 */
import axios, { AxiosError, type AxiosInstance } from "axios";

import { getAccessToken, UnauthorizedError } from "@/lib/auth";

const createClient = (
  baseURL: string | undefined,
  { withAuth = false }: { withAuth?: boolean } = {},
): AxiosInstance => {
  const client = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  });

  // 요청 인터셉터: withAuth인 클라이언트만 토큰이 있으면 Authorization 첨부
  // (aiClient는 CORS preflight 회피를 위해 인증 헤더를 붙이지 않음)
  if (withAuth) {
    client.interceptors.request.use((config) => {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // 응답 인터셉터: 에러를 앱 표준 형태로 정규화 (401/403 → UnauthorizedError)
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        return Promise.reject(new UnauthorizedError());
      }
      const message = status
        ? `요청 실패 (${status})`
        : "네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요.";
      return Promise.reject(new Error(message));
    },
  );

  return client;
};

/** 메인 BE (인증 필요 — 토큰 자동 첨부) */
export const apiClient = createClient(process.env.NEXT_PUBLIC_API_URL, {
  withAuth: true,
});

/** ML 추천 서버 (인증 필요 — 토큰 자동 첨부) */
export const aiClient = createClient(process.env.NEXT_PUBLIC_AI_API_URL, {
  withAuth: true,
});
