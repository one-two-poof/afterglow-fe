"use client";

import { useSyncExternalStore } from "react";
import {
  getAccessToken,
  getAccessTokenServerSnapshot,
  subscribeAccessToken,
} from "@/lib/auth";

/**
 * 액세스 토큰을 반응형으로 읽는다.
 * - `undefined` : 아직 확인 전(SSR/하이드레이션) → 로딩 스켈레톤
 * - `null`      : 토큰 없음 → 로그인 안내
 * - `string`    : 로그인됨
 */
export const useAccessToken = (): string | null | undefined =>
  useSyncExternalStore(
    subscribeAccessToken,
    getAccessToken,
    getAccessTokenServerSnapshot,
  );
