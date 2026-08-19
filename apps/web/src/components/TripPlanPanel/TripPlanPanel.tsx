"use client";

import { Button } from "@afterglow/ui";
import { cn } from "@afterglow/utils";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useAdoptedCoursesStore } from "@/stores/adopted-courses-store";

import { useFocusTrap } from "./hooks/use-focus-trap";
import { useIsMounted } from "./hooks/use-is-mounted";
import { useRecommendCourses } from "./hooks/use-recommend-courses";
import { useTripPlanForm } from "./hooks/use-trip-plan-form";
import { ResultStep } from "./ResultStep";

export interface TripPlanPanelProps {
  open: boolean;
  onClose: () => void;
}

/**
 * 홈 지도 위 + 버튼으로 여는 슬라이드 인 폼 패널.
 * 폼 작성 → 제출 → 추천 코스(rank) 브라우징 순으로 진행한다.
 */
export const TripPlanPanel = ({ open, onClose }: TripPlanPanelProps) => {
  const mounted = useIsMounted();

  // 폼 상태·단계는 훅이 소유. 여기서는 진행/제출만 오케스트레이션한다.
  const { steps, reset: resetForm, buildPayload } = useTripPlanForm();
  const [step, setStep] = useState(0);

  // 국면: 폼 작성 → 제출 후 결과(rank 브라우징)
  const [phase, setPhase] = useState<"form" | "result">("form");
  // 현재 보고 있는 rank 인덱스 (건너뛰기로 증가)
  const [rankIndex, setRankIndex] = useState(0);

  // ML ① 추천 코스: 폼 제출 mutation. 결과/로딩/에러를 여기서 관리한다.
  const recommendMutation = useRecommendCourses();
  const recommendations = recommendMutation.data ?? [];
  const { reset: resetRecommend } = recommendMutation;

  const adoptCourse = useAdoptedCoursesStore((s) => s.adopt);

  const panelRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const handleTrap = useFocusTrap(panelRef);

  // 닫을 때 폼·결과를 초기화한 뒤 부모에 알림
  const handleClose = useCallback(() => {
    setStep(0);
    setPhase("form");
    setRankIndex(0);
    resetForm();
    resetRecommend();
    onClose();
  }, [onClose, resetForm, resetRecommend]);

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

  const current = steps[step]!;
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  // 현재 결과 단계에서 보고 있는 코스 (모두 건너뛰면 undefined)
  const currentCourse = recommendations[rankIndex];

  const handleBack = () => {
    if (phase === "result") {
      // 결과 → 폼(마지막 단계)로 복귀
      setPhase("form");
      return;
    }
    if (isFirst) {
      handleClose();
    } else {
      setStep((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (!isLast) {
      setStep((prev) => prev + 1);
      return;
    }
    if (recommendMutation.isPending) {
      return;
    }
    const payload = buildPayload();
    if (!payload) {
      return;
    }
    // ML ① 추천 API 호출 (POST /api/course → daily_recommendations)
    recommendMutation.mutate(payload, {
      onSuccess: () => {
        setRankIndex(0);
        setPhase("result");
      },
    });
  };

  // 결과 단계: 현재 코스 채택 → "내 코스"에 담고 패널 종료
  const handleAdopt = () => {
    if (!currentCourse) {
      return;
    }
    adoptCourse(currentCourse);
    // TODO: ② 저장 API 호출 (선정 코스의 daily_schedules 전송 → 서버 영속화)
    handleClose();
  };

  // 결과 단계: 건너뛰기 → 다음 rank
  const handleSkip = () => setRankIndex((prev) => prev + 1);

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
            aria-label={
              phase === "result"
                ? "이전으로"
                : isFirst
                  ? "홈으로 닫기"
                  : "이전 단계"
            }
            onClick={handleBack}
            className="-ml-1 rounded-full p-1 text-text hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:outline-none"
          >
            <ArrowLeft size={22} />
          </button>
          <h2 id={titleId} className="text-heading-sm text-text">
            {phase === "result" ? "추천 코스" : current.title}
          </h2>
          {/* TODO: 프로필 아바타 연결 (현재 placeholder) */}
          <span
            aria-hidden="true"
            className="ml-auto flex size-8 items-center justify-center rounded-full bg-primary-100 text-label-sm text-primary-700"
          >
            이
          </span>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {phase === "result" ? (
            currentCourse ? (
              <ResultStep
                course={currentCourse}
                index={rankIndex}
                total={recommendations.length}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                <p className="text-body-md text-text">
                  추천 코스를 모두 확인했어요
                </p>
                <p className="text-body-sm text-text-muted">
                  마음에 드는 코스가 없으면 조건을 바꿔 다시 시도해보세요.
                </p>
              </div>
            )
          ) : (
            current.content
          )}
        </div>

        <footer className="border-t border-border px-4 py-3">
          {phase === "result" ? (
            currentCourse ? (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                  onClick={handleSkip}
                >
                  건너뛰기
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  onClick={handleAdopt}
                >
                  이 코스 채택
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleClose}
              >
                닫기
              </Button>
            )
          ) : (
            <>
              {recommendMutation.isError && (
                <p
                  role="alert"
                  className="mb-2 text-center text-body-sm text-error"
                >
                  {recommendMutation.error instanceof Error
                    ? recommendMutation.error.message
                    : "코스 추천에 실패했어요. 잠시 후 다시 시도해주세요."}
                </p>
              )}
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={!current.canNext || recommendMutation.isPending}
                onClick={handleNext}
              >
                {isLast
                  ? recommendMutation.isPending
                    ? "코스 추천 받는 중…"
                    : "코스 추천 받기"
                  : "다음 단계로"}
              </Button>
            </>
          )}
        </footer>
      </div>
    </div>,
    container,
  );
};
