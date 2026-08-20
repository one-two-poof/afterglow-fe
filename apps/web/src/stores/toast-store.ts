import { create } from "zustand";

/** 앱 전역 토스트 (하단 중앙에 잠깐 뜨는 안내 문구). */
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
