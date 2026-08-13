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

import { addDays, formatISODate, type DateRange } from "@/components/Calendar";

import { PlaceStep, type Place } from "./PlaceStep";
import { PurposeStep } from "./PurposeStep";
import { ScheduleStep } from "./ScheduleStep";
import { TreatmentDateStep } from "./TreatmentDateStep";
import { TreatmentStep } from "./TreatmentStep";
import { type TripPlanPayload } from "./types";
import { WalkPreferenceStep } from "./WalkPreferenceStep";

const MS_PER_DAY = 86400000;

/** 선택한 여행 기간의 일수(시작·종료일 포함). 미선택 시 0 */
const getDayCount = ({ start, end }: DateRange) =>
  start && end
    ? Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1
    : 0;

// TODO: 실제 추천 숙소 API 연동 시 교체 (lat/lon 포함해 내려받기)
const MOCK_PLACES: Place[] = [
  {
    id: "dormy",
    category: "숙소",
    name: "도미인 서울 강남",
    address: "서울 서초구 강남대로 415",
    lat: 37.5,
    lon: 127.026,
  },
  {
    id: "uandi",
    category: "숙소",
    name: "유앤아이 호텔 강남점",
    address: "서울 서초구 강남대로 421",
    lat: 37.503,
    lon: 127.024,
  },
];

/**
 * 현재 선택 상태를 제출 페이로드 형태로 조립.
 * 필수 값(여행 기간)이 없으면 null.
 */
const buildTripPlanPayload = (
  range: DateRange,
  placeIds: (string | null)[],
  places: Place[],
  treatments: string[],
  treatmentDates: Record<string, string>,
  userPurpose: string,
  userWalkPreference: number,
): TripPlanPayload | null => {
  const { start, end } = range;
  if (!start || !end) {
    return null;
  }

  const daily_starts: TripPlanPayload["daily_starts"] = [];
  placeIds.forEach((id, i) => {
    const place = id ? places.find((p) => p.id === id) : undefined;
    if (!place) {
      return;
    }
    daily_starts.push({
      date: formatISODate(addDays(start, i)),
      start_name: place.name,
      start_lat: place.lat,
      start_lon: place.lon,
    });
  });

  return {
    trip_start_date: formatISODate(start),
    trip_end_date: formatISODate(end),
    treatment: treatments
      .filter((name) => treatmentDates[name])
      .map((name) => ({ name, date: treatmentDates[name]! })),
    user_purpose: userPurpose,
    user_walk_preference: userWalkPreference,
    daily_starts,
  };
};

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
  // 선택한 시술 종류(한글)
  const [treatments, setTreatments] = useState<string[]>([]);
  // 시술 → 날짜("YYYY-MM-DD") 매칭 (같은 날짜에 여러 시술 가능)
  const [treatmentDates, setTreatmentDates] = useState<Record<string, string>>(
    {},
  );
  // 여행 주요 목적 (단일 선택)
  const [purpose, setPurpose] = useState<string | null>(null);
  // 도보 선호도 (1~5)
  const [walkPreference, setWalkPreference] = useState<number | null>(null);
  // 여행 일자별 선택 숙소 (인덱스 = n번째 날)
  const [placeIds, setPlaceIds] = useState<(string | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  // 닫을 때 첫 단계로 초기화한 뒤 부모에 알림
  const handleClose = useCallback(() => {
    setStep(0);
    setTreatments([]);
    setTreatmentDates({});
    setPurpose(null);
    setWalkPreference(null);
    setPlaceIds([]);
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

  // 여행 일수 및 일자 목록(시술 날짜 매칭 / 숙소 단계에서 사용)
  const dayCount = getDayCount(range);
  const tripDays = range.start
    ? Array.from({ length: dayCount }, (_, i) => addDays(range.start!, i))
    : [];
  const tripDayISO = tripDays.map(formatISODate);

  const toggleTreatment = (name: string) => {
    const isSelected = treatments.includes(name);
    setTreatments((prev) =>
      isSelected ? prev.filter((t) => t !== name) : [...prev, name],
    );
    // 해제 시 매칭된 날짜도 제거
    if (isSelected) {
      setTreatmentDates((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const assignTreatmentDate = (name: string, date: string) =>
    setTreatmentDates((prev) => ({ ...prev, [name]: date }));

  const selectPlace = (dayIndex: number, id: string) =>
    setPlaceIds((prev) => {
      const next = [...prev];
      next[dayIndex] = id;
      return next;
    });

  // 모든 선택 시술이 현재 여행 일자 내로 매칭되었는지
  const allTreatmentsDated =
    treatments.length > 0 &&
    treatments.every((t) => tripDayISO.includes(treatmentDates[t] ?? ""));

  const steps = [
    {
      title: "여행 일정 선택",
      canNext: Boolean(range.start && range.end),
      content: <ScheduleStep value={range} onChange={setRange} />,
    },
    {
      title: "시술 종류 선택",
      canNext: treatments.length > 0,
      content: <TreatmentStep selected={treatments} onToggle={toggleTreatment} />,
    },
    {
      title: "시술 날짜 선택",
      canNext: allTreatmentsDated,
      content: (
        <TreatmentDateStep
          treatments={treatments}
          days={tripDays}
          value={treatmentDates}
          onAssign={assignTreatmentDate}
        />
      ),
    },
    ...Array.from({ length: dayCount }, (_, i) => ({
      title: `숙소 선택 (${i + 1}/${dayCount})`,
      canNext: Boolean(placeIds[i]),
      content: (
        <PlaceStep
          places={MOCK_PLACES}
          selectedId={placeIds[i] ?? null}
          onSelect={(id) => selectPlace(i, id)}
        />
      ),
    })),
    {
      title: "여행 주요 목적 선택",
      canNext: Boolean(purpose),
      content: <PurposeStep value={purpose} onChange={setPurpose} />,
    },
    {
      title: "도보 선호도 선택",
      canNext: walkPreference !== null,
      content: (
        <WalkPreferenceStep value={walkPreference} onChange={setWalkPreference} />
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
      return;
    }
    // 마지막 단계 → 제출 페이로드 조립
    const payload = buildTripPlanPayload(
      range,
      placeIds,
      MOCK_PLACES,
      treatments,
      treatmentDates,
      purpose ?? "",
      walkPreference ?? 3,
    );
    if (!payload) {
      return;
    }
    // TODO: 실제 제출 API 연동 (현재는 페이로드 형태 확인용 로그)
    console.log("[TripPlan] submit payload", payload);
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
            {isLast ? "코스 추천 받기 ✨" : "다음 단계로"}
          </Button>
        </footer>
      </div>
    </div>,
    container,
  );
};
