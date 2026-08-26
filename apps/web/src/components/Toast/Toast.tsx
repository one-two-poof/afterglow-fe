"use client";

import { useEffect } from "react";

import { useToastStore } from "@afterglow/stores";

/** 앱 프레임 하단 중앙 토스트. 메시지가 설정되면 잠깐 보여주고 자동으로 사라진다. */
export const Toast = () => {
  const message = useToastStore((s) => s.message);
  const clear = useToastStore((s) => s.clear);

  useEffect(() => {
    if (!message) {
      return;
    }
    const id = setTimeout(clear, 2500);
    return () => clearTimeout(id);
  }, [message, clear]);

  if (!message) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-28 z-[60] flex justify-center px-5">
      <div
        role="status"
        className="rounded-full bg-neutral-900 px-4 py-2.5 text-label-md text-neutral-0 shadow-md"
      >
        {message}
      </div>
    </div>
  );
};
