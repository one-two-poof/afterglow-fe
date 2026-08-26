import { create } from "zustand";

/**
 * 앱 전역 토스트 (하단 중앙에 잠깐 뜨는 안내 문구).
 *
 * 순수 zustand 스토어라 플랫폼 중립 — 웹/앱이 공유한다. UI는 각 플랫폼이 이 스토어를
 * 구독해 따로 렌더한다(웹: div, 앱: Animated).
 */
interface ToastState {
  message: string | null;
  /** 토스트 표시 */
  show: (message: string) => void;
  /** 토스트 숨김 */
  clear: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  show: (message) => set({ message }),
  clear: () => set({ message: null }),
}));
