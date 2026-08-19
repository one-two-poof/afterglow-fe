"use client";

import { KeyboardEvent, type RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

/**
 * 컨테이너 내부로 포커스를 가두는(Tab 순환) 키다운 핸들러를 만든다.
 * 반환값을 대상 요소의 onKeyDown에 연결해 사용한다.
 */
export const useFocusTrap = (containerRef: RefObject<HTMLElement | null>) => {
  return (e: KeyboardEvent) => {
    if (e.key !== "Tab" || !containerRef.current) {
      return;
    }
    const focusables =
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusables.length === 0) {
      return;
    }
    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
};
