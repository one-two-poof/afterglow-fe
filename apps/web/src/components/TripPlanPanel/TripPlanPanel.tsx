"use client";

import { Button } from "@afterglow/ui";
import { cn } from "@afterglow/utils";
import { ArrowLeft } from "lucide-react";
import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

import { type DateRange } from "@/components/Calendar";

import { ScheduleStep } from "./ScheduleStep";

export interface TripPlanPanelProps {
  open: boolean;
  onClose: () => void;
}

// 하이드레이션 안전한 "클라이언트 마운트됨" 플래그 (setState-in-effect 없이 포털 SSR 대응)
const emptySubscribe = () => () => {};
const useIsMounted = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

/**
 * 홈 지도 위 + 버튼으로 여는 슬라이드 인 폼 패널.
 * 다단계로 진행하며, 첫 단계에서 뒤로 가면 홈으로 닫힌다.
 */
export const TripPlanPanel = ({ open, onClose }: TripPlanPanelProps) => {
  const mounted = useIsMounted();
  const [step, setStep] = useState(0);
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  const panelRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  // 닫을 때 첫 단계로 초기화한 뒤 부모에 알림
  const handleClose = useCallback(() => {
    setStep(0);
    onClose();
  }, [onClose]);

  // Esc 닫기 + 바디 스크롤 잠금 + 열릴 때 포커스 이동/복원
  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const opener = document.activeElement as HTMLElement | null;
    backRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
      opener?.focus?.();
    };
  }, [open, handleClose]);

  if (!mounted) {
    return null;
  }

  // TODO: 이후 단계 확정 시 steps 확장 + 마지막 단계에서 폼 제출(API) 연결
  const steps = [
    {
      title: "여행 일정 선택",
      canNext: Boolean(range.start && range.end),
      content: <ScheduleStep value={range} onChange={setRange} />,
    },
    {
      title: "다음 단계",
      canNext: true,
      content: (
        <p className="p-5 text-body-md text-text-muted">
          다음 단계는 준비 중입니다.
        </p>
      ),
    },
  ];

  const current = steps[step]!;
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  const handleBack = () => {
    if (isFirst) {
      handleClose();
    } else {
      setStep((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (!isLast) {
      setStep((prev) => prev + 1);
    }
    // TODO: 마지막 단계에서 폼 제출
  };

  // 패널 내부로 포커스 가두기(Tab 순환)
  const handleTrap = (e: KeyboardEvent) => {
    if (e.key !== "Tab" || !panelRef.current) {
      return;
    }
    const focusables = panelRef.current.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])',
    );
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

  // 앱 프레임(태블릿 폭 컨테이너) 안으로 포털 → PC에서도 프레임 오른쪽에서 슬라이드
  const container = document.getElementById("app-frame") ?? document.body;

  return createPortal(
    <div
      inert={!open}
      className={cn(
        "absolute inset-0 z-50 overflow-hidden",
        !open && "pointer-events-none",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-neutral/40 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleTrap}
        className={cn(
          "absolute inset-y-0 right-0 flex h-full w-full flex-col bg-bg transition-transform duration-300 ease-out will-change-transform",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center gap-2 px-4 py-3">
          <button
            ref={backRef}
            type="button"
            aria-label={isFirst ? "홈으로 닫기" : "이전 단계"}
            onClick={handleBack}
            className="-ml-1 rounded-full p-1 text-text hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:outline-none"
          >
            <ArrowLeft size={22} />
          </button>
          <h2 id={titleId} className="text-heading-sm text-text">
            {current.title}
          </h2>
          {/* TODO: 프로필 아바타 연결 (현재 placeholder) */}
          <span
            aria-hidden="true"
            className="ml-auto flex size-8 items-center justify-center rounded-full bg-primary-100 text-label-sm text-primary-700"
          >
            이
          </span>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pb-4">{current.content}</div>

        <footer className="border-t border-border px-4 py-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!current.canNext}
            onClick={handleNext}
          >
            {isLast ? "완료" : "다음 단계로"}
          </Button>
        </footer>
      </div>
    </div>,
    container,
  );
};
