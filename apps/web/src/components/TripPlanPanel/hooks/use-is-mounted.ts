"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * 하이드레이션 안전한 "클라이언트 마운트됨" 플래그.
 * setState-in-effect 없이 포털 SSR 대응용.
 */
export const useIsMounted = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
